import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { verifyFirebaseToken, type AuthenticatedRequest } from '../lib/firebase-admin';
import { azureBlobStorage } from '../lib/azureBlobStorage';
import { db } from '../db';
import { users, teams, events, submissions, teamMembers, judgeAssignments } from '@shared/schema';
import { eq, and, or } from 'drizzle-orm';
import { SubmissionMetadata } from '../db/models/SubmissionMetadata';
import { FeedbackSummaryService } from '../services/feedbackSummary';
import { Clarification } from '../db/models/Clarification';
import { z } from 'zod';

const router = Router();

// Helper function to handle async routes
const asyncHandler = (fn: (req: Request, res: Response, next?: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Configure multer for file uploads with enhanced security
const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = [
  'application/zip',
  'application/x-zip-compressed',
  'application/pdf',
  'video/mp4',
  'text/plain',
  'application/json'
];

const BLOCKED_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', 
  '.jar', '.app', '.deb', '.rpm', '.dmg', '.pkg', '.run', '.msi',
  '.dll', '.so', '.dylib', '.sh', '.bash', '.zsh', '.fish', '.ps1'
];

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check for blocked extensions
  const ext = file.originalname.substring(file.originalname.lastIndexOf('.')).toLowerCase();
  if (BLOCKED_EXTENSIONS.includes(ext)) {
    return cb(new Error(`File extension ${ext} is not allowed for security reasons.`));
  }
  
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error(`File type ${file.mimetype} not allowed. Only ZIP, MP4, and PDF files are supported.`));
  }
  
  // Additional check for disguised executables
  if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
    return cb(new Error('Invalid filename detected.'));
  }
  
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit (reduced from 100MB for security)
    fieldSize: 5 * 1024 * 1024, // 5MB field limit
    files: 1, // Only 1 file per upload
    fields: 10, // Max 10 fields
    parts: 20 // Max 20 parts
  },
});

// Validation schema for submission
const createSubmissionSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters'),
  repo_url: z.string()
    .url('Repository URL must be valid')
    .optional()
    .or(z.literal('')),
  demo_url: z.string()
    .url('Demo URL must be valid')
    .optional()
    .or(z.literal('')),
  team_id: z.string()
    .uuid('Invalid team ID'),
});

// POST /api/submissions - Create submission with file upload
router.post('/',
  verifyFirebaseToken,
  upload.single('file'), // Handle optional file upload
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.firebaseUid || req.user!.userId;
      
      // Validate form data
      const validatedData = createSubmissionSchema.parse(req.body);
      const { title, repo_url, demo_url, team_id } = validatedData;

      // Check if user exists in database
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.firebaseUid, userId))
        .limit(1);

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: 'Please complete registration first'
        });
      }

      // Check if team exists and user is a member
      const [teamWithEvent] = await db
        .select({
          teamId: teams.id,
          teamName: teams.name,
          eventId: teams.eventId,
          eventTitle: events.title,
        })
        .from(teams)
        .innerJoin(events, eq(events.id, teams.eventId))
        .where(eq(teams.id, team_id))
        .limit(1);

      if (!teamWithEvent) {
        return res.status(404).json({
          error: 'Team not found',
          message: 'The specified team does not exist'
        });
      }

      // Verify user is a member of the team
      const [membership] = await db
        .select()
        .from(teamMembers)
        .where(
          and(
            eq(teamMembers.teamId, team_id),
            eq(teamMembers.userId, user.id)
          )
        )
        .limit(1);

      if (!membership) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You are not a member of this team'
        });
      }

      // Check if team already has a submission for this event
      const [existingSubmission] = await db
        .select()
        .from(submissions)
        .where(
          and(
            eq(submissions.teamId, team_id),
            eq(submissions.eventId, teamWithEvent.eventId)
          )
        )
        .limit(1);

      if (existingSubmission) {
        return res.status(400).json({
          error: 'Submission exists',
          message: 'Team already has a submission for this event'
        });
      }

      let fileUrl = null;
      let fileName = null;
      let fileSize = null;
      let submissionMetadata = null;

      // Handle file upload if provided
      if (req.file) {
        console.log(`Processing file upload: ${req.file.originalname} (${req.file.size} bytes, ${req.file.mimetype})`);

        // Check if Azure Blob Storage is configured
        if (!azureBlobStorage.isConfigured()) {
          return res.status(503).json({
            error: 'File storage unavailable',
            message: 'File uploads are not configured. Please contact support.'
          });
        }

        try {
          // Generate blob name with structured path
          const blobName = azureBlobStorage.generateBlobName(
            teamWithEvent.eventId,
            team_id,
            req.file.originalname
          );

          // Upload to Azure Blob Storage
          const uploadResult = await azureBlobStorage.uploadFile(
            req.file.buffer,
            blobName,
            req.file.mimetype,
            req.file.size
          );

          fileUrl = uploadResult.url;
          fileName = req.file.originalname;
          fileSize = azureBlobStorage.formatFileSize(req.file.size);

          console.log(`File uploaded successfully to: ${fileUrl}`);

        } catch (uploadError) {
          console.error('File upload failed:', uploadError);
          return res.status(500).json({
            error: 'File upload failed',
            message: uploadError instanceof Error ? uploadError.message : 'Unknown upload error'
          });
        }
      }

      // Create submission in PostgreSQL
      const [newSubmission] = await db
        .insert(submissions)
        .values({
          teamId: team_id,
          eventId: teamWithEvent.eventId,
          title,
          repoUrl: repo_url || null,
          demoUrl: demo_url || null,
          fileUrl,
          fileName,
          fileSize,
          submittedById: user.id,
        })
        .returning();

      // Create metadata in MongoDB if file was uploaded
      if (req.file && fileUrl) {
        try {
          submissionMetadata = new SubmissionMetadata({
            submissionId: newSubmission.id,
            eventId: teamWithEvent.eventId,
            teamId: team_id,
            file: {
              originalName: req.file.originalname,
              blobName: azureBlobStorage.generateBlobName(teamWithEvent.eventId, team_id, req.file.originalname),
              mimeType: req.file.mimetype,
              size: req.file.size,
              formattedSize: azureBlobStorage.formatFileSize(req.file.size),
              uploadedAt: new Date(),
              azureUrl: fileUrl,
            },
            processing: {
              status: 'completed',
              completedAt: new Date(),
            }
          });

          await submissionMetadata.save();
          console.log(`Submission metadata saved to MongoDB: ${submissionMetadata._id}`);

        } catch (mongoError) {
          console.error('MongoDB metadata save failed:', mongoError);
          // Don't fail the request if MongoDB fails, but log it
        }
      }

      // Return success response
      res.status(201).json({
        data: {
          id: newSubmission.id,
          team_id: newSubmission.teamId,
          event_id: newSubmission.eventId,
          title: newSubmission.title,
          repo_url: newSubmission.repoUrl,
          demo_url: newSubmission.demoUrl,
          file_url: newSubmission.fileUrl,
          file_name: newSubmission.fileName,
          file_size: newSubmission.fileSize,
          submitted_by: user.id,
          submitted_at: newSubmission.createdAt,
          team_name: teamWithEvent.teamName,
          event_title: teamWithEvent.eventTitle,
        },
        message: req.file 
          ? `Submission created successfully with file upload (${fileSize})`
          : 'Submission created successfully'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          message: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        });
      }

      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            error: 'File too large',
            message: 'File size must be less than 100MB'
          });
        }
        return res.status(400).json({
          error: 'Upload error',
          message: error.message
        });
      }

      console.error('Submission creation error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create submission'
      });
    }
  })
);

// GET /api/submissions/team/:teamId - Get submissions for a team
router.get('/team/:teamId',
  verifyFirebaseToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { teamId } = req.params;
      const userId = req.user!.firebaseUid || req.user!.userId;

      // Check if user exists and is team member
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.firebaseUid, userId))
        .limit(1);

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: 'Please complete registration first'
        });
      }

      // Verify user is a member of the team
      const [membership] = await db
        .select()
        .from(teamMembers)
        .where(
          and(
            eq(teamMembers.teamId, teamId),
            eq(teamMembers.userId, user.id)
          )
        )
        .limit(1);

      if (!membership) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You are not a member of this team'
        });
      }

      // Get team submissions
      const teamSubmissions = await db
        .select({
          id: submissions.id,
          title: submissions.title,
          repoUrl: submissions.repoUrl,
          demoUrl: submissions.demoUrl,
          fileUrl: submissions.fileUrl,
          fileName: submissions.fileName,
          fileSize: submissions.fileSize,
          createdAt: submissions.createdAt,
          submittedBy: users.name,
          eventTitle: events.title,
        })
        .from(submissions)
        .innerJoin(users, eq(users.id, submissions.submittedById))
        .innerJoin(events, eq(events.id, submissions.eventId))
        .where(eq(submissions.teamId, teamId))
        .orderBy(submissions.createdAt);

      res.status(200).json({
        data: {
          submissions: teamSubmissions.map(sub => ({
            id: sub.id,
            title: sub.title,
            repo_url: sub.repoUrl,
            demo_url: sub.demoUrl,
            file_url: sub.fileUrl,
            file_name: sub.fileName,
            file_size: sub.fileSize,
            submitted_by: sub.submittedBy,
            submitted_at: sub.createdAt,
            event_title: sub.eventTitle,
          })),
          total: teamSubmissions.length,
        },
        message: 'Team submissions retrieved successfully'
      });

    } catch (error) {
      console.error('Get team submissions error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve team submissions'
      });
    }
  })
);

// GET /submissions/:id/reason - Get automated feedback summary for submission (participant-only, after feedback release)
router.get('/:id/reason',
  verifyFirebaseToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id: submissionId } = req.params;
      const userId = req.user!.firebaseUid || req.user!.userId;

      // Get the authenticated user
      const user = await db
        .select()
        .from(users)
        .where(eq(users.firebaseUid, userId))
        .limit(1);

      if (!user.length) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'User not found'
        });
      }

      // Get the submission and verify access
      const submission = await db
        .select({
          id: submissions.id,
          teamId: submissions.teamId,
          eventId: submissions.eventId,
          title: submissions.title,
          decision: submissions.decision,
          event: {
            id: events.id,
            title: events.title,
            feedbackReleaseAt: events.feedbackReleaseAt,
          }
        })
        .from(submissions)
        .innerJoin(events, eq(events.id, submissions.eventId))
        .where(eq(submissions.id, submissionId))
        .limit(1);

      if (!submission.length) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Submission not found'
        });
      }

      const sub = submission[0];

      // Check if feedback has been released
      if (!sub.event.feedbackReleaseAt || new Date() < new Date(sub.event.feedbackReleaseAt)) {
        return res.status(403).json({
          error: 'Feedback not released',
          message: 'Feedback for this event has not been released yet'
        });
      }

      // Verify the user is a participant in this submission's team
      const teamMember = await db
        .select()
        .from(teamMembers)
        .where(
          and(
            eq(teamMembers.teamId, sub.teamId),
            eq(teamMembers.userId, user[0].id)
          )
        )
        .limit(1);

      if (!teamMember.length) {
        return res.status(403).json({
          error: 'Unauthorized',
          message: 'You are not authorized to view feedback for this submission'
        });
      }

      // Only provide feedback summary for rejected submissions
      if (sub.decision !== 'rejected') {
        return res.status(400).json({
          error: 'Feedback not available',
          message: 'Automated feedback summary is only available for rejected submissions'
        });
      }

      // Get feedback summary from service
      const feedbackSummary = await FeedbackSummaryService.getFeedbackSummary(submissionId);

      if (!feedbackSummary) {
        return res.status(404).json({
          error: 'Feedback not available',
          message: 'Unable to generate feedback summary for this submission'
        });
      }

      res.status(200).json({
        data: {
          submission_id: submissionId,
          submission_title: sub.title,
          event_title: sub.event.title,
          feedback: {
            summary: feedbackSummary.summary,
            next_steps: feedbackSummary.next_steps
          },
          generated_at: new Date().toISOString()
        },
        message: 'Feedback summary retrieved successfully'
      });

    } catch (error) {
      console.error('Get feedback summary error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve feedback summary'
      });
    }
  })
);

// POST /submissions/:id/clarify - Submit clarification request (participant-only, within 48h of feedback release)
router.post('/:id/clarify',
  verifyFirebaseToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id: submissionId } = req.params;
      const { text } = req.body;
      const userId = req.user!.firebaseUid || req.user!.userId;

      // Validate input
      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({
          error: 'Invalid input',
          message: 'Clarification text is required'
        });
      }

      if (text.length > 500) {
        return res.status(400).json({
          error: 'Text too long',
          message: 'Clarification text must be 500 characters or less'
        });
      }

      // Get the authenticated user
      const user = await db
        .select()
        .from(users)
        .where(eq(users.firebaseUid, userId))
        .limit(1);

      if (!user.length) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'User not found'
        });
      }

      // Get the submission and verify access
      const submission = await db
        .select({
          id: submissions.id,
          teamId: submissions.teamId,
          eventId: submissions.eventId,
          title: submissions.title,
          decision: submissions.decision,
          event: {
            id: events.id,
            title: events.title,
            feedbackReleaseAt: events.feedbackReleaseAt,
          }
        })
        .from(submissions)
        .innerJoin(events, eq(events.id, submissions.eventId))
        .where(eq(submissions.id, submissionId))
        .limit(1);

      if (!submission.length) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Submission not found'
        });
      }

      const sub = submission[0];

      // Check if feedback has been released
      if (!sub.event.feedbackReleaseAt) {
        return res.status(403).json({
          error: 'Feedback not released',
          message: 'Feedback for this event has not been released yet'
        });
      }

      const feedbackReleaseDate = new Date(sub.event.feedbackReleaseAt);
      const now = new Date();
      
      if (now < feedbackReleaseDate) {
        return res.status(403).json({
          error: 'Feedback not released',
          message: 'Feedback for this event has not been released yet'
        });
      }

      // Check if within 48h window
      const fortyEightHoursAfterRelease = new Date(feedbackReleaseDate.getTime() + (48 * 60 * 60 * 1000));
      if (now > fortyEightHoursAfterRelease) {
        return res.status(403).json({
          error: 'Window closed',
          message: 'Clarification requests must be submitted within 48 hours of feedback release'
        });
      }

      // Verify the user is a participant in this submission's team
      const teamMember = await db
        .select()
        .from(teamMembers)
        .where(
          and(
            eq(teamMembers.teamId, sub.teamId),
            eq(teamMembers.userId, user[0].id)
          )
        )
        .limit(1);

      if (!teamMember.length) {
        return res.status(403).json({
          error: 'Unauthorized',
          message: 'You are not authorized to submit clarifications for this submission'
        });
      }

      // Check if user has already submitted a clarification for this submission
      const existingClarification = await Clarification.findOne({
        submissionId: submissionId,
        userId: user[0].id
      });

      if (existingClarification) {
        return res.status(409).json({
          error: 'Already submitted',
          message: 'You have already submitted a clarification for this submission'
        });
      }

      // Create the clarification
      const clarification = new Clarification({
        submissionId: submissionId,
        userId: user[0].id,
        text: text.trim(),
        status: 'open'
      });

      await clarification.save();

      res.status(201).json({
        data: {
          id: clarification._id,
          submission_id: submissionId,
          submission_title: sub.title,
          text: clarification.text,
          status: clarification.status,
          created_at: clarification.createdAt
        },
        message: 'Clarification submitted successfully'
      });

    } catch (error: any) {
      console.error('Submit clarification error:', error);
      
      if (error.code === 11000) {
        return res.status(409).json({
          error: 'Already submitted',
          message: 'You have already submitted a clarification for this submission'
        });
      }
      
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to submit clarification'
      });
    }
  })
);

// POST /submissions/:id/clarify/reply - Reply to clarification (judge or organizer only)
router.post('/:id/clarify/reply',
  verifyFirebaseToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id: submissionId } = req.params;
      const { text, status } = req.body;
      const userId = req.user!.firebaseUid || req.user!.userId;

      // Validate input
      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({
          error: 'Invalid input',
          message: 'Reply text is required'
        });
      }

      if (text.length > 1000) {
        return res.status(400).json({
          error: 'Text too long',
          message: 'Reply text must be 1000 characters or less'
        });
      }

      const validStatuses = ['answered', 'rejected'];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
          error: 'Invalid status',
          message: 'Status must be either "answered" or "rejected"'
        });
      }

      // Get the authenticated user
      const user = await db
        .select()
        .from(users)
        .where(eq(users.firebaseUid, userId))
        .limit(1);

      if (!user.length) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'User not found'
        });
      }

      // Get the submission
      const submission = await db
        .select({
          id: submissions.id,
          eventId: submissions.eventId,
          title: submissions.title,
          event: {
            organizerId: events.organizerId
          }
        })
        .from(submissions)
        .innerJoin(events, eq(events.id, submissions.eventId))
        .where(eq(submissions.id, submissionId))
        .limit(1);

      if (!submission.length) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Submission not found'
        });
      }

      const sub = submission[0];

      // Check if user is authorized (organizer or judge)
      const isOrganizer = sub.event.organizerId === user[0].id;
      
      let isJudge = false;
      if (!isOrganizer) {
        const judgeAssignment = await db
          .select()
          .from(judgeAssignments)
          .where(
            and(
              eq(judgeAssignments.eventId, sub.eventId),
              eq(judgeAssignments.judgeId, user[0].id)
            )
          )
          .limit(1);
        
        isJudge = judgeAssignment.length > 0;
      }

      if (!isOrganizer && !isJudge) {
        return res.status(403).json({
          error: 'Unauthorized',
          message: 'Only event organizers and judges can reply to clarifications'
        });
      }

      // Find the open clarification for this submission
      const clarification = await Clarification.findOne({
        submissionId: submissionId,
        status: 'open'
      });

      if (!clarification) {
        return res.status(404).json({
          error: 'Not found',
          message: 'No open clarification found for this submission'
        });
      }

      // Update the clarification with reply
      clarification.reply = {
        text: text.trim(),
        repliedBy: user[0].id,
        repliedAt: new Date()
      };
      clarification.status = status || 'answered';

      await clarification.save();

      res.status(200).json({
        data: {
          id: clarification._id,
          submission_id: submissionId,
          submission_title: sub.title,
          original_text: clarification.text,
          reply: clarification.reply,
          status: clarification.status,
          replied_at: clarification.reply.repliedAt
        },
        message: 'Clarification reply submitted successfully'
      });

    } catch (error) {
      console.error('Reply to clarification error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to reply to clarification'
      });
    }
  })
);

// Error handler middleware
router.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Submissions API Error:', error);
  
  if (error.code === 'ECONNREFUSED') {
    return res.status(503).json({
      error: 'Database unavailable',
      message: 'Unable to connect to database. Please try again later.'
    });
  }
  
  if (error.message && error.message.includes('File type')) {
    return res.status(400).json({
      error: 'Invalid file type',
      message: error.message
    });
  }
  
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
});

export default router;