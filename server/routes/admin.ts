import { Router, Request, Response, NextFunction } from 'express';
import { verifyFirebaseToken, requireRole, type AuthenticatedRequest } from '../lib/firebase-admin';
import { db } from '../db';
import { 
  users, events, judgeAssignments, evaluationCriteria 
} from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { seedDemoData, clearDemoData } from '../../scripts/demo';

const router = Router();

// Helper function to handle async routes
const asyncHandler = (fn: (req: Request, res: Response, next?: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Validation schemas
const assignJudgeSchema = z.object({
  judge_email: z.string().email('Invalid email address'),
});

const createCriteriaSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  max_score: z.number().int().min(1).max(100).default(10),
  weight: z.number().min(0.1).max(10).default(1),
  display_order: z.number().int().min(0).default(0),
});

// POST /api/admin/events/:eventId/judges - Assign judge to event
router.post('/events/:eventId/judges',
  verifyFirebaseToken,
  requireRole(['organizer']),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { eventId } = req.params;
      const organizerFirebaseUid = req.user!.firebaseUid || req.user!.userId;
      
      const { judge_email } = assignJudgeSchema.parse(req.body);

      // Get organizer
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

      // Verify event ownership
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
          message: 'Event not found or you do not have permission to modify it'
        });
      }

      // Find judge by email
      const [judge] = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.email, judge_email),
            eq(users.role, 'judge')
          )
        )
        .limit(1);

      if (!judge) {
        return res.status(404).json({
          error: 'Judge not found',
          message: 'No judge found with that email address'
        });
      }

      // Check if already assigned
      const [existingAssignment] = await db
        .select()
        .from(judgeAssignments)
        .where(
          and(
            eq(judgeAssignments.eventId, eventId),
            eq(judgeAssignments.judgeId, judge.id)
          )
        )
        .limit(1);

      if (existingAssignment) {
        return res.status(400).json({
          error: 'Judge already assigned',
          message: 'This judge is already assigned to this event'
        });
      }

      // Create assignment
      const [newAssignment] = await db
        .insert(judgeAssignments)
        .values({
          eventId,
          judgeId: judge.id,
        })
        .returning();

      res.status(201).json({
        data: {
          id: newAssignment.id,
          event_id: eventId,
          judge: {
            id: judge.id,
            name: judge.name,
            email: judge.email,
          },
          assigned_at: newAssignment.assignedAt,
        },
        message: `Judge ${judge.name} assigned to event successfully`
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          message: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        });
      }

      console.error('Assign judge error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to assign judge'
      });
    }
  })
);

// POST /api/admin/events/:eventId/criteria - Create evaluation criteria
router.post('/events/:eventId/criteria',
  verifyFirebaseToken,
  requireRole(['organizer']),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { eventId } = req.params;
      const organizerFirebaseUid = req.user!.firebaseUid || req.user!.userId;
      
      const criteriaData = createCriteriaSchema.parse(req.body);

      // Get organizer
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

      // Verify event ownership
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
          message: 'Event not found or you do not have permission to modify it'
        });
      }

      // Create criteria
      const [newCriteria] = await db
        .insert(evaluationCriteria)
        .values({
          eventId,
          name: criteriaData.name,
          description: criteriaData.description || null,
          maxScore: criteriaData.max_score,
          weight: criteriaData.weight.toString(),
          displayOrder: criteriaData.display_order,
        })
        .returning();

      res.status(201).json({
        data: {
          id: newCriteria.id,
          event_id: eventId,
          name: newCriteria.name,
          description: newCriteria.description,
          max_score: newCriteria.maxScore,
          weight: parseFloat(newCriteria.weight),
          display_order: newCriteria.displayOrder,
          created_at: newCriteria.createdAt,
        },
        message: `Evaluation criteria "${newCriteria.name}" created successfully`
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          message: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        });
      }

      console.error('Create criteria error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create evaluation criteria'
      });
    }
  })
);

// GET /api/admin/events/:eventId/setup - Get event judging setup
router.get('/events/:eventId/setup',
  verifyFirebaseToken,
  requireRole(['organizer']),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { eventId } = req.params;
      const organizerFirebaseUid = req.user!.firebaseUid || req.user!.userId;

      // Get organizer
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

      // Verify event ownership
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

      // Get assigned judges
      const assignedJudges = await db
        .select({
          id: judgeAssignments.id,
          judgeId: users.id,
          judgeName: users.name,
          judgeEmail: users.email,
          assignedAt: judgeAssignments.assignedAt,
        })
        .from(judgeAssignments)
        .innerJoin(users, eq(users.id, judgeAssignments.judgeId))
        .where(eq(judgeAssignments.eventId, eventId))
        .orderBy(judgeAssignments.assignedAt);

      // Get evaluation criteria
      const criteria = await db
        .select()
        .from(evaluationCriteria)
        .where(eq(evaluationCriteria.eventId, eventId))
        .orderBy(evaluationCriteria.displayOrder);

      res.status(200).json({
        data: {
          event: {
            id: event.id,
            title: event.title,
            description: event.description,
          },
          judges: assignedJudges.map(j => ({
            assignment_id: j.id,
            judge: {
              id: j.judgeId,
              name: j.judgeName,
              email: j.judgeEmail,
            },
            assigned_at: j.assignedAt,
          })),
          criteria: criteria.map(c => ({
            id: c.id,
            name: c.name,
            description: c.description,
            max_score: c.maxScore,
            weight: parseFloat(c.weight),
            display_order: c.displayOrder,
          })),
        },
        message: `Event setup: ${assignedJudges.length} judges, ${criteria.length} criteria`
      });

    } catch (error) {
      console.error('Get event setup error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve event setup'
      });
    }
  })
);

// POST /api/admin/reset-demo - Reset and reseed demo data (organizer only)
router.post('/reset-demo',
  verifyFirebaseToken,
  requireRole(['organizer']),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const organizerFirebaseUid = req.user!.firebaseUid || req.user!.userId;
      
      // Check if this is the demo organizer
      const [organizer] = await db
        .select()
        .from(users)
        .where(eq(users.firebaseUid, organizerFirebaseUid))
        .limit(1);

      if (!organizer || organizer.role !== 'organizer') {
        return res.status(403).json({
          error: 'Permission denied',
          message: 'Only organizers can reset demo data'
        });
      }

      console.log('🔄 Resetting demo data requested by:', organizer.email);
      
      // Clear and reseed demo data
      const demoData = await seedDemoData();
      
      // Return demo credentials and info
      res.status(200).json({
        success: true,
        message: 'Demo data reset successfully',
        data: {
          event: {
            id: demoData.event.id,
            title: demoData.event.title,
            startAt: demoData.event.startAt,
            endAt: demoData.event.endAt
          },
          organizer: {
            firebaseUid: 'demo_organizer',
            email: 'organizer@demo.hackathon'
          },
          judges: demoData.judges.map((j, i) => ({
            firebaseUid: `demo_judge_${i + 1}`,
            email: `judge${i + 1}@demo.hackathon`,
            name: j.name
          })),
          stats: {
            participants: demoData.participants.length,
            teams: demoData.teams.length,
            submissions: demoData.submissions.length,
            judges: demoData.judges.length
          }
        }
      });

    } catch (error) {
      console.error('Reset demo error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to reset demo data'
      });
    }
  })
);

export default router;