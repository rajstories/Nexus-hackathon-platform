import { Router } from 'express';
import { performanceMonitor } from '../lib/performanceMonitor';
import { verifyFirebaseToken, requireRole } from '../lib/firebase-admin';

const router = Router();

// Get system health status (organizer only)
router.get('/health', verifyFirebaseToken, requireRole(['organizer']), async (req, res) => {
  try {
    const health = performanceMonitor.getSystemHealth();
    
    res.json({
      success: true,
      health
    });
    
  } catch (error) {
    console.error('Get system health error:', error);
    res.status(500).json({
      error: 'Failed to get system health',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get performance dashboard data (organizer only)
router.get('/dashboard', verifyFirebaseToken, requireRole(['organizer']), async (req, res) => {
  try {
    const dashboard = performanceMonitor.getDashboardData();
    
    res.json({
      success: true,
      dashboard
    });
    
  } catch (error) {
    console.error('Get performance dashboard error:', error);
    res.status(500).json({
      error: 'Failed to get performance dashboard',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get endpoint metrics (organizer only)
router.get('/endpoints', verifyFirebaseToken, requireRole(['organizer']), async (req, res) => {
  try {
    const metrics = performanceMonitor.getEndpointMetrics();
    
    res.json({
      success: true,
      endpoints: metrics
    });
    
  } catch (error) {
    console.error('Get endpoint metrics error:', error);
    res.status(500).json({
      error: 'Failed to get endpoint metrics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get performance alerts (organizer only)
router.get('/alerts', verifyFirebaseToken, requireRole(['organizer']), async (req, res) => {
  try {
    const alerts = performanceMonitor.getPerformanceAlerts();
    
    res.json({
      success: true,
      alerts,
      count: alerts.length
    });
    
  } catch (error) {
    console.error('Get performance alerts error:', error);
    res.status(500).json({
      error: 'Failed to get performance alerts',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get metrics by category (organizer only)
router.get('/metrics/:category', verifyFirebaseToken, requireRole(['organizer']), async (req, res) => {
  try {
    const { category } = req.params;
    const { hours = 1 } = req.query;
    
    if (!['api', 'database', 'memory', 'cpu', 'network', 'websocket'].includes(category)) {
      return res.status(400).json({
        error: 'Invalid category',
        valid: ['api', 'database', 'memory', 'cpu', 'network', 'websocket']
      });
    }
    
    const metrics = performanceMonitor.getMetricsByCategory(
      category as any, 
      parseInt(hours as string)
    );
    
    res.json({
      success: true,
      category,
      timeframe: `${hours} hour(s)`,
      metrics,
      count: metrics.length
    });
    
  } catch (error) {
    console.error('Get metrics by category error:', error);
    res.status(500).json({
      error: 'Failed to get metrics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;