import { Router } from 'express';
import { verifyFirebaseToken, requireRole, type AuthenticatedRequest } from '../lib/firebase-admin';
import { UserRepository } from '../db/repositories/UserRepository';
import { User } from '../types/database';

const authRouter = Router();

// Protected route - Get current user
authRouter.get('/me', verifyFirebaseToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not found'
      });
    }

    // Get full user data from SQL database
    const user = await UserRepository.findByFirebaseUid(req.user.firebaseUid);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found in database'
      });
    }

    res.json({
      id: user.id,
      firebaseUid: user.firebase_uid,
      username: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve user profile'
    });
  }
});

// Protected route - Update user profile (participant and organizer can update their own profile)
authRouter.patch('/profile', verifyFirebaseToken, requireRole(['participant', 'organizer', 'judge']), async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not found'
      });
    }

    const { name, role } = req.body;
    
    // Only organizers can change roles
    if (role && req.user.role !== 'organizer') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only organizers can change user roles'
      });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (role && ['participant', 'organizer', 'judge'].includes(role)) {
      updateData.role = role;
    }

    const updatedUser = await UserRepository.update(req.user.userId, updateData);
    
    if (!updatedUser) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    res.json({
      id: updatedUser.id,
      firebaseUid: updatedUser.firebase_uid,
      username: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update user profile'
    });
  }
});

// Admin only - Get all users
authRouter.get('/users', verifyFirebaseToken, requireRole(['organizer']), async (req: AuthenticatedRequest, res) => {
  try {
    const users = await UserRepository.findAll();
    res.json(users.map(user => ({
      id: user.id,
      firebaseUid: user.firebase_uid,
      username: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    })));
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve users'
    });
  }
});

export default authRouter;