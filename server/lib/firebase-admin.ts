import admin from 'firebase-admin';
import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../db/repositories/UserRepository';
import { User } from '../types/database';

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
    
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email } = decodedToken;

    if (!email) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Email is required in token'
      });
    }

    // Get or create user in SQL database
    let user = await UserRepository.findByFirebaseUid(uid);
    
    if (!user) {
      // Auto-create user if they don't exist
      const userData = {
        firebase_uid: uid,
        name: email.split('@')[0], // Use email prefix as name
        email: email,
        role: 'participant' as const, // Default role
      };
      
      user = await UserRepository.create(userData);
    }

    // Attach user info to request
    req.user = {
      firebaseUid: uid,
      email: email,
      role: user.role,
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