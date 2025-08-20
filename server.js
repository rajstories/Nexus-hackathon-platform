import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import express from 'express';
import { Server } from 'socket.io';

// Import API routes
import { registerAPIRoutes } from './server/api.js';

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;

// Initialize Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  const httpServer = createServer(server);
  
  // Trust proxy for Azure App Service
  server.set('trust proxy', true);
  
  // Health check endpoint (outside of /api for Azure health probes)
  server.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      node: process.version,
    });
  });
  
  // Mount Express API routes under /api
  server.use('/api', registerAPIRoutes());
  
  // Initialize Socket.IO with Azure WebSocket support
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://*.azurewebsites.net', 'https://*.azurestaticapps.net']
        : ['http://localhost:3000', 'http://localhost:5000'],
      credentials: true,
    },
    // Azure App Service WebSocket configuration
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
  });
  
  // Socket.IO event handlers
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('join-event', (eventId) => {
      socket.join(`event-${eventId}`);
      console.log(`Socket ${socket.id} joined event ${eventId}`);
    });
    
    socket.on('announcement', (data) => {
      io.to(`event-${data.eventId}`).emit('new-announcement', data);
    });
    
    socket.on('chat-message', (data) => {
      io.to(`event-${data.eventId}`).emit('new-message', data);
    });
    
    socket.on('leaderboard-update', (data) => {
      io.to(`event-${data.eventId}`).emit('leaderboard-changed', data);
    });
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
  
  // Make io accessible to API routes
  server.set('io', io);
  
  // Handle all other routes with Next.js
  server.all('*', (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });
  
  // Start server
  httpServer.listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`> WebSocket support enabled`);
  });
});