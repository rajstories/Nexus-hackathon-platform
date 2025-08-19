import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getMongoHealth } from "./db/mongo";
import { query } from "./db/sql";

export async function registerRoutes(app: Express): Promise<Server> {
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

  return httpServer;
}
