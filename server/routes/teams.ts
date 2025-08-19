import { Router, Request, Response, NextFunction } from 'express';
import { verifyFirebaseToken, type AuthenticatedRequest } from '../lib/firebase-admin';
import { db } from '../db';
import { users, teams, teamMembers, events } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { generateInviteCode, isValidInviteCode } from '../lib/teamUtils';
import { z } from 'zod';

const router = Router();

// Helper function to handle async routes
const asyncHandler = (fn: (req: Request, res: Response, next?: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Validation schemas
const createTeamSchema = z.object({
  event_id: z.string().uuid('Invalid event ID'),
  name: z.string()
    .min(2, 'Team name must be at least 2 characters')
    .max(50, 'Team name must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Team name can only contain letters, numbers, spaces, hyphens, and underscores')
});

const joinTeamSchema = z.object({
  invite_code: z.string()
    .length(6, 'Invite code must be exactly 6 characters')
    .regex(/^[A-Z2-9]{6}$/, 'Invalid invite code format')
});

// POST /api/teams - Create a new team
router.post('/', 
  verifyFirebaseToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { event_id, name } = createTeamSchema.parse(req.body);
      const userId = req.user!.firebaseUid || req.user!.userId;

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

      // Check if event exists
      const [event] = await db
        .select()
        .from(events)
        .where(eq(events.id, event_id))
        .limit(1);

      if (!event) {
        return res.status(404).json({
          error: 'Event not found',
          message: 'The specified event does not exist'
        });
      }

      // Check if user already has a team in this event
      const existingTeamMembership = await db
        .select({ teamId: teamMembers.teamId })
        .from(teamMembers)
        .innerJoin(teams, eq(teams.id, teamMembers.teamId))
        .where(
          and(
            eq(teamMembers.userId, user.id),
            eq(teams.eventId, event_id)
          )
        )
        .limit(1);

      if (existingTeamMembership.length > 0) {
        return res.status(400).json({
          error: 'Team membership exists',
          message: 'You are already part of a team for this event'
        });
      }

      // Generate unique invite code
      let inviteCode: string;
      let attempts = 0;
      const maxAttempts = 10;

      do {
        inviteCode = generateInviteCode();
        attempts++;
        
        const [existingCode] = await db
          .select()
          .from(teams)
          .where(eq(teams.inviteCode, inviteCode))
          .limit(1);
          
        if (!existingCode) break;
        
        if (attempts >= maxAttempts) {
          return res.status(500).json({
            error: 'Code generation failed',
            message: 'Unable to generate unique invite code. Please try again.'
          });
        }
      } while (true);

      // Create the team
      const [newTeam] = await db
        .insert(teams)
        .values({
          eventId: event_id,
          name,
          inviteCode: inviteCode!,
          createdById: user.id,
        })
        .returning();

      // Add creator as first team member
      await db
        .insert(teamMembers)
        .values({
          teamId: newTeam.id,
          userId: user.id,
        });

      res.status(201).json({
        data: {
          id: newTeam.id,
          name: newTeam.name,
          invite_code: newTeam.inviteCode,
          event_id: newTeam.eventId,
          created_by: user.id,
          created_at: newTeam.createdAt,
        },
        message: 'Team created successfully'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          message: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        });
      }
      
      console.error('Team creation error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create team'
      });
    }
  })
);

// POST /api/teams/join - Join a team using invite code
router.post('/join',
  verifyFirebaseToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { invite_code } = joinTeamSchema.parse(req.body);
      const userId = req.user!.firebaseUid || req.user!.userId;

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

      // Find the team by invite code
      const [team] = await db
        .select({
          id: teams.id,
          name: teams.name,
          eventId: teams.eventId,
          inviteCode: teams.inviteCode,
          createdAt: teams.createdAt,
        })
        .from(teams)
        .where(eq(teams.inviteCode, invite_code.toUpperCase()))
        .limit(1);

      if (!team) {
        return res.status(404).json({
          error: 'Invalid invite code',
          message: 'Team not found with the provided invite code'
        });
      }

      // Check if user is already part of any team in this event
      const existingTeamMembership = await db
        .select({ teamId: teamMembers.teamId })
        .from(teamMembers)
        .innerJoin(teams, eq(teams.id, teamMembers.teamId))
        .where(
          and(
            eq(teamMembers.userId, user.id),
            eq(teams.eventId, team.eventId)
          )
        )
        .limit(1);

      if (existingTeamMembership.length > 0) {
        return res.status(400).json({
          error: 'Team membership exists',
          message: 'You are already part of a team for this event'
        });
      }

      // Check if user is already in this specific team
      const [existingMembership] = await db
        .select()
        .from(teamMembers)
        .where(
          and(
            eq(teamMembers.teamId, team.id),
            eq(teamMembers.userId, user.id)
          )
        )
        .limit(1);

      if (existingMembership) {
        return res.status(400).json({
          error: 'Already joined',
          message: 'You are already a member of this team'
        });
      }

      // Add user to the team
      const [newMembership] = await db
        .insert(teamMembers)
        .values({
          teamId: team.id,
          userId: user.id,
        })
        .returning();

      res.status(200).json({
        data: {
          team_id: team.id,
          team_name: team.name,
          event_id: team.eventId,
          joined_at: newMembership.joinedAt,
        },
        message: `Successfully joined team "${team.name}"`
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          message: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        });
      }
      
      console.error('Team join error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to join team'
      });
    }
  })
);

// GET /api/teams/me - Get user's teams and members
router.get('/me',
  verifyFirebaseToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.firebaseUid || req.user!.userId;

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

      // Get user's teams with members
      const userTeams = await db
        .select({
          teamId: teams.id,
          teamName: teams.name,
          inviteCode: teams.inviteCode,
          eventId: teams.eventId,
          createdAt: teams.createdAt,
          joinedAt: teamMembers.joinedAt,
          isCreator: teams.createdById,
          // Event info
          eventTitle: events.title,
          eventStartAt: events.startAt,
          eventEndAt: events.endAt,
        })
        .from(teamMembers)
        .innerJoin(teams, eq(teams.id, teamMembers.teamId))
        .innerJoin(events, eq(events.id, teams.eventId))
        .where(eq(teamMembers.userId, user.id))
        .orderBy(teamMembers.joinedAt);

      // Get team members for each team
      const teamsWithMembers = await Promise.all(
        userTeams.map(async (team) => {
          const members = await db
            .select({
              userId: users.id,
              name: users.name,
              email: users.email,
              role: users.role,
              joinedAt: teamMembers.joinedAt,
            })
            .from(teamMembers)
            .innerJoin(users, eq(users.id, teamMembers.userId))
            .where(eq(teamMembers.teamId, team.teamId))
            .orderBy(teamMembers.joinedAt);

          return {
            id: team.teamId,
            name: team.teamName,
            invite_code: team.inviteCode,
            event: {
              id: team.eventId,
              title: team.eventTitle,
              start_at: team.eventStartAt,
              end_at: team.eventEndAt,
            },
            is_creator: team.isCreator === user.id,
            joined_at: team.joinedAt,
            created_at: team.createdAt,
            members: members.map(member => ({
              user_id: member.userId,
              name: member.name,
              email: member.email,
              role: member.role,
              joined_at: member.joinedAt,
            })),
          };
        })
      );

      res.status(200).json({
        data: {
          teams: teamsWithMembers,
          total_teams: teamsWithMembers.length,
        },
        message: 'Teams retrieved successfully'
      });

    } catch (error) {
      console.error('Get teams error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve teams'
      });
    }
  })
);

// Error handler middleware
router.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Teams API Error:', error);
  
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