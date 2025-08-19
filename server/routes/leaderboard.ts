import express from 'express';
import { query } from '../db/sql';
import { socketService } from '../lib/socketService';

const router = express.Router();

interface LeaderboardEntry {
  teamId: string;
  teamName: string;
  submissionId: string;
  projectTitle: string;
  trackId: string;
  trackName: string;
  aggregateScore: number;
  totalScore: number;
  averageScore: number;
  judgesCompleted: number;
  totalJudges: number;
  rank?: number;
  previousRank?: number;
  scoreChange?: number;
}

// Get leaderboard for a specific event and round
router.get('/:eventId/round/:roundNumber', async (req, res) => {
  try {
    const { eventId, roundNumber } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    
    console.log(`Fetching leaderboard for event ${eventId}, round ${roundNumber}`);
    
    // Get leaderboard data from SQL with aggregate scores
    const leaderboardQuery = `
      WITH scores_agg AS (
        SELECT 
          s.submission_id,
          s.round_number,
          AVG(s.score) as avg_score,
          SUM(s.score) as total_score,
          COUNT(DISTINCT s.judge_id) as judges_completed,
          MIN(s.score) as min_score,
          MAX(s.score) as max_score
        FROM scores s
        WHERE s.event_id = @eventId 
          AND s.round_number = @roundNumber
        GROUP BY s.submission_id, s.round_number
      ),
      judge_count AS (
        SELECT 
          ja.event_id,
          COUNT(DISTINCT ja.judge_id) as total_judges
        FROM judge_assignments ja
        WHERE ja.event_id = @eventId
        GROUP BY ja.event_id
      ),
      leaderboard AS (
        SELECT 
          sub.id as submission_id,
          sub.team_id,
          t.name as team_name,
          sub.project_title,
          sub.track_id,
          tr.name as track_name,
          COALESCE(sa.avg_score, 0) as average_score,
          COALESCE(sa.total_score, 0) as total_score,
          COALESCE(sa.avg_score, 0) as aggregate_score,
          COALESCE(sa.judges_completed, 0) as judges_completed,
          COALESCE(jc.total_judges, 0) as total_judges,
          COALESCE(sa.min_score, 0) as min_score,
          COALESCE(sa.max_score, 0) as max_score
        FROM submissions sub
        INNER JOIN teams t ON sub.team_id = t.id
        LEFT JOIN tracks tr ON sub.track_id = tr.id
        LEFT JOIN scores_agg sa ON sa.submission_id = sub.id
        CROSS JOIN judge_count jc
        WHERE sub.event_id = @eventId
      )
      SELECT 
        *,
        DENSE_RANK() OVER (ORDER BY aggregate_score DESC, team_name ASC) as rank
      FROM leaderboard
      ORDER BY aggregate_score DESC, team_name ASC
      LIMIT @limit
    `;
    
    const result = await query(leaderboardQuery, {
      eventId: eventId,
      roundNumber: parseInt(roundNumber),
      limit: limit
    });
    
    const leaderboard: LeaderboardEntry[] = result.recordset.map((row: any) => ({
      teamId: row.team_id,
      teamName: row.team_name,
      submissionId: row.submission_id,
      projectTitle: row.project_title,
      trackId: row.track_id,
      trackName: row.track_name || 'General',
      aggregateScore: parseFloat(row.aggregate_score) || 0,
      totalScore: parseFloat(row.total_score) || 0,
      averageScore: parseFloat(row.average_score) || 0,
      judgesCompleted: row.judges_completed || 0,
      totalJudges: row.total_judges || 0,
      rank: row.rank || 0
    }));
    
    res.json({
      eventId,
      roundNumber: parseInt(roundNumber),
      leaderboard,
      totalTeams: leaderboard.length,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      error: 'Failed to fetch leaderboard',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get round status (is it finalized?)
router.get('/:eventId/round/:roundNumber/status', async (req, res) => {
  try {
    const { eventId, roundNumber } = req.params;
    
    // Check if round is finalized in SQL database
    const result = await query(`
      SELECT 
        is_finalized,
        finalized_at,
        finalized_by
      FROM round_status
      WHERE event_id = @eventId 
        AND round_number = @roundNumber
    `, {
      eventId: eventId,
      roundNumber: parseInt(roundNumber)
    });
    
    const isFinalized = result.recordset[0]?.is_finalized || false;
    
    res.json({
      eventId,
      roundNumber: parseInt(roundNumber),
      isFinalized,
      finalizedAt: result.recordset[0]?.finalized_at || null
    });
    
  } catch (error) {
    console.error('Error checking round status:', error);
    res.status(500).json({
      error: 'Failed to check round status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Finalize a round (organizer only)
router.post('/:eventId/round/:roundNumber/finalize', async (req, res) => {
  try {
    const { eventId, roundNumber } = req.params;
    
    // TODO: Add authentication check for organizer role
    // if (req.user?.role !== 'organizer') {
    //   return res.status(403).json({ error: 'Only organizers can finalize rounds' });
    // }
    
    // Check if already finalized
    const checkResult = await query(`
      SELECT is_finalized 
      FROM round_status 
      WHERE event_id = @eventId AND round_number = @roundNumber
    `, {
      eventId: eventId,
      roundNumber: parseInt(roundNumber)
    });
    
    if (checkResult.recordset[0]?.is_finalized) {
      return res.status(400).json({ error: 'Round already finalized' });
    }
    
    // Insert or update round status
    await query(`
      MERGE round_status AS target
      USING (SELECT @eventId AS event_id, @roundNumber AS round_number) AS source
      ON target.event_id = source.event_id AND target.round_number = source.round_number
      WHEN MATCHED THEN
        UPDATE SET 
          is_finalized = 1,
          finalized_at = GETDATE(),
          finalized_by = @organizerId
      WHEN NOT MATCHED THEN
        INSERT (event_id, round_number, is_finalized, finalized_at, finalized_by)
        VALUES (@eventId, @roundNumber, 1, GETDATE(), @organizerId);
    `, {
      eventId: eventId,
      roundNumber: parseInt(roundNumber),
      organizerId: 'organizer-uid' // TODO: Get from req.user
    });
    
    // Broadcast round finalization via Socket.IO
    if (socketService && socketService.broadcastToEvent) {
      socketService.broadcastToEvent(eventId, 'round-finalized', {
        eventId,
        roundNumber: parseInt(roundNumber),
        finalizedAt: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      eventId,
      roundNumber: parseInt(roundNumber),
      finalizedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error finalizing round:', error);
    res.status(500).json({
      error: 'Failed to finalize round',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Broadcast leaderboard update helper function
export function broadcastLeaderboardUpdate(eventId: string, roundNumber: number, updatedTeam: any) {
  if (socketService && socketService.broadcastToEvent) {
    socketService.broadcastToEvent(eventId, 'leaderboard-update', {
      eventId,
      roundNumber,
      updatedTeam,
      timestamp: new Date().toISOString()
    });
  }
}

export default router;