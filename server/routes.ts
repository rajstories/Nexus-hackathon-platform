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
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

export async function registerRoutes(app: Express): Promise<Server> {
  const objectStorageService = new ObjectStorageService();
  // Authentication routes
  app.use('/api/auth', authRouter);
  
  // Event routes
  app.use('/api/events', eventRouter);
  
  // Team routes
  app.use('/api/teams', teamRouter);
  
  // Submission routes
  app.use('/api/submissions', submissionRouter);
  
  // Judging routes
  app.use('/api/judging', judgingRouter);
  
  // Admin routes for judge assignment and criteria setup
  app.use('/api/admin', adminRouter);
  
  // Leaderboard routes
  app.use('/api/leaderboard', leaderboardRouter);
  
  // Similarity detection routes
  app.use('/api/similarity', similarityRouter);
  
  // Certificates routes
  app.use('/api', certificatesRouter);
  
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

  // Health check endpoint with database status
  app.get("/api/health", async (req, res) => {
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
