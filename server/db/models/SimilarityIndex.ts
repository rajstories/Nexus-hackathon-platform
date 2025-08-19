import mongoose, { Schema, Document } from 'mongoose';

export interface ISimilarityIndex extends Document {
  submissionId: string;
  vector: number[];
  meta: Record<string, any>;
}

const SimilarityIndexSchema = new Schema<ISimilarityIndex>({
  submissionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  vector: {
    type: [Number],
    required: true,
    validate: {
      validator: function(v: number[]) {
        return v && v.length > 0 && v.length <= 1024; // Reasonable vector size limit
      },
      message: 'Vector must be a non-empty array with max 1024 dimensions'
    }
  },
  meta: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Create index for similarity search operations
SimilarityIndexSchema.index({ submissionId: 1 });

export const SimilarityIndex = mongoose.model<ISimilarityIndex>('SimilarityIndex', SimilarityIndexSchema);