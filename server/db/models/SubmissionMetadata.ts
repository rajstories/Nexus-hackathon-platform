import mongoose from 'mongoose';

// MongoDB schema for file metadata and additional submission data
const submissionMetadataSchema = new mongoose.Schema({
  submissionId: {
    type: String,
    required: true,
    index: true,
    description: 'Reference to PostgreSQL submission ID'
  },
  eventId: {
    type: String,
    required: true,
    index: true,
    description: 'Event UUID for organization'
  },
  teamId: {
    type: String,
    required: true,
    index: true,
    description: 'Team UUID for grouping'
  },
  
  // File metadata
  file: {
    originalName: {
      type: String,
      required: false,
      description: 'Original uploaded filename'
    },
    blobName: {
      type: String,
      required: false,
      description: 'Azure Blob Storage path'
    },
    mimeType: {
      type: String,
      required: false,
      description: 'File MIME type'
    },
    size: {
      type: Number,
      required: false,
      description: 'File size in bytes'
    },
    formattedSize: {
      type: String,
      required: false,
      description: 'Human-readable file size'
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
      description: 'File upload timestamp'
    },
    azureUrl: {
      type: String,
      required: false,
      description: 'Public Azure Blob Storage URL'
    }
  },
  
  // Additional flexible metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
    description: 'Additional flexible metadata for submissions'
  },
  
  // Processing status
  processing: {
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'error'],
      default: 'pending'
    },
    startedAt: Date,
    completedAt: Date,
    errorMessage: String
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
submissionMetadataSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for performance
submissionMetadataSchema.index({ submissionId: 1 });
submissionMetadataSchema.index({ eventId: 1, teamId: 1 });
submissionMetadataSchema.index({ createdAt: -1 });

export interface ISubmissionMetadata extends mongoose.Document {
  submissionId: string;
  eventId: string;
  teamId: string;
  file?: {
    originalName?: string;
    blobName?: string;
    mimeType?: string;
    size?: number;
    formattedSize?: string;
    uploadedAt?: Date;
    azureUrl?: string;
  };
  metadata: Record<string, any>;
  processing: {
    status: 'pending' | 'processing' | 'completed' | 'error';
    startedAt?: Date;
    completedAt?: Date;
    errorMessage?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const SubmissionMetadata = mongoose.model<ISubmissionMetadata>('SubmissionMetadata', submissionMetadataSchema);