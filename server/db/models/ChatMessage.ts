import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage extends Document {
  eventId: string;
  teamId?: string;
  userId: string;
  text: string;
  createdAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  eventId: {
    type: String,
    required: true,
    index: true
  },
  teamId: {
    type: String,
    required: false,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  text: {
    type: String,
    required: true,
    maxlength: 1000
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Create compound indexes for efficient queries
ChatMessageSchema.index({ eventId: 1, createdAt: -1 });
ChatMessageSchema.index({ teamId: 1, createdAt: -1 });
ChatMessageSchema.index({ eventId: 1, teamId: 1, createdAt: -1 });

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);