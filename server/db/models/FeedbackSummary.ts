import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedbackSummary extends Document {
  submission_id: string;
  summary: string[];
  next_steps: string[];
  created_at: Date;
  updated_at: Date;
}

const FeedbackSummarySchema = new Schema<IFeedbackSummary>({
  submission_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  summary: [{
    type: String,
    required: true
  }],
  next_steps: [{
    type: String,
    required: true
  }],
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update the updated_at field before saving
FeedbackSummarySchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

export const FeedbackSummary = mongoose.model<IFeedbackSummary>('FeedbackSummary', FeedbackSummarySchema);