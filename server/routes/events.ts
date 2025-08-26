import { Router, Request, Response, NextFunction } from 'express';
import { verifyFirebaseToken, requireRole, type AuthenticatedRequest } from '../lib/firebase-admin';
import { EventRepository } from '../db/repositories/EventRepository';
import { UserRepository } from '../db/repositories/UserRepository';
import { db } from '../db';
import { 
  events, eventReviews, teamMembers, teams, judgeAssignments, users, submissions 
} from '@shared/schema';
import { eq, and, sql, desc, avg, count } from 'drizzle-orm';
import { 
  CreateEventSchema, 
  CreateTrackSchema, 
  AssignJudgeSchema,
  CreateRubricSchema,
  SetFeedbackReleaseSchema,
  CreateEventRequest,
  CreateTrackRequest,
  AssignJudgeRequest,
  CreateRubricRequest,
  SetFeedbackReleaseRequest
} from '../types/event';
import { ZodError } from 'zod';
import { z } from 'zod';
import { ReviewFlaggingService } from '../services/ReviewFlaggingService';
import { socketService } from '../lib/socketService';

const router = Router();

// Validation schemas for event reviews
const createReviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  body: z.string().min(10, 'Review body must be at least 10 characters').max(2000, 'Review body must be at most 2000 characters'),
  poap_code: z.string().optional(),
});

const updateReviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5').optional(),
  body: z.string().min(10, 'Review body must be at least 10 characters').max(2000, 'Review body must be at most 2000 characters').optional(),
});

const updatePoapSettingsSchema = z.object({
  require_poap: z.boolean(),
  poap_event_code: z.string().min(1, 'POAP code cannot be empty').max(100, 'POAP code too long').optional(),
});

// Helper function to format validation errors
const formatZodErrors = (error: ZodError) => {
  return {
    error: 'Validation failed',
    details: error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }))
  };
};

// Helper function to handle async routes
const asyncHandler = (fn: (req: Request, res: Response, next?: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// POST /api/events - Create new event (organizer only)
router.post('/', 
  verifyFirebaseToken, 
  requireRole(['organizer']),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const validatedData = CreateEventSchema.parse(req.body) as CreateEventRequest;
      
      const event = await EventRepository.create({
        ...validatedData,
        organizer_id: req.user!.userId
      });
      
      res.status(201).json({
        success: true,
        data: event,
        message: 'Event created successfully'
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(formatZodErrors(error));
      }
      throw error;
    }
  })
);

// POST /api/events/:id/tracks - Add track to event (organizer only)
router.post('/:id/tracks',
  verifyFirebaseToken,
  requireRole(['organizer']),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const eventId = req.params.id;
      const validatedData = CreateTrackSchema.parse(req.body) as CreateTrackRequest;
      
      // Check if event exists and user is the organizer
      const isOrganizer = await EventRepository.isEventOrganizer(eventId, req.user!.userId);
      if (!isOrganizer) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only add tracks to events you organize'
        });
      }
      
      const track = await EventRepository.createTrack(eventId, validatedData);
      
      res.status(201).json({
        success: true,
        data: track,
        message: 'Track added successfully'
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(formatZodErrors(error));
      }
      throw error;
    }
  })
);

// POST /api/events/:id/judges - Assign judge to event (organizer only)
router.post('/:id/judges',
  verifyFirebaseToken,
  requireRole(['organizer']),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const eventId = req.params.id;
      const validatedData = AssignJudgeSchema.parse(req.body) as AssignJudgeRequest;
      
      // Check if event exists and user is the organizer
      const isOrganizer = await EventRepository.isEventOrganizer(eventId, req.user!.userId);
      if (!isOrganizer) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only assign judges to events you organize'
        });
      }
      
      // Check if user exists and has judge role
      const judgeUser = await UserRepository.findById(validatedData.user_id);
      if (!judgeUser) {
        return res.status(400).json({
          error: 'Invalid user',
          message: 'User not found'
        });
      }
      
      if (judgeUser.role !== 'judge') {
        return res.status(400).json({
          error: 'Invalid role',
          message: 'User must have judge role to be assigned as a judge'
        });
      }
      
      // Check if judge is already assigned to this event
      const alreadyAssigned = await EventRepository.checkJudgeAlreadyAssigned(eventId, validatedData.user_id);
      if (alreadyAssigned) {
        return res.status(400).json({
          error: 'Already assigned',
          message: 'This judge is already assigned to this event'
        });
      }
      
      const assignment = await EventRepository.assignJudge(eventId, validatedData.user_id);
      
      res.status(201).json({
        success: true,
        data: {
          ...assignment,
          user: {
            id: judgeUser.id,
            name: judgeUser.name,
            email: judgeUser.email
          }
        },
        message: 'Judge assigned successfully'
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(formatZodErrors(error));
      }
      throw error;
    }
  })
);

// GET /api/events/organizer - Get events by organizer (organizer only)
router.get('/organizer',
  verifyFirebaseToken,
  requireRole(['organizer']),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const events = await EventRepository.findByOrganizerId(req.user!.userId);
    
    res.json({
      success: true,
      data: events
    });
  })
);

// GET /api/events/:id - Get event with tracks and judges
router.get('/:id',
  verifyFirebaseToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const eventId = req.params.id;
      const event = await EventRepository.findByIdWithDetails(eventId);
      
      if (!event) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Event not found'
        });
      }
      
      res.json({
        success: true,
        data: event
      });
    } catch (error) {
      throw error;
    }
  })
);

// POST /api/events/:id/rubric - Create rubric with criteria (organizer only)
router.post('/:id/rubric',
  verifyFirebaseToken,
  requireRole(['organizer']),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const eventId = req.params.id;
      const validatedData = CreateRubricSchema.parse(req.body) as CreateRubricRequest;
      
      // Check if event exists and user is the organizer
      const isOrganizer = await EventRepository.isEventOrganizer(eventId, req.user!.userId);
      if (!isOrganizer) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only create rubrics for events you organize'
        });
      }
      
      // Check if rubric already exists for this event
      const existingRubric = await EventRepository.findRubricByEventId(eventId);
      if (existingRubric) {
        return res.status(400).json({
          error: 'Rubric exists',
          message: 'A rubric already exists for this event'
        });
      }
      
      const rubric = await EventRepository.createRubric(eventId, validatedData);
      
      res.status(201).json({
        success: true,
        data: rubric,
        message: 'Rubric created successfully'
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(formatZodErrors(error));
      }
      throw error;
    }
  })
);

// PUT /api/events/:id/feedback-release - Set feedback release date (organizer only)
router.put('/:id/feedback-release',
  verifyFirebaseToken,
  requireRole(['organizer']),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const eventId = req.params.id;
      const validatedData = SetFeedbackReleaseSchema.parse(req.body) as SetFeedbackReleaseRequest;
      
      // Check if event exists and user is the organizer
      const isOrganizer = await EventRepository.isEventOrganizer(eventId, req.user!.userId);
      if (!isOrganizer) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only set feedback release for events you organize'
        });
      }
      
      await EventRepository.setFeedbackReleaseDate(eventId, validatedData.feedback_release_at);
      
      res.json({
        success: true,
        message: 'Feedback release date set successfully'
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(formatZodErrors(error));
      }
      throw error;
    }
  })
);

// Error handler middleware
router.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Event API Error:', error);
  
  if (error.code === 'ESOCKET' || error.code === 'ECONNREFUSED') {
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

// Helper function to check if user is verified for an event (participant, judge, or organizer)
async function isUserVerifiedForEvent(eventId: string, userId: string): Promise<{ isVerified: boolean; role?: string }> {
  // Check if user is organizer
  const event = await db
    .select({ organizerId: events.organizerId })
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);

  if (event.length && event[0].organizerId === userId) {
    return { isVerified: true, role: 'organizer' };
  }

  // Check if user is a judge
  const judgeAssignment = await db
    .select()
    .from(judgeAssignments)
    .where(
      and(
        eq(judgeAssignments.eventId, eventId),
        eq(judgeAssignments.judgeId, userId)
      )
    )
    .limit(1);

  if (judgeAssignment.length) {
    return { isVerified: true, role: 'judge' };
  }

  // Check if user is a participant (team member with submission)
  const participation = await db
    .select()
    .from(teamMembers)
    .innerJoin(teams, eq(teams.id, teamMembers.teamId))
    .innerJoin(submissions, eq(submissions.teamId, teams.id))
    .where(
      and(
        eq(teamMembers.userId, userId),
        eq(teams.eventId, eventId)
      )
    )
    .limit(1);

  if (participation.length) {
    return { isVerified: true, role: 'participant' };
  }

  return { isVerified: false };
}

// POST /events/:id/reviews - Create or upsert event review (verified users only)
router.post('/:id/reviews',
  verifyFirebaseToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const eventId = req.params.id;
      const { rating, body, poap_code } = createReviewSchema.parse(req.body);
      const userFirebaseUid = req.user!.firebaseUid || req.user!.userId;

      // Get user
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.firebaseUid, userFirebaseUid))
        .limit(1);

      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'User not found'
        });
      }

      // Check if user is verified for this event
      const { isVerified, role } = await isUserVerifiedForEvent(eventId, user.id);
      
      if (!isVerified) {
        return res.status(403).json({
          error: 'Unauthorized',
          message: 'Only verified participants, judges, and organizers can review events'
        });
      }

      // Check if event exists and get POAP requirements
      const eventQuery = await db
        .select({
          id: events.id,
          requirePoap: events.requirePoap,
          poapEventCode: events.poapEventCode,
        })
        .from(events)
        .where(eq(events.id, eventId))
        .limit(1);

      if (!eventQuery.length) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Event not found'
        });
      }

      const event = eventQuery[0];

      // Check POAP requirement
      if (event.requirePoap) {
        if (!poap_code) {
          return res.status(400).json({
            error: 'POAP Required',
            message: 'This event requires a valid POAP code to submit a review'
          });
        }

        // Validate POAP code (simple string match for demo)
        if (poap_code !== event.poapEventCode) {
          return res.status(400).json({
            error: 'Invalid POAP',
            message: 'The provided POAP code is invalid for this event'
          });
        }
      }

      // Check if review already exists (for upsert)
      const existingReview = await db
        .select()
        .from(eventReviews)
        .where(
          and(
            eq(eventReviews.eventId, eventId),
            eq(eventReviews.userId, user.id)
          )
        )
        .limit(1);

      let review;
      if (existingReview.length) {
        // Update existing review
        [review] = await db
          .update(eventReviews)
          .set({
            rating,
            body,
            role: role!,
          })
          .where(
            and(
              eq(eventReviews.eventId, eventId),
              eq(eventReviews.userId, user.id)
            )
          )
          .returning();
      } else {
        // Create new review
        [review] = await db
          .insert(eventReviews)
          .values({
            eventId,
            userId: user.id,
            role: role!,
            rating,
            body,
          })
          .returning();
      }

      // Trigger flagging analysis after review creation/update
      try {
        await ReviewFlaggingService.runFlaggingAnalysis(eventId);
      } catch (flagError) {
        console.error('Flagging analysis failed:', flagError);
        // Don't fail the review submission if flagging fails
      }

      // Emit real-time event to all clients in the event room
      socketService.emitToEvent(eventId, 'review:new', {
        review: {
          id: review.id,
          event_id: review.eventId,
          rating: review.rating,
          body: review.body,
          role: review.role,
          created_at: review.createdAt,
          author: {
            name: user.name,
            verified: true // All users creating reviews are verified
          }
        },
        isUpdate: existingReview.length > 0,
        timestamp: new Date().toISOString()
      });

      res.status(existingReview.length ? 200 : 201).json({
        data: {
          id: review.id,
          event_id: review.eventId,
          rating: review.rating,
          body: review.body,
          role: review.role,
          created_at: review.createdAt,
        },
        message: existingReview.length ? 'Review updated successfully' : 'Review created successfully'
      });

    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(formatZodErrors(error));
      }
      console.error('Create/update event review error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create or update review'
      });
    }
  })
);

// GET /events/:id/reviews/flags - Get flagged reviews for moderation (organizer-only)
router.get('/:id/reviews/flags',
  verifyFirebaseToken,
  requireRole(['organizer']),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const eventId = req.params.id;
      const userFirebaseUid = req.user!.firebaseUid || req.user!.userId;

      // Get user
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.firebaseUid, userFirebaseUid))
        .limit(1);

      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'User not found'
        });
      }

      // Check if user is the organizer of this event
      const event = await db
        .select({ organizerId: events.organizerId })
        .from(events)
        .where(eq(events.id, eventId))
        .limit(1);

      if (!event.length) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Event not found'
        });
      }

      if (event[0].organizerId !== user.id) {
        return res.status(403).json({
          error: 'Unauthorized',
          message: 'Only the event organizer can view flagged reviews'
        });
      }

      // Get flagged reviews with details
      const flaggedReviews = await ReviewFlaggingService.getFlaggedReviewsWithDetails(eventId);

      res.status(200).json({
        data: {
          event_id: eventId,
          flagged_count: flaggedReviews.length,
          flags: flaggedReviews,
        },
        message: 'Flagged reviews retrieved successfully'
      });

    } catch (error) {
      console.error('Get flagged reviews error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve flagged reviews'
      });
    }
  })
);

// POST /events/:id/reviews/analyze - Manually trigger flagging analysis (organizer-only)
router.post('/:id/reviews/analyze',
  verifyFirebaseToken,
  requireRole(['organizer']),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const eventId = req.params.id;
      const userFirebaseUid = req.user!.firebaseUid || req.user!.userId;

      // Get user
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.firebaseUid, userFirebaseUid))
        .limit(1);

      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'User not found'
        });
      }

      // Check if user is the organizer of this event
      const event = await db
        .select({ organizerId: events.organizerId })
        .from(events)
        .where(eq(events.id, eventId))
        .limit(1);

      if (!event.length) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Event not found'
        });
      }

      if (event[0].organizerId !== user.id) {
        return res.status(403).json({
          error: 'Unauthorized',
          message: 'Only the event organizer can trigger review analysis'
        });
      }

      // Run flagging analysis
      await ReviewFlaggingService.runFlaggingAnalysis(eventId);

      res.status(200).json({
        message: 'Review flagging analysis completed successfully'
      });

    } catch (error) {
      console.error('Manual flagging analysis error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to run flagging analysis'
      });
    }
  })
);

// GET /events/:id/reviews - Get event reviews with aggregated data
router.get('/:id/reviews',
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const eventId = req.params.id;

      // Check if event exists
      const eventExists = await db
        .select()
        .from(events)
        .where(eq(events.id, eventId))
        .limit(1);

      if (!eventExists.length) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Event not found'
        });
      }

      // Get aggregated review statistics
      const aggregateStats = await db
        .select({
          averageRating: avg(eventReviews.rating),
          totalReviews: count(eventReviews.id),
          rating1Count: sql<number>`SUM(CASE WHEN ${eventReviews.rating} = 1 THEN 1 ELSE 0 END)`,
          rating2Count: sql<number>`SUM(CASE WHEN ${eventReviews.rating} = 2 THEN 1 ELSE 0 END)`,
          rating3Count: sql<number>`SUM(CASE WHEN ${eventReviews.rating} = 3 THEN 1 ELSE 0 END)`,
          rating4Count: sql<number>`SUM(CASE WHEN ${eventReviews.rating} = 4 THEN 1 ELSE 0 END)`,
          rating5Count: sql<number>`SUM(CASE WHEN ${eventReviews.rating} = 5 THEN 1 ELSE 0 END)`,
        })
        .from(eventReviews)
        .where(eq(eventReviews.eventId, eventId))
        .groupBy(sql`1`);

      // Get recent 10 reviews
      const recentReviews = await db
        .select({
          id: eventReviews.id,
          rating: eventReviews.rating,
          body: eventReviews.body,
          role: eventReviews.role,
          createdAt: eventReviews.createdAt,
          userName: users.name,
        })
        .from(eventReviews)
        .innerJoin(users, eq(users.id, eventReviews.userId))
        .where(eq(eventReviews.eventId, eventId))
        .orderBy(desc(eventReviews.createdAt))
        .limit(10);

      const stats = aggregateStats[0] || {
        averageRating: null,
        totalReviews: 0,
        rating1Count: 0,
        rating2Count: 0,
        rating3Count: 0,
        rating4Count: 0,
        rating5Count: 0,
      };

      res.status(200).json({
        data: {
          average: stats.averageRating ? parseFloat(stats.averageRating.toString()) : null,
          distribution: {
            1: parseInt(stats.rating1Count.toString()),
            2: parseInt(stats.rating2Count.toString()),
            3: parseInt(stats.rating3Count.toString()),
            4: parseInt(stats.rating4Count.toString()),
            5: parseInt(stats.rating5Count.toString()),
          },
          verified_count: parseInt(stats.totalReviews.toString()),
          recent_reviews: recentReviews.map(review => ({
            id: review.id,
            rating: review.rating,
            body: review.body,
            role: review.role,
            created_at: review.createdAt,
            author: {
              name: review.userName,
              verified: true, // All reviewers are verified by design
            }
          }))
        },
        message: 'Event reviews retrieved successfully'
      });

    } catch (error) {
      console.error('Get event reviews error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve event reviews'
      });
    }
  })
);

// PUT /events/:id/reviews/me - Edit your own review (verified users only)
router.put('/:id/reviews/me',
  verifyFirebaseToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const eventId = req.params.id;
      const updates = updateReviewSchema.parse(req.body);
      const userFirebaseUid = req.user!.firebaseUid || req.user!.userId;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          error: 'Bad request',
          message: 'At least one field (rating or body) must be provided'
        });
      }

      // Get user
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.firebaseUid, userFirebaseUid))
        .limit(1);

      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'User not found'
        });
      }

      // Check if user is verified for this event
      const { isVerified } = await isUserVerifiedForEvent(eventId, user.id);
      
      if (!isVerified) {
        return res.status(403).json({
          error: 'Unauthorized',
          message: 'Only verified participants, judges, and organizers can review events'
        });
      }

      // Find existing review
      const existingReview = await db
        .select()
        .from(eventReviews)
        .where(
          and(
            eq(eventReviews.eventId, eventId),
            eq(eventReviews.userId, user.id)
          )
        )
        .limit(1);

      if (!existingReview.length) {
        return res.status(404).json({
          error: 'Not found',
          message: 'No review found to update'
        });
      }

      // Update the review
      const [updatedReview] = await db
        .update(eventReviews)
        .set(updates)
        .where(
          and(
            eq(eventReviews.eventId, eventId),
            eq(eventReviews.userId, user.id)
          )
        )
        .returning();

      res.status(200).json({
        data: {
          id: updatedReview.id,
          event_id: updatedReview.eventId,
          rating: updatedReview.rating,
          body: updatedReview.body,
          role: updatedReview.role,
          created_at: updatedReview.createdAt,
        },
        message: 'Review updated successfully'
      });

    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(formatZodErrors(error));
      }
      console.error('Update event review error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update review'
      });
    }
  })
);

// DELETE /events/:id/reviews/:reviewId - Delete review (organizer-only moderation)
router.delete('/:id/reviews/:reviewId',
  verifyFirebaseToken,
  requireRole(['organizer']),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id: eventId, reviewId } = req.params;
      const userFirebaseUid = req.user!.firebaseUid || req.user!.userId;

      // Get user
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.firebaseUid, userFirebaseUid))
        .limit(1);

      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'User not found'
        });
      }

      // Check if user is the organizer of this event
      const event = await db
        .select({ organizerId: events.organizerId })
        .from(events)
        .where(eq(events.id, eventId))
        .limit(1);

      if (!event.length) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Event not found'
        });
      }

      if (event[0].organizerId !== user.id) {
        return res.status(403).json({
          error: 'Unauthorized',
          message: 'Only the event organizer can delete reviews'
        });
      }

      // Check if review exists and belongs to this event
      const review = await db
        .select()
        .from(eventReviews)
        .where(
          and(
            eq(eventReviews.id, reviewId),
            eq(eventReviews.eventId, eventId)
          )
        )
        .limit(1);

      if (!review.length) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Review not found'
        });
      }

      // Store review data before deletion for the Socket.IO event
      const deletedReview = review[0];

      // Delete the review
      await db
        .delete(eventReviews)
        .where(eq(eventReviews.id, reviewId));

      // Emit real-time event to all clients in the event room
      socketService.emitToEvent(eventId, 'review:deleted', {
        reviewId: deletedReview.id,
        rating: deletedReview.rating,
        timestamp: new Date().toISOString()
      });

      res.status(200).json({
        message: 'Review deleted successfully'
      });

    } catch (error) {
      console.error('Delete event review error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to delete review'
      });
    }
  })
);

// PUT /events/:id/poap-settings - Update POAP settings for an event (organizer only)
router.put('/:id/poap-settings',
  verifyFirebaseToken,
  requireRole(['organizer']),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const eventId = req.params.id;
      const { require_poap, poap_event_code } = updatePoapSettingsSchema.parse(req.body);
      const userFirebaseUid = req.user!.firebaseUid || req.user!.userId;

      // Get user
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.firebaseUid, userFirebaseUid))
        .limit(1);

      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'User not found'
        });
      }

      // Check if user is the organizer of this event
      const event = await db
        .select({ organizerId: events.organizerId })
        .from(events)
        .where(eq(events.id, eventId))
        .limit(1);

      if (!event.length) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Event not found'
        });
      }

      if (event[0].organizerId !== user.id) {
        return res.status(403).json({
          error: 'Unauthorized',
          message: 'Only the event organizer can update POAP settings'
        });
      }

      // Validate that if require_poap is true, poap_event_code must be provided
      if (require_poap && !poap_event_code) {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'POAP event code is required when enabling POAP requirement'
        });
      }

      // Update POAP settings
      const [updatedEvent] = await db
        .update(events)
        .set({
          requirePoap: require_poap,
          poapEventCode: require_poap ? poap_event_code : null,
        })
        .where(eq(events.id, eventId))
        .returning({
          id: events.id,
          requirePoap: events.requirePoap,
          poapEventCode: events.poapEventCode,
        });

      res.status(200).json({
        data: {
          event_id: updatedEvent.id,
          require_poap: updatedEvent.requirePoap,
          poap_event_code: updatedEvent.poapEventCode,
        },
        message: 'POAP settings updated successfully'
      });

    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(formatZodErrors(error));
      }
      console.error('Update POAP settings error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update POAP settings'
      });
    }
  })
);

// GET /events/:id/poap-info - Get POAP information for an event
router.get('/:id/poap-info',
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const eventId = req.params.id;

      // Get event POAP settings
      const eventQuery = await db
        .select({
          id: events.id,
          title: events.title,
          requirePoap: events.requirePoap,
          // Don't expose the actual POAP code in public endpoints
        })
        .from(events)
        .where(eq(events.id, eventId))
        .limit(1);

      if (!eventQuery.length) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Event not found'
        });
      }

      const event = eventQuery[0];

      res.status(200).json({
        data: {
          event_id: event.id,
          event_title: event.title,
          require_poap: event.requirePoap,
          poap_required: event.requirePoap, // alias for clarity
        },
        message: 'POAP information retrieved successfully'
      });

    } catch (error) {
      console.error('Get POAP info error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve POAP information'
      });
    }
  })
);

export default router;