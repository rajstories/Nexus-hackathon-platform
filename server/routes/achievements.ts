import { Router } from 'express';
import { achievementService } from '../lib/achievementService';
import { verifyFirebaseToken } from '../lib/firebase-admin';

const router = Router();

// Get user's achievements and progress
router.get('/user/:userId', verifyFirebaseToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userAchievements = await achievementService.getUserAchievements(userId);
    
    res.json({
      success: true,
      data: userAchievements
    });
    
  } catch (error) {
    console.error('Get user achievements error:', error);
    res.status(500).json({
      error: 'Failed to get user achievements',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Check for new achievements (called after user actions)
router.post('/check/:userId', verifyFirebaseToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const newAchievements = await achievementService.checkAchievements(userId);
    
    res.json({
      success: true,
      newAchievements,
      count: newAchievements.length
    });
    
  } catch (error) {
    console.error('Check achievements error:', error);
    res.status(500).json({
      error: 'Failed to check achievements',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get achievements leaderboard
router.get('/leaderboard', verifyFirebaseToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const leaderboard = await achievementService.getLeaderboard(parseInt(limit as string));
    
    res.json({
      success: true,
      leaderboard
    });
    
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      error: 'Failed to get achievements leaderboard',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get achievement statistics
router.get('/stats', verifyFirebaseToken, async (req, res) => {
  try {
    const stats = await achievementService.getAchievementStats();
    
    res.json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error('Get achievement stats error:', error);
    res.status(500).json({
      error: 'Failed to get achievement statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all available achievements (catalog)
router.get('/catalog', verifyFirebaseToken, async (req, res) => {
  try {
    // Get mock user achievements to show progress
    const userAchievements = await achievementService.getUserAchievements('mock-user');
    
    // Return achievement catalog
    res.json({
      success: true,
      catalog: userAchievements.achievements.map(achievement => ({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        category: achievement.category,
        points: achievement.points,
        rarity: achievement.rarity,
        unlocked: achievement.unlocked
      }))
    });
    
  } catch (error) {
    console.error('Get achievement catalog error:', error);
    res.status(500).json({
      error: 'Failed to get achievement catalog',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;