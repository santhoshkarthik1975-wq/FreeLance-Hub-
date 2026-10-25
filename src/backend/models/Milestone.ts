import mongoose, { Schema, Document } from 'mongoose';

export interface IMilestone extends Document {
  contractId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  amount: number; // in integer minor units (cents)
  currency: string;
  sequenceNumber: number;
  dueDate?: Date;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'REVISION_REQUESTED' | 'APPROVED' | 'PAID';
  createdAt: Date;
  updatedAt: Date;
}

const MilestoneSchema = new Schema<IMilestone>(
  {
    contractId: { type: Schema.Types.ObjectId, ref: 'Contract', required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    amount: { type: Number, required: true }, // cents
    currency: { type: String, default: 'USD' },
    sequenceNumber: { type: Number, required: true, default: 1 },
    dueDate: { type: Date },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'SUBMITTED', 'REVISION_REQUESTED', 'APPROVED', 'PAID'],
      default: 'PENDING',
      index: true,
    },
  },
  { timestamps: true }
);

export const MilestoneModel =
  mongoose.models.Milestone ||
  mongoose.model<IMilestone>('Milestone', MilestoneSchema);
