import { Router, Request, Response, NextFunction } from 'express';
import { verifyFirebaseToken, requireRole, type AuthenticatedRequest } from '../lib/firebase-admin';
import { db } from '../db';
import { 
  users, submissions, judgeAssignments, evaluationCriteria, scores, 
  teams, events, rubrics, rubricCriteria 
} from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Helper function to handle async routes
const asyncHandler = (fn: (req: Request, res: Response, next?: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Validation schema for scoring with rubric criteria
const scoreSubmissionSchema = z.object({
  submission_id: z.string().uuid('Invalid submission ID'),
  round: z.number().int().min(1).max(10),
  items: z.array(z.object({
    criteria_key: z.string().min(1, 'Criteria key is required'),
    score: z.number().min(0).max(10),
    comment: z.string().optional(),
  })).min(1, 'At least one criteria score required'),
  feedback: z.string().optional(),
});

// GET /api/judging/events/:id/round/:n - Get assigned submissions for judge in specific round
router.get('/events/:eventId/round/:round',
  verifyFirebaseToken,
  requireRole(['judge']),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { eventId, round } = req.params;
      const judgeFirebaseUid = req.user!.firebaseUid || req.user!.userId;
      
      // Validate round number
      const roundNumber = parseInt(round);
      if (isNaN(roundNumber) || roundNumber < 1) {
        return res.status(400).json({
          error: 'Invalid round',
          message: 'Round must be a positive integer'
        });
      }

      // Get judge user
      const [judge] = await db
        .select()
        .from(users)
        .where(eq(users.firebaseUid, judgeFirebaseUid))
        .limit(1);

      if (!judge) {
        return res.status(404).json({
          error: 'Judge not found',
          message: 'Please complete registration first'
        });
      }

      // Verify judge is assigned to this event
      const [judgeAssignment] = await db
        .select()
        .from(judgeAssignments)
        .where(
          and(
            eq(judgeAssignments.eventId, eventId),
            eq(judgeAssignments.judgeId, judge.id)
          )
        )
        .limit(1);

      if (!judgeAssignment) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You are not assigned as a judge for this event'
        });
      }

      // Get event details
      const [event] = await db
        .select()
        .from(events)
        .where(eq(events.id, eventId))
        .limit(1);

      if (!event) {
        return res.status(404).json({
          error: 'Event not found',
          message: 'The specified event does not exist'
        });
      }

      // Get rubric criteria for this event
      const rubric = await db
        .select()
        .from(rubrics)
        .where(eq(rubrics.eventId, eventId))
        .limit(1);

      if (!rubric.length) {
        return res.status(404).json({
          error: 'No rubric found',
          message: 'No rubric has been created for this event yet'
        });
      }

      const criteria = await db
        .select()
        .from(rubricCriteria)
        .where(eq(rubricCriteria.rubricId, rubric[0].id))
        .orderBy(rubricCriteria.displayOrder);

      // Get submissions for this event with team and existing scores
      const eventSubmissions = await db
        .select({
          id: submissions.id,
          title: submissions.title,
          repoUrl: submissions.repoUrl,
          demoUrl: submissions.demoUrl,
          fileUrl: submissions.fileUrl,
          fileName: submissions.fileName,
          submittedAt: submissions.createdAt,
          teamId: teams.id,
          teamName: teams.name,
          submittedByName: users.name,
        })
        .from(submissions)
        .innerJoin(teams, eq(teams.id, submissions.teamId))
        .innerJoin(users, eq(users.id, submissions.submittedById))
        .where(eq(submissions.eventId, eventId))
        .orderBy(desc(submissions.createdAt));

      // Get existing scores for this judge and round
      const existingScores = await db
        .select({
          submissionId: scores.submissionId,
          criteriaId: scores.criteriaId,
          rubricCriteriaId: scores.rubricCriteriaId,
          score: scores.score,
          feedback: scores.feedback,
          comment: scores.comment,
        })
        .from(scores)
        .where(
          and(
            eq(scores.judgeId, judge.id),
            eq(scores.round, roundNumber),
            sql`${scores.submissionId} IN (${sql.raw(
              eventSubmissions.map(s => `'${s.id}'`).join(',') || "''"
            )})`
          )
        );

      // Create a mapping from criteria IDs to keys for existing scores
      const criteriaIdToKey = new Map(criteria.map((c: any) => [c.id, c.key]));

      // Build submissions with scoring status
      const submissionsWithScores = eventSubmissions.map(submission => {
        const submissionScores = existingScores.filter(s => s.submissionId === submission.id);
        const scoredCriteria = submissionScores.length;
        const totalCriteria = criteria.length;
        const isComplete = scoredCriteria === totalCriteria && totalCriteria > 0;

        return {
          id: submission.id,
          title: submission.title,
          repo_url: submission.repoUrl,
          demo_url: submission.demoUrl,
          file_url: submission.fileUrl,
          file_name: submission.fileName,
          submitted_at: submission.submittedAt,
          team: {
            id: submission.teamId,
            name: submission.teamName,
          },
          submitted_by: submission.submittedByName,
          scoring_status: {
            is_complete: isComplete,
            scored_criteria: scoredCriteria,
            total_criteria: totalCriteria,
          },
          existing_scores: submissionScores.map(score => ({
            criteria_key: criteriaIdToKey.get(score.rubricCriteriaId || score.criteriaId),
            criteria_id: score.criteriaId, // For backward compatibility
            score: parseFloat(score.score),
            feedback: score.feedback,
            comment: score.comment,
          })),
        };
      });

      res.status(200).json({
        data: {
          event: {
            id: event.id,
            title: event.title,
            description: event.description,
          },
          round: roundNumber,
          criteria: criteria.map(c => ({
            id: c.id,
            key: c.key,
            label: c.label,
            description: c.description || '',
            weight: c.weight,
            display_order: c.displayOrder,
          })),
          submissions: submissionsWithScores,
          total_submissions: submissionsWithScores.length,
          completed_submissions: submissionsWithScores.filter(s => s.scoring_status.is_complete).length,
        },
        message: `Retrieved ${submissionsWithScores.length} submissions for round ${roundNumber}`
      });

    } catch (error) {
      console.error('Get judging submissions error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve submissions for judging'
      });
    }
  })
);

// POST /api/judging/scores - Submit scores for a submission
router.post('/scores',
  verifyFirebaseToken,
  requireRole(['judge']),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const judgeFirebaseUid = req.user!.firebaseUid || req.user!.userId;
      
      // Validate input
      const validatedData = scoreSubmissionSchema.parse(req.body);
      const { submission_id, round, items, feedback } = validatedData;

      // Get judge user
      const [judge] = await db
        .select()
        .from(users)
        .where(eq(users.firebaseUid, judgeFirebaseUid))
        .limit(1);

      if (!judge) {
        return res.status(404).json({
          error: 'Judge not found',
          message: 'Please complete registration first'
        });
      }

      // Get submission and verify it exists
      const [submission] = await db
        .select({
          id: submissions.id,
          eventId: submissions.eventId,
          title: submissions.title,
        })
        .from(submissions)
        .where(eq(submissions.id, submission_id))
        .limit(1);

      if (!submission) {
        return res.status(404).json({
          error: 'Submission not found',
          message: 'The specified submission does not exist'
        });
      }

      // Verify judge is assigned to this event
      const [judgeAssignment] = await db
        .select()
        .from(judgeAssignments)
        .where(
          and(
            eq(judgeAssignments.eventId, submission.eventId),
            eq(judgeAssignments.judgeId, judge.id)
          )
        )
        .limit(1);

      if (!judgeAssignment) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You are not assigned as a judge for this event'
        });
      }

      // Get rubric criteria for this event to validate against
      const eventRubric = await db
        .select()
        .from(rubrics)
        .where(eq(rubrics.eventId, submission.eventId))
        .limit(1);

      if (!eventRubric.length) {
        return res.status(404).json({
          error: 'No rubric found',
          message: 'No rubric has been created for this event yet'
        });
      }

      const eventCriteria = await db
        .select({ key: rubricCriteria.key, id: rubricCriteria.id, weight: rubricCriteria.weight })
        .from(rubricCriteria)
        .where(eq(rubricCriteria.rubricId, eventRubric[0].id));

      const validCriteriaKeys = new Set(eventCriteria.map(c => c.key));
      const invalidCriteria = items.filter(item => !validCriteriaKeys.has(item.criteria_key));
      
      if (invalidCriteria.length > 0) {
        return res.status(400).json({
          error: 'Invalid criteria',
          message: `Invalid criteria keys: ${invalidCriteria.map(c => c.criteria_key).join(', ')}`
        });
      }

      // Delete existing scores for this submission/judge/round combination
      await db
        .delete(scores)
        .where(
          and(
            eq(scores.submissionId, submission_id),
            eq(scores.judgeId, judge.id),
            eq(scores.round, round)
          )
        );

      // Create a mapping from criteria keys to criteria IDs
      const criteriaKeyToId = new Map(eventCriteria.map(c => [c.key, c.id]));

      // Insert new scores with rubric criteria mapping
      const scoreInserts = items.map(item => {
        const criteriaId = criteriaKeyToId.get(item.criteria_key);
        if (!criteriaId) {
          throw new Error(`Criteria key ${item.criteria_key} not found`);
        }
        return {
          submissionId: submission_id,
          judgeId: judge.id,
          criteriaId: criteriaId, // Legacy field for compatibility
          rubricCriteriaId: criteriaId,
          round,
          score: item.score.toString(),
          feedback: feedback || null,
          comment: item.comment || null,
        };
      });

      await db.insert(scores).values(scoreInserts);

      // Calculate weighted aggregate score for this round
      const totalWeightedScore = items.reduce((sum, item) => {
        const criteriaWeight = eventCriteria.find(c => c.key === item.criteria_key)?.weight || 1;
        return sum + (item.score * criteriaWeight);
      }, 0);
      
      const totalWeight = items.reduce((sum, item) => {
        const criteriaWeight = eventCriteria.find(c => c.key === item.criteria_key)?.weight || 1;
        return sum + criteriaWeight;
      }, 0);
      
      const aggregateScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
      
      // Broadcast leaderboard update via Socket.IO
      try {
        const { broadcastLeaderboardUpdate } = await import('./leaderboard');
        
        // Get team info for broadcast
        const [teamInfo] = await db
          .select({
            teamId: submissions.teamId,
            teamName: teams.name,
            submissionId: submissions.id,
          })
          .from(submissions)
          .innerJoin(teams, eq(submissions.teamId, teams.id))
          .where(eq(submissions.id, submission_id))
          .limit(1);
        
        if (teamInfo) {
          broadcastLeaderboardUpdate(submission.eventId, round, {
            teamId: teamInfo.teamId,
            teamName: teamInfo.teamName,
            submissionId: teamInfo.submissionId,
            aggregateScore: Math.round(aggregateScore * 100) / 100
          });
        }
      } catch (broadcastError) {
        console.error('Failed to broadcast leaderboard update:', broadcastError);
        // Continue even if broadcast fails
      }

      res.status(200).json({
        data: {
          submission_id,
          judge_id: judge.id,
          round,
          scores_saved: items.length,
          aggregate_score: Math.round(aggregateScore * 100) / 100,
          feedback_provided: !!feedback,
        },
        message: `Successfully saved ${items.length} scores for submission "${submission.title}"`
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          message: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        });
      }

      console.error('Submit scores error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to save scores'
      });
    }
  })
);

// GET /api/judging/events/:eventId/aggregates - Get scoring aggregates for organizers
router.get('/events/:eventId/aggregates',
  verifyFirebaseToken,
  requireRole(['organizer']),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { eventId } = req.params;
      const { round } = req.query;
      
      // Get event and verify organizer ownership
      const organizerFirebaseUid = req.user!.firebaseUid || req.user!.userId;
      const [organizer] = await db
        .select()
        .from(users)
        .where(eq(users.firebaseUid, organizerFirebaseUid))
        .limit(1);

      if (!organizer) {
        return res.status(404).json({
          error: 'User not found',
          message: 'Please complete registration first'
        });
      }

      const [event] = await db
        .select()
        .from(events)
        .where(
          and(
            eq(events.id, eventId),
            eq(events.organizerId, organizer.id)
          )
        )
        .limit(1);

      if (!event) {
        return res.status(404).json({
          error: 'Event not found',
          message: 'Event not found or you do not have permission to view it'
        });
      }

      // Build query for aggregate scores
      let whereConditions = [eq(scores.submissionId, submissions.id)];
      if (round) {
        const roundNumber = parseInt(round as string);
        if (!isNaN(roundNumber)) {
          whereConditions.push(eq(scores.round, roundNumber));
        }
      }

      // Get submissions with aggregate scores
      const aggregates = await db
        .select({
          submissionId: submissions.id,
          submissionTitle: submissions.title,
          teamId: teams.id,
          teamName: teams.name,
          round: scores.round,
          avgScore: sql<number>`AVG(${scores.score}::numeric)`.as('avg_score'),
          maxScore: sql<number>`MAX(${scores.score}::numeric)`.as('max_score'),
          minScore: sql<number>`MIN(${scores.score}::numeric)`.as('min_score'),
          scoreCount: sql<number>`COUNT(${scores.score})`.as('score_count'),
          judgeCount: sql<number>`COUNT(DISTINCT ${scores.judgeId})`.as('judge_count'),
        })
        .from(submissions)
        .innerJoin(teams, eq(teams.id, submissions.teamId))
        .leftJoin(scores, and(...whereConditions))
        .where(eq(submissions.eventId, eventId))
        .groupBy(
          submissions.id, 
          submissions.title, 
          teams.id, 
          teams.name, 
          scores.round
        )
        .orderBy(desc(sql`AVG(${scores.score}::numeric)`));

      // Group by round if multiple rounds
      const roundAggregates: { [round: number]: any[] } = {};
      
      aggregates.forEach(agg => {
        if (agg.round === null) return; // Skip submissions without scores
        
        if (!roundAggregates[agg.round]) {
          roundAggregates[agg.round] = [];
        }
        
        roundAggregates[agg.round].push({
          submission: {
            id: agg.submissionId,
            title: agg.submissionTitle,
          },
          team: {
            id: agg.teamId,
            name: agg.teamName,
          },
          aggregate_score: agg.avgScore ? Math.round(parseFloat(agg.avgScore.toString()) * 100) / 100 : null,
          max_score: agg.maxScore ? parseFloat(agg.maxScore.toString()) : null,
          min_score: agg.minScore ? parseFloat(agg.minScore.toString()) : null,
          total_scores: parseInt(agg.scoreCount.toString()),
          judges_scored: parseInt(agg.judgeCount.toString()),
        });
      });

      // Get total judge count for completion tracking
      const [judgeCount] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(judgeAssignments)
        .where(eq(judgeAssignments.eventId, eventId));

      const totalJudges = parseInt(judgeCount.count.toString());

      res.status(200).json({
        data: {
          event: {
            id: event.id,
            title: event.title,
          },
          total_judges: totalJudges,
          rounds: Object.keys(roundAggregates).map(roundNum => ({
            round: parseInt(roundNum),
            submissions: roundAggregates[parseInt(roundNum)],
            completed_submissions: roundAggregates[parseInt(roundNum)].filter(
              s => s.judges_scored === totalJudges
            ).length,
            total_submissions: roundAggregates[parseInt(roundNum)].length,
          })),
        },
        message: `Retrieved scoring aggregates for ${Object.keys(roundAggregates).length} rounds`
      });

    } catch (error) {
      console.error('Get scoring aggregates error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve scoring aggregates'
      });
    }
  })
);

// Error handler middleware
router.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Judging API Error:', error);
  
  if (error.code === 'ECONNREFUSED') {
    return res.status(503).json({
      error: 'Database unavailable',
      message: 'Unable to connect to database. Please try again later.'
    });
  }
  
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
});

export default router;