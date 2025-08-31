import { Router, Request, Response, NextFunction } from 'express';
import { verifyFirebaseToken, type AuthenticatedRequest } from '../lib/firebase-admin';
import { storage } from '../storage';
import { updateProfileSchema } from '@shared/schema';

const router = Router();

// Helper function to handle async routes
const asyncHandler = (fn: (req: Request, res: Response, next?: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// POST /api/auth/register - Upsert user from Firebase authentication
router.post('/register',
  verifyFirebaseToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const firebaseUser = req.user!;
      const uid = firebaseUser.firebaseUid || firebaseUser.userId;
      const name = firebaseUser.email?.split('@')[0] || 'User'; // Fallback to email prefix
      const email = firebaseUser.email;

      if (!name || !email) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'Name and email are required for registration'
        });
      }

      // Upsert user in database
      const user = await storage.upsertUserFromFirebase(uid, name, email);

      res.status(200).json({
        data: {
          id: user.id,
          firebase_uid: user.firebaseUid,
          name: user.name,
          email: user.email,
          role: user.role,
          created_at: user.createdAt,
          updated_at: user.updatedAt,
        },
        message: user.createdAt === user.updatedAt ? 'User registered successfully' : 'User profile updated'
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to register user'
      });
    }
  })
);

// GET /api/auth/me - Get current authenticated user
router.get('/me',
  verifyFirebaseToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const firebaseUser = req.user!;
      
      // Get user from database
      const uid = firebaseUser.firebaseUid || firebaseUser.userId;
      const user = await storage.getUserByFirebaseUid(uid);

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: 'Please complete registration first'
        });
      }

      res.status(200).json({
        data: {
          id: user.id,
          firebase_uid: user.firebaseUid,
          name: user.name,
          email: user.email,
          role: user.role,
          school: user.school,
          bio: user.bio,
          skills: user.skills ? JSON.parse(user.skills) : [],
          created_at: user.createdAt,
          updated_at: user.updatedAt,
        }
      });

    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to get user information'
      });
    }
  })
);

// PUT /api/auth/profile - Update user profile
router.put('/profile',
  verifyFirebaseToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const firebaseUser = req.user!;
      const uid = firebaseUser.firebaseUid || firebaseUser.userId;
      
      // Get user from database
      const user = await storage.getUserByFirebaseUid(uid);
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: 'Please complete registration first'
        });
      }

      // Validate request body
      const validationResult = updateProfileSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Invalid profile data provided',
          details: validationResult.error.errors
        });
      }

      const profileData = validationResult.data;
      
      // Update user profile
      const updatedUser = await storage.updateUserProfile(user.id, profileData);

      res.status(200).json({
        data: {
          id: updatedUser.id,
          firebase_uid: updatedUser.firebaseUid,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          school: updatedUser.school,
          bio: updatedUser.bio,
          skills: updatedUser.skills ? JSON.parse(updatedUser.skills) : [],
          created_at: updatedUser.createdAt,
          updated_at: updatedUser.updatedAt,
        },
        message: 'Profile updated successfully'
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update profile'
      });
    }
  })
);

// Error handler middleware
router.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Auth API Error:', error);
  
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