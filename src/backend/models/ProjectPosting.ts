import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectPosting extends Document {
  companyId: mongoose.Types.ObjectId;
  title: string;
  summary: string;
  description: string;
  skills: string[];
  minBudget: number; // in dollars / base units
  maxBudget: number; // in dollars / base units
  currency: string;
  projectType: 'FIXED' | 'HOURLY';
  experienceLevel: 'ENTRY' | 'INTERMEDIATE' | 'EXPERT';
  duration: string;
  deadline?: Date;
  attachmentUrls: string[];
  requirements?: string;
  status: 'DRAFT' | 'OPEN' | 'FILLED' | 'CLOSED' | 'CANCELLED' | 'ARCHIVED';
  applicantCount: number;
  publishedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectPostingSchema = new Schema<IProjectPosting>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    summary: { type: String, required: true },
    description: { type: String, required: true },
    skills: { type: [String], required: true, index: true },
    minBudget: { type: Number, required: true },
    maxBudget: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    projectType: { type: String, enum: ['FIXED', 'HOURLY'], default: 'FIXED' },
    experienceLevel: { type: String, enum: ['ENTRY', 'INTERMEDIATE', 'EXPERT'], default: 'INTERMEDIATE' },
    duration: { type: String, required: true },
    deadline: { type: Date },
    attachmentUrls: { type: [String], default: [] },
    requirements: { type: String, default: '' },
    status: {
      type: String,
      enum: ['DRAFT', 'OPEN', 'FILLED', 'CLOSED', 'CANCELLED', 'ARCHIVED'],
      default: 'OPEN',
      index: true,
    },
    applicantCount: { type: Number, default: 0 },
    publishedDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ProjectPostingSchema.index({ title: 'text', summary: 'text', description: 'text' });

export const ProjectPostingModel =
  mongoose.models.ProjectPosting ||
  mongoose.model<IProjectPosting>('ProjectPosting', ProjectPostingSchema);
