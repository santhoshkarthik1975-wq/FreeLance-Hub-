import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  contractId: mongoose.Types.ObjectId;
  milestoneId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  freelancerId: mongoose.Types.ObjectId;
  amount: number; // in integer minor units (cents)
  currency: string;
  provider: 'DEMO';
  idempotencyKey: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  failureReason?: string;
  completedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    contractId: { type: Schema.Types.ObjectId, ref: 'Contract', required: true, index: true },
    milestoneId: { type: Schema.Types.ObjectId, ref: 'Milestone', required: true, index: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    freelancerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true }, // integer minor units
    currency: { type: String, default: 'USD' },
    provider: { type: String, default: 'DEMO' },
    idempotencyKey: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'],
      default: 'COMPLETED',
      index: true,
    },
    failureReason: { type: String },
    completedDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const PaymentModel =
  mongoose.models.Payment ||
  mongoose.model<IPayment>('Payment', PaymentSchema);
