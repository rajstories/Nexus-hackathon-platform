import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { connectMongoDB } from "./db/mongo";
import { 
  securityHeaders, 
  corsMiddleware, 
  generalRateLimit,
  sanitizeInput 
} from "./middleware/security";

const app = express();

// Trust proxy for rate limiting and security  
app.set('trust proxy', 1);

// Disable x-powered-by header
app.disable('x-powered-by');

// Apply security middleware FIRST (but skip CORS as Vite handles it)
app.use(securityHeaders);
// Skip CORS middleware - let Vite handle it in development
if (process.env.NODE_ENV === 'production') {
  app.use(corsMiddleware);
}
app.use(generalRateLimit);

// Then body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Input sanitization after body parsing
app.use(sanitizeInput);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Connect to MongoDB
  try {
    await connectMongoDB();
  } catch (error) {
    console.warn('MongoDB connection failed, continuing without MongoDB features');
  }

  // Connect to Azure SQL Database
  try {
    const { connectAzureSQL, initializeAzureSQLSchema } = await import('./db/azure-sql');
    await connectAzureSQL();
    await initializeAzureSQLSchema();
    console.log('✅ Azure SQL Database connected and initialized');
  } catch (error) {
    console.warn('⚠️ Azure SQL connection failed, continuing without Azure SQL features');
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
