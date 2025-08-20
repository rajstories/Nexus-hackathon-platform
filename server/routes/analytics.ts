import express from 'express';
import { db } from '../db';
import mongoose from 'mongoose';

const router = express.Router();

// GET /api/analytics/:eventId - Get event analytics
router.get('/analytics/:eventId', async (req, res) => {
  try {
    const startTime = Date.now();
    const eventId = parseInt(req.params.eventId);
    
    // Parallel queries for better performance
    const [
      registrationsData,
      teamsData,
      submissionsData,
      scoresData,
      chatVolumeData
    ] = await Promise.all([
      // 1. Registrations over time (last 7 days)
      db.execute(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM teams
        WHERE event_id = ${eventId}
          AND created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `),
      
      // 2. Active teams count
      db.execute(`
        SELECT 
          COUNT(DISTINCT t.id) as active_teams,
          COUNT(DISTINCT CASE WHEN s.id IS NOT NULL THEN t.id END) as teams_with_submissions
        FROM teams t
        LEFT JOIN submissions s ON t.id = s.team_id
        WHERE t.event_id = ${eventId}
      `),
      
      // 3. Submissions per track
      db.execute(`
        SELECT 
          t.name as track_name,
          COUNT(s.id) as submission_count
        FROM tracks t
        LEFT JOIN submissions s ON t.id = s.track_id
        WHERE t.event_id = ${eventId}
        GROUP BY t.id, t.name
        ORDER BY submission_count DESC
      `),
      
      // 4. Average score per track
      db.execute(`
        SELECT 
          t.name as track_name,
          ROUND(AVG(e.total_score), 2) as avg_score,
          COUNT(DISTINCT e.submission_id) as evaluated_count
        FROM tracks t
        LEFT JOIN submissions s ON t.id = s.track_id
        LEFT JOIN evaluations e ON s.id = e.submission_id
        WHERE t.event_id = ${eventId}
          AND e.total_score IS NOT NULL
        GROUP BY t.id, t.name
        ORDER BY avg_score DESC
      `),
      
      // 5. Chat volume from MongoDB (if available)
      getChatVolume(eventId)
    ]);

    // Format registrations timeline
    const registrations = registrationsData.rows?.map((row: any) => ({
      date: new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: parseInt(row.count)
    })) || [];

    // Fill missing dates with 0
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const allDates: any[] = [];
    
    for (let d = new Date(sevenDaysAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const existing = registrations.find(r => r.date === dateStr);
      allDates.push({
        date: dateStr,
        count: existing ? existing.count : 0
      });
    }

    // Format team stats
    const teamStats: any = teamsData.rows?.[0] || { active_teams: 0, teams_with_submissions: 0 };

    // Format submissions per track
    const submissionsPerTrack = submissionsData.rows?.map((row: any) => ({
      track: row.track_name || 'Unknown',
      count: parseInt(row.submission_count)
    })) || [];

    // Format average scores
    const avgScorePerTrack = scoresData.rows?.map((row: any) => ({
      track: row.track_name || 'Unknown',
      avgScore: parseFloat(row.avg_score) || 0,
      evaluated: parseInt(row.evaluated_count) || 0
    })) || [];

    const responseTime = Date.now() - startTime;

    res.json({
      success: true,
      responseTimeMs: responseTime,
      data: {
        registrations: allDates,
        teams: {
          total: parseInt(teamStats.active_teams || 0),
          withSubmissions: parseInt(teamStats.teams_with_submissions || 0),
          submissionRate: teamStats.active_teams > 0 
            ? Math.round((teamStats.teams_with_submissions / teamStats.active_teams) * 100)
            : 0
        },
        submissionsPerTrack,
        avgScorePerTrack,
        chatVolume: chatVolumeData
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper function to get chat volume from MongoDB
async function getChatVolume(eventId: number) {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return {
        announcements: 0,
        messages: 0,
        total: 0
      };
    }

    const db = mongoose.connection.db;
    if (!db) {
      return {
        announcements: 0,
        messages: 0,
        total: 0
      };
    }
    
    // Count announcements
    const announcements = await db.collection('announcements')
      .countDocuments({ eventId: eventId.toString() });
    
    // Count Q&A messages
    const qaMessages = await db.collection('qa_messages')
      .countDocuments({ eventId: eventId.toString() });

    return {
      announcements,
      messages: qaMessages,
      total: announcements + qaMessages
    };
  } catch (error) {
    console.error('Error fetching chat volume:', error);
    return {
      announcements: 0,
      messages: 0,
      total: 0
    };
  }
}

export default router;