import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development"
    });
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
