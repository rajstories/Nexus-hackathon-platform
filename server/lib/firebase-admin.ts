import admin from 'firebase-admin';
import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // In production, use service account key or environment variables
  // For development, we'll use the project ID from environment
  admin.initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  });
}

export interface AuthenticatedRequest extends Request {
  user?: {
    firebaseUid: string;
    email: string;
    role: 'participant' | 'organizer' | 'judge';
    userId: string;
  };
  file?: Express.Multer.File;
}

export const verifyFirebaseToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authorization header with Bearer token required'
      });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Development mode: handle mock tokens for testing
    if (process.env.NODE_ENV === 'development' && token.startsWith('test-')) {
      // Mock user data for development
      const mockUsers = {
        'test-user1-token': { uid: 'user1-uid', email: 'user1@test.com', name: 'Test User 1', role: 'participant' as const },
        'test-user2-token': { uid: 'user2-uid', email: 'user2@test.com', name: 'Test User 2', role: 'participant' as const },
        'test-organizer-token': { uid: 'organizer-uid', email: 'organizer@test.com', name: 'Test Organizer', role: 'organizer' as const },
        'test-judge-token': { uid: 'judge-uid', email: 'judge@test.com', name: 'Test Judge', role: 'judge' as const },
      };
      
      const mockUser = mockUsers[token as keyof typeof mockUsers];
      if (!mockUser) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid mock token'
        });
      }
      
      // Use storage instead of UserRepository for consistency
      let user = await storage.getUserByFirebaseUid(mockUser.uid);
      
      if (!user) {
        // Auto-create user if they don't exist
        user = await storage.upsertUserFromFirebase(mockUser.uid, mockUser.name, mockUser.email);
        
        // Update role for non-participants
        if (mockUser.role !== 'participant') {
          const [updatedUser] = await db
            .update(users)
            .set({ role: mockUser.role, updatedAt: new Date() })
            .where(eq(users.firebaseUid, mockUser.uid))
            .returning();
          user = updatedUser;
        }
      }

      req.user = {
        firebaseUid: mockUser.uid,
        email: mockUser.email,
        role: user.role as 'participant' | 'organizer' | 'judge',
        userId: user.id,
      };

      return next();
    }
    
    // Production mode: verify actual Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email } = decodedToken;

    if (!email) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Email is required in token'
      });
    }

    // Get or create user in SQL database using storage
    const user = await storage.upsertUserFromFirebase(uid, email.split('@')[0], email);

    // Attach user info to request
    req.user = {
      firebaseUid: uid,
      email: email,
      role: user.role as 'participant' | 'organizer' | 'judge',
      userId: user.id,
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token'
    });
  }
};

export const requireRole = (allowedRoles: Array<'participant' | 'organizer' | 'judge'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
      });
    }

    next();
  };
};