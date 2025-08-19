import mongoose from 'mongoose';

// Connection configuration
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fusion-x';

let isConnected = false;

/**
 * Connect to MongoDB
 */
export async function connectMongoDB(): Promise<void> {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    isConnected = true;
    console.log('Connected to MongoDB');
    
    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
      isConnected = true;
    });

  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    isConnected = false;
    throw error;
  }
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectMongoDB(): Promise<void> {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('Disconnected from MongoDB');
  }
}

/**
 * Check MongoDB connection status
 */
export function isMongoConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

/**
 * Get MongoDB connection status for health checks
 */
export async function getMongoHealth(): Promise<'ok' | 'error'> {
  try {
    if (!isConnected) {
      await connectMongoDB();
    }
    
    // Ping the database
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }
    await db.admin().ping();
    return 'ok';
  } catch (error) {
    console.error('MongoDB health check failed:', error);
    return 'error';
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectMongoDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectMongoDB();
  process.exit(0);
});

// MongoDB Models
const announcementSchema = new mongoose.Schema({
  eventId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  authorId: { type: String, required: true },
  authorName: { type: String, required: true },
  type: { type: String, enum: ['announcement', 'alert', 'update'], default: 'announcement' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  createdAt: { type: Date, default: Date.now },
});

const chatMessageSchema = new mongoose.Schema({
  eventId: { type: String, required: true, index: true },
  teamId: { type: String, index: true }, // Optional, for team-specific chat
  authorId: { type: String, required: true },
  authorName: { type: String, required: true },
  authorRole: { type: String, enum: ['participant', 'organizer', 'judge'], default: 'participant' },
  message: { type: String, required: true },
  type: { type: String, enum: ['question', 'answer', 'general'], default: 'general' },
  parentMessageId: { type: String, index: true }, // For threaded Q&A responses
  isAnswer: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const similarityIndexSchema = new mongoose.Schema({
  submissionId: { type: String, required: true, unique: true, index: true },
  eventId: { type: String, required: true, index: true },
  embedding: [Number], // Vector embedding for similarity
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
});

export const Announcement = mongoose.model('Announcement', announcementSchema);
export const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
export const SimilarityIndex = mongoose.model('SimilarityIndex', similarityIndexSchema);