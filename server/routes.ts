import type { Express } from "express";
import { createServer, type Server } from "http";
import { socketService } from "./lib/socketService";
import { storage } from "./storage";
import { getMongoHealth } from "./db/mongo";
import { query } from "./db/sql";
import authRouter from "./routes/auth";
import eventRouter from "./routes/events";
import teamRouter from "./routes/teams";
import submissionRouter from "./routes/submissions";
import judgingRouter from "./routes/judging";
import adminRouter from "./routes/admin";
import leaderboardRouter from "./routes/leaderboard";
import similarityRouter from "./routes/similarity";
import certificatesRouter from "./routes/certificates";
import analyticsRouter from "./routes/analytics";
import sponsorsRouter from "./routes/sponsors";
import healthRouter from "./routes/health";
import securityTestRouter from "./routes/security-test";
import demoRouter from "./routes/demo";
import web3Router from "./routes/web3";
import achievementsRouter from "./routes/achievements";
import sentimentRouter from "./routes/sentiment";
import performanceRouter from "./routes/performance";
import participantRouter from "./routes/participants";
import aiAnalyticsRouter from "./routes/ai-analytics";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { 
  authRateLimit, 
  uploadRateLimit, 
  apiWriteRateLimit,
  verifyFirebaseToken,
  optionalAuth 
} from "./middleware/security";

export async function registerRoutes(app: Express): Promise<Server> {
  const objectStorageService = new ObjectStorageService();
  
  // Health check routes (no auth required)
  app.use('/api', healthRouter);
  
  // Security test routes (for verification)
  app.use('/api', securityTestRouter);
  
  // Demo routes (public for demo purposes)
  app.use('/api/demo', demoRouter);
  
  // Authentication routes with stricter rate limiting
  app.use('/api/auth', authRateLimit, authRouter);
  
  // Participant routes (require auth for registration)
  app.use('/api/participants', verifyFirebaseToken, participantRouter);
  
  // Event routes (public read, auth for write)
  app.use('/api/events', optionalAuth, eventRouter);
  
  // Team routes (require auth for write operations)
  app.use('/api/teams', optionalAuth, teamRouter);
  
  // Submission routes (require auth and file upload limits)
  app.use('/api/submissions', verifyFirebaseToken, uploadRateLimit, submissionRouter);
  
  // Judging routes (require auth)
  app.use('/api/judging', verifyFirebaseToken, judgingRouter);
  
  // Admin routes for judge assignment and criteria setup (require auth)
  app.use('/api/admin', verifyFirebaseToken, adminRouter);
  
  // Leaderboard routes
  app.use('/api/leaderboard', leaderboardRouter);
  
  // Similarity detection routes
  app.use('/api/similarity', similarityRouter);
  
  // Certificates routes
  app.use('/api', certificatesRouter);
  
  // Analytics routes
  app.use('/api', analyticsRouter);
  
  // AI-powered analytics routes (competition feature)
  app.use('/api/ai', verifyFirebaseToken, aiAnalyticsRouter);
  
  // Sponsors routes
  app.use('/api', sponsorsRouter);
  
  // Web3/NFT/POAP routes
  app.use('/api/web3', web3Router);
  
  // Achievement/Gamification routes
  app.use('/api/achievements', achievementsRouter);
  
  // AI Sentiment Analysis routes
  app.use('/api/sentiment', sentimentRouter);
  
  // Performance Monitoring routes
  app.use('/api/performance', performanceRouter);
  
  // Object storage routes - serve public objects/certificates
  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Legacy health check endpoint (new one is in health router)
  app.get("/api/health-legacy", async (req, res) => {
    try {
      // Check SQL Database
      let sqlStatus: 'ok' | 'error' = 'error';
      try {
        await query('SELECT 1 as test');
        sqlStatus = 'ok';
      } catch (error) {
        console.error('SQL health check failed:', error);
      }

      // Check MongoDB
      const mongoStatus = await getMongoHealth();

      const overallStatus = sqlStatus === 'ok' && mongoStatus === 'ok' ? 'healthy' : 'degraded';

      res.json({
        status: overallStatus,
        sql: sqlStatus,
        mongo: mongoStatus,
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        environment: process.env.NODE_ENV || "development"
      });
    } catch (error) {
      console.error('Health check error:', error);
      res.status(503).json({
        status: 'error',
        sql: 'error',
        mongo: 'error',
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        environment: process.env.NODE_ENV || "development",
        error: 'Health check failed'
      });
    }
  });

  // API info endpoint
  app.get("/api/info", (req, res) => {
    res.json({
      name: "Fusion X API",
      description: "Express API for the Fusion X monorepo",
      version: "1.0.0",
      endpoints: [
        { path: "/api/health", method: "GET", description: "Health check" },
        { path: "/api/info", method: "GET", description: "API information" }
      ]
    });
  });

  const httpServer = createServer(app);
  
  // Initialize Socket.IO with WebSocket support for Azure App Service
  socketService.initialize(httpServer);
  console.log('Socket.IO initialized with Azure WebSocket support');

  return httpServer;
}
