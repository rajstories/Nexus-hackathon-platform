import { Router, Request, Response, NextFunction } from 'express';
import { verifyFirebaseToken, requireRole, type AuthenticatedRequest } from '../lib/firebase-admin';
import { EventRepository } from '../db/repositories/EventRepository';
import { UserRepository } from '../db/repositories/UserRepository';
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

const router = Router();

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

export default router;