import mongoose, { Schema, Document } from 'mongoose';

export interface IContract extends Document {
  postingId: mongoose.Types.ObjectId;
  applicationId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  freelancerId: mongoose.Types.ObjectId;
  contractTitle: string;
  agreedAmount: number; // in integer minor units (cents)
  currency: string;
  projectType: 'FIXED' | 'HOURLY';
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
  startDate: Date;
  expectedCompletionDate?: Date;
  completionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ContractSchema = new Schema<IContract>(
  {
    postingId: { type: Schema.Types.ObjectId, ref: 'ProjectPosting', required: true, unique: true },
    applicationId: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    freelancerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    contractTitle: { type: String, required: true },
    agreedAmount: { type: Number, required: true }, // in integer minor units (cents)
    currency: { type: String, default: 'USD' },
    projectType: { type: String, enum: ['FIXED', 'HOURLY'], default: 'FIXED' },
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETED', 'CANCELLED', 'DISPUTED'],
      default: 'ACTIVE',
      index: true,
    },
    startDate: { type: Date, default: Date.now },
    expectedCompletionDate: { type: Date },
    completionDate: { type: Date },
  },
  { timestamps: true }
);

export const ContractModel =
  mongoose.models.Contract ||
  mongoose.model<IContract>('Contract', ContractSchema);
