import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
  postingId: mongoose.Types.ObjectId;
  freelancerId: mongoose.Types.ObjectId;
  coverLetter: string;
  proposedAmount: number;
  currency: string;
  estimatedDuration: string;
  portfolioUrl?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  appliedDate: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    postingId: { type: Schema.Types.ObjectId, ref: 'ProjectPosting', required: true, index: true },
    freelancerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    coverLetter: { type: String, required: true },
    proposedAmount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    estimatedDuration: { type: String, required: true },
    portfolioUrl: { type: String, default: '' },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'],
      default: 'PENDING',
      index: true,
    },
    appliedDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Enforce one application per freelancer per posting
ApplicationSchema.index({ postingId: 1, freelancerId: 1 }, { unique: true });

export const ApplicationModel =
  mongoose.models.Application ||
  mongoose.model<IApplication>('Application', ApplicationSchema);
