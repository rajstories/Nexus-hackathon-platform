import mongoose, { Document, Schema } from 'mongoose';

export interface IClarification extends Document {
  submissionId: string;
  userId: string;
  text: string;
  createdAt: Date;
  status: 'open' | 'answered' | 'rejected';
  reply?: {
    text: string;
    repliedBy: string;
    repliedAt: Date;
  };
}

const ClarificationSchema = new Schema<IClarification>({
  submissionId: {
    type: String,
    required: true,
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
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  status: {
    type: String,
    enum: ['open', 'answered', 'rejected'],
    default: 'open',
    index: true
  },
  reply: {
    text: {
      type: String,
      maxlength: 1000
    },
    repliedBy: {
      type: String
    },
    repliedAt: {
      type: Date
    }
  }
});

// Compound index for efficient queries
ClarificationSchema.index({ submissionId: 1, userId: 1 }, { unique: true });
ClarificationSchema.index({ submissionId: 1, status: 1 });

export const Clarification = mongoose.model<IClarification>('Clarification', ClarificationSchema);