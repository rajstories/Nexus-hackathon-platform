import express from 'express';
import { db as pgDb } from '../db';
import mongoose from 'mongoose';
import { query as sqlQuery } from '../db/sql';

const router = express.Router();

// Health check endpoint - no auth required, no secrets exposed
router.get('/health', async (req, res) => {
  const startTime = Date.now();
  const health: any = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    services: {}
  };
  
  // Check PostgreSQL
  try {
    await pgDb.execute('SELECT 1');
    health.services.postgresql = {
      status: 'healthy',
      responseTime: Date.now() - startTime
    };
  } catch (error) {
    health.services.postgresql = {
      status: 'unhealthy',
      error: 'Connection failed'
    };
    health.status = 'degraded';
  }
  
  // Check MongoDB
  try {
    if (mongoose.connection.readyState === 1) {
      const mongoStart = Date.now();
      await mongoose.connection.db?.admin().ping();
      health.services.mongodb = {
        status: 'healthy',
        responseTime: Date.now() - mongoStart
      };
    } else {
      health.services.mongodb = {
        status: 'disconnected'
      };
    }
  } catch (error) {
    health.services.mongodb = {
      status: 'unhealthy',
      error: 'Connection failed'
    };
    health.status = 'degraded';
  }
  
  // Check Azure SQL (if configured)
  try {
    if (process.env.AZURE_SQL_SERVER) {
      const sqlStart = Date.now();
      await sqlQuery('SELECT 1 as test');
      health.services.azureSQL = {
        status: 'healthy',
        responseTime: Date.now() - sqlStart
      };
    } else {
      health.services.azureSQL = {
        status: 'not_configured'
      };
    }
  } catch (error) {
    health.services.azureSQL = {
      status: 'unhealthy',
      error: 'Connection failed'
    };
    health.status = 'degraded';
  }
  
  // Check memory usage
  const memUsage = process.memoryUsage();
  health.memory = {
    rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
  };
  
  // Overall response time
  health.responseTime = `${Date.now() - startTime}ms`;
  
  // Set appropriate status code
  const statusCode = health.status === 'ok' ? 200 : 503;
  
  res.status(statusCode).json(health);
});

// Liveness probe - simple check that server is running
router.get('/health/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

// Readiness probe - check if server is ready to handle requests
router.get('/health/ready', async (req, res) => {
  try {
    // Quick DB check
    await pgDb.execute('SELECT 1');
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      error: 'Database not ready'
    });
  }
});

export default router;