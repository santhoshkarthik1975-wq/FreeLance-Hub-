import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  contractId: mongoose.Types.ObjectId;
  reviewerId: mongoose.Types.ObjectId;
  reviewerName: string;
  reviewerRole: 'FREELANCER' | 'COMPANY';
  revieweeId: mongoose.Types.ObjectId;
  rating: number; // 1 to 5
  reviewText: string;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    contractId: { type: Schema.Types.ObjectId, ref: 'Contract', required: true, index: true },
    reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reviewerName: { type: String, required: true },
    reviewerRole: { type: String, enum: ['FREELANCER', 'COMPANY'], required: true },
    revieweeId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    reviewText: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  }
);

// One review per reviewer per contract
ReviewSchema.index({ contractId: 1, reviewerId: 1 }, { unique: true });

export const ReviewModel =
  mongoose.models.Review ||
  mongoose.model<IReview>('Review', ReviewSchema);
