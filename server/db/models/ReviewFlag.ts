import mongoose, { Schema, Document } from 'mongoose';

export interface IReviewFlag extends Document {
  reviewId: string;
  reason: 'outlier_rating' | 'invalid_user' | 'suspicious_pattern';
  score?: number; // MAD z-score for outlier detection
  metadata?: {
    madScore?: number;
    eventAverageRating?: number;
    userRole?: string;
    detectionMethod?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ReviewFlagSchema = new Schema<IReviewFlag>({
  reviewId: {
    type: String,
    required: true,
    index: true,
  },
  reason: {
    type: String,
    enum: ['outlier_rating', 'invalid_user', 'suspicious_pattern'],
    required: true,
  },
  score: {
    type: Number,
    default: null,
  },
  metadata: {
    madScore: Number,
    eventAverageRating: Number,
    userRole: String,
    detectionMethod: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  collection: 'review_flags'
});

// Compound index for efficient queries
ReviewFlagSchema.index({ reviewId: 1, reason: 1 }, { unique: true });

export const ReviewFlag = mongoose.model<IReviewFlag>('ReviewFlag', ReviewFlagSchema);