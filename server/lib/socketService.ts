import { Server as SocketIOServer, Socket } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { verifyFirebaseTokenSocket, type SocketUser } from './firebase-admin';
import { Announcement, ChatMessage, isMongoConnected, connectMongoDB } from '../db/mongo';
import { db } from '../db';
import { users, events } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export interface AuthenticatedSocket extends Socket {
  user?: SocketUser;
}

export interface AnnouncementData {
  title: string;
  content: string;
  type?: 'announcement' | 'alert' | 'update';
  priority?: 'low' | 'medium' | 'high';
}

export interface ChatMessageData {
  message: string;
  type?: 'question' | 'answer' | 'general';
  parentMessageId?: string;
}

class SocketService {
  private io: SocketIOServer | null = null;
  
  initialize(httpServer: HttpServer): SocketIOServer {
    // Initialize Socket.IO with Azure App Service WebSocket support
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? [process.env.FRONTEND_URL || 'https://*.azurewebsites.net'] 
          : ['http://localhost:3000', 'http://localhost:5000'],
        methods: ['GET', 'POST'],
        credentials: true,
      },
      // Azure App Service WebSocket configuration
      transports: ['websocket', 'polling'],
      allowEIO3: true,
      // Disable sticky sessions for Azure App Service
      adapter: undefined,
    });

    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
        
        if (!token) {
          throw new Error('No authentication token provided');
        }

        // Verify Firebase token
        const user = await verifyFirebaseTokenSocket(token);
        socket.user = user;
        
        console.log(`Socket authenticated: ${user.name} (${user.role})`);
        next();
      } catch (error) {
        console.error('Socket authentication failed:', error);
        next(new Error('Authentication failed'));
      }
    });

    // Handle connections
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User connected: ${socket.user?.name} (${socket.id})`);
      
      // Handle joining event namespace
      socket.on('join-event', async (eventId: string) => {
        try {
          await this.handleJoinEvent(socket, eventId);
        } catch (error) {
          console.error('Join event error:', error);
          socket.emit('error', { message: 'Failed to join event' });
        }
      });

      // Handle leaving event namespace
      socket.on('leave-event', (eventId: string) => {
        socket.leave(`event:${eventId}`);
        console.log(`${socket.user?.name} left event ${eventId}`);
      });

      // Handle announcements (organizer only)
      socket.on('create-announcement', async (eventId: string, data: AnnouncementData) => {
        try {
          await this.handleCreateAnnouncement(socket, eventId, data);
        } catch (error) {
          console.error('Create announcement error:', error);
          socket.emit('error', { message: 'Failed to create announcement' });
        }
      });

      // Handle chat messages
      socket.on('send-message', async (eventId: string, data: ChatMessageData) => {
        try {
          await this.handleSendMessage(socket, eventId, data);
        } catch (error) {
          console.error('Send message error:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle get chat history
      socket.on('get-chat-history', async (eventId: string) => {
        try {
          await this.handleGetChatHistory(socket, eventId);
        } catch (error) {
          console.error('Get chat history error:', error);
          socket.emit('error', { message: 'Failed to get chat history' });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.user?.name} (${socket.id})`);
      });
    });

    return this.io;
  }

  private async handleJoinEvent(socket: AuthenticatedSocket, eventId: string): Promise<void> {
    if (!socket.user) {
      throw new Error('User not authenticated');
    }

    // Verify user has access to this event (participant, organizer, or judge)
    try {
      const [event] = await db
        .select()
        .from(events)
        .where(eq(events.id, eventId))
        .limit(1);

      if (!event) {
        throw new Error('Event not found');
      }

      // Join the event room
      socket.join(`event:${eventId}`);
      console.log(`${socket.user.name} joined event ${eventId}`);

      // Send recent announcements
      if (isMongoConnected()) {
        const recentAnnouncements = await Announcement
          .find({ eventId })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean();

        socket.emit('announcements-history', recentAnnouncements);
      }

      // Notify user joined successfully
      socket.emit('joined-event', { 
        eventId, 
        eventTitle: event.title,
        userRole: socket.user.role 
      });

    } catch (error) {
      console.error('Event join error:', error);
      throw error;
    }
  }

  private async handleCreateAnnouncement(
    socket: AuthenticatedSocket, 
    eventId: string, 
    data: AnnouncementData
  ): Promise<void> {
    if (!socket.user) {
      throw new Error('User not authenticated');
    }

    // Only organizers can create announcements
    if (socket.user.role !== 'organizer') {
      throw new Error('Only organizers can create announcements');
    }

    // Verify organizer owns this event
    const [event] = await db
      .select()
      .from(events)
      .where(
        and(
          eq(events.id, eventId),
          eq(events.organizerId, socket.user.userId)
        )
      )
      .limit(1);

    if (!event) {
      throw new Error('Event not found or access denied');
    }

    // Save announcement to MongoDB
    let savedAnnouncement = null;
    if (isMongoConnected()) {
      try {
        await connectMongoDB();
        
        const announcement = new Announcement({
          eventId,
          title: data.title,
          content: data.content,
          authorId: socket.user.userId,
          authorName: socket.user.name,
          type: data.type || 'announcement',
          priority: data.priority || 'medium',
        });

        savedAnnouncement = await announcement.save();
      } catch (mongoError) {
        console.error('Failed to save announcement to MongoDB:', mongoError);
        // Continue without MongoDB - announcement will still be broadcast
      }
    }

    // Broadcast announcement to all participants in this event
    const announcementPayload = {
      id: savedAnnouncement?._id?.toString() || `temp-${Date.now()}`,
      eventId,
      title: data.title,
      content: data.content,
      authorId: socket.user.userId,
      authorName: socket.user.name,
      type: data.type || 'announcement',
      priority: data.priority || 'medium',
      createdAt: savedAnnouncement?.createdAt || new Date(),
    };

    this.io?.to(`event:${eventId}`).emit('new-announcement', announcementPayload);

    // Confirm to sender
    socket.emit('announcement-sent', announcementPayload);
  }

  private async handleSendMessage(
    socket: AuthenticatedSocket, 
    eventId: string, 
    data: ChatMessageData
  ): Promise<void> {
    if (!socket.user) {
      throw new Error('User not authenticated');
    }

    // Verify user has access to this event
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) {
      throw new Error('Event not found');
    }

    // Save message to MongoDB
    let savedMessage = null;
    if (isMongoConnected()) {
      try {
        await connectMongoDB();
        
        const message = new ChatMessage({
          eventId,
          authorId: socket.user.userId,
          authorName: socket.user.name,
          authorRole: socket.user.role,
          message: data.message,
          type: data.type || 'general',
          parentMessageId: data.parentMessageId || null,
          isAnswer: data.type === 'answer',
        });

        savedMessage = await message.save();
      } catch (mongoError) {
        console.error('Failed to save message to MongoDB:', mongoError);
        // Continue without MongoDB - message will still be broadcast
      }
    }

    // Broadcast message to all participants in this event
    const messagePayload = {
      id: savedMessage?._id?.toString() || `temp-${Date.now()}`,
      eventId,
      authorId: socket.user.userId,
      authorName: socket.user.name,
      authorRole: socket.user.role,
      message: data.message,
      type: data.type || 'general',
      parentMessageId: data.parentMessageId || null,
      isAnswer: data.type === 'answer',
      createdAt: savedMessage?.createdAt || new Date(),
    };

    this.io?.to(`event:${eventId}`).emit('new-message', messagePayload);

    // Confirm to sender
    socket.emit('message-sent', messagePayload);
  }

  private async handleGetChatHistory(socket: AuthenticatedSocket, eventId: string): Promise<void> {
    if (!socket.user) {
      throw new Error('User not authenticated');
    }

    if (!isMongoConnected()) {
      socket.emit('chat-history', []);
      return;
    }

    try {
      await connectMongoDB();
      
      const messages = await ChatMessage
        .find({ eventId })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

      socket.emit('chat-history', messages.reverse());
    } catch (error) {
      console.error('Failed to get chat history:', error);
      socket.emit('chat-history', []);
    }
  }

  // Get Socket.IO instance
  getIO(): SocketIOServer | null {
    return this.io;
  }

  // Emit to specific event room
  emitToEvent(eventId: string, event: string, data: any): void {
    if (this.io) {
      this.io.to(`event:${eventId}`).emit(event, data);
    }
  }

  // Get connected users count for an event
  async getEventParticipants(eventId: string): Promise<number> {
    if (!this.io) return 0;
    
    try {
      const sockets = await this.io.in(`event:${eventId}`).fetchSockets();
      return sockets.length;
    } catch (error) {
      console.error('Failed to get event participants:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;