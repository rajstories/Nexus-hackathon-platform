import mongoose, { Schema, Document } from 'mongoose';

export interface IAnnouncement extends Document {
  eventId: string;
  message: string;
  createdAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>({
  eventId: {
    type: String,
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 2000
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Create compound index for efficient queries
AnnouncementSchema.index({ eventId: 1, createdAt: -1 });

export const Announcement = mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);