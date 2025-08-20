import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';

// Import route handlers (these will be loaded dynamically or simplified)
// Since routes are TypeScript, we'll handle them differently

function registerAPIRoutes() {
  const router = express.Router();
  
  // Body parsing middleware
  router.use(express.json({ limit: '10mb' }));
  router.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Security middleware
  if (process.env.NODE_ENV === 'production') {
    router.use(helmet({
      contentSecurityPolicy: false, // Handled by Next.js
      crossOriginEmbedderPolicy: false,
    }));
  }
  
  // CORS configuration for API routes
  const corsOptions = {
    origin: function (origin, callback) {
      if (process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      
      const allowedOrigins = [
        'https://*.azurewebsites.net',
        'https://*.azurestaticapps.net',
        process.env.PRODUCTION_URL,
      ].filter(Boolean);
      
      if (!origin || allowedOrigins.some(pattern => {
        if (pattern.includes('*')) {
          const regex = new RegExp(pattern.replace('*', '.*'));
          return regex.test(origin);
        }
        return pattern === origin;
      })) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  };
  
  router.use(cors(corsOptions));
  
  // Rate limiting
  const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many requests',
        message: 'You have exceeded the rate limit. Please try again later.',
        retryAfter: res.getHeader('Retry-After'),
      });
    },
  });
  
  router.use(limiter);
  
  // Session configuration
  if (process.env.DATABASE_URL) {
    const PgSession = connectPgSimple(session);
    router.use(session({
      store: new PgSession({
        conString: process.env.DATABASE_URL,
        tableName: 'sessions',
      }),
      secret: process.env.SESSION_SECRET || 'fusion-x-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    }));
  }
  
  // Health check endpoint - direct implementation
  router.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      service: 'api',
      version: '1.0.0',
    });
  });

  // Simple test endpoints for Azure deployment verification
  router.get('/test', (req, res) => {
    res.json({ message: 'API is working', timestamp: new Date() });
  });

  // Mount existing routes - we'll integrate the TypeScript routes later
  // For now, create simple endpoints to verify deployment
  router.get('/events', (req, res) => {
    res.json({ events: [], message: 'Events endpoint active' });
  });

  router.get('/teams', (req, res) => {
    res.json({ teams: [], message: 'Teams endpoint active' });
  });

  router.get('/leaderboard', (req, res) => {
    res.json({ leaderboard: [], message: 'Leaderboard endpoint active' });
  });
  
  // 404 handler for API routes
  router.use((req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: `API endpoint ${req.method} ${req.originalUrl} not found`,
    });
  });
  
  // Error handler
  router.use((err, req, res, next) => {
    console.error('API Error:', err);
    
    const status = err.status || 500;
    const message = process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message;
    
    res.status(status).json({
      error: true,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  });
  
  return router;
}

export { registerAPIRoutes };