import mongoose, { Schema, Document } from 'mongoose';

export interface ISimilarityIndex extends Document {
  eventId: string;
  submission1Id: string;
  submission1Title: string;
  submission1TeamName: string;
  submission2Id: string;
  submission2Title: string;
  submission2TeamName: string;
  similarityScore: number;
  textSnippet1?: string;
  textSnippet2?: string;
  detectedAt: Date;
  reviewed: boolean;
  reviewedBy?: string;
  reviewNotes?: string;
}

const SimilarityIndexSchema = new Schema<ISimilarityIndex>({
  eventId: { type: String, required: true, index: true },
  submission1Id: { type: String, required: true },
  submission1Title: { type: String, required: true },
  submission1TeamName: { type: String, required: true },
  submission2Id: { type: String, required: true },
  submission2Title: { type: String, required: true },
  submission2TeamName: { type: String, required: true },
  similarityScore: { type: Number, required: true, min: 0, max: 1 },
  textSnippet1: { type: String },
  textSnippet2: { type: String },
  detectedAt: { type: Date, default: Date.now },
  reviewed: { type: Boolean, default: false },
  reviewedBy: { type: String },
  reviewNotes: { type: String }
}, {
  timestamps: true
});

// Compound index for efficient queries
SimilarityIndexSchema.index({ eventId: 1, similarityScore: -1 });
SimilarityIndexSchema.index({ submission1Id: 1, submission2Id: 1 });

// Ensure we don't duplicate pairs (A-B is same as B-A)
SimilarityIndexSchema.index({ 
  eventId: 1, 
  submission1Id: 1, 
  submission2Id: 1 
}, { unique: true });

// Check if model exists before creating to avoid OverwriteModelError
export const SimilarityIndex = mongoose.models.SimilarityIndex || 
  mongoose.model<ISimilarityIndex>('SimilarityIndex', SimilarityIndexSchema);