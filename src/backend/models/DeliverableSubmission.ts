import mongoose, { Schema, Document } from 'mongoose';

export interface IDeliverableSubmission extends Document {
  milestoneId: mongoose.Types.ObjectId;
  submittedBy: mongoose.Types.ObjectId;
  message: string;
  deliverableUrl: string;
  attachmentUrls: string[];
  revisionFeedback?: string;
  createdAt: Date;
}

const DeliverableSubmissionSchema = new Schema<IDeliverableSubmission>(
  {
    milestoneId: { type: Schema.Types.ObjectId, ref: 'Milestone', required: true, index: true },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    deliverableUrl: { type: String, required: true },
    attachmentUrls: { type: [String], default: [] },
    revisionFeedback: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
  }
);

export const DeliverableSubmissionModel =
  mongoose.models.DeliverableSubmission ||
  mongoose.model<IDeliverableSubmission>('DeliverableSubmission', DeliverableSubmissionSchema);
