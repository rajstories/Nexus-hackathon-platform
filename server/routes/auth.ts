import { Router, Request, Response, NextFunction } from 'express';
import { verifyFirebaseToken, type AuthenticatedRequest } from '../lib/firebase-admin';
import { storage } from '../storage';

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