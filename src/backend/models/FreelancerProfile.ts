import mongoose, { Schema, Document } from 'mongoose';

export interface IFreelancerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  headline: string;
  biography: string;
  skills: string[];
  experienceLevel: 'ENTRY' | 'INTERMEDIATE' | 'EXPERT';
  yearsOfExperience: number;
  hourlyRate: number;
  currency: string;
  location?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  profileImageUrl?: string;
  availability: 'AVAILABLE' | 'BUSY' | 'NOT_AVAILABLE';
  languages?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const FreelancerProfileSchema = new Schema<IFreelancerProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    headline: { type: String, default: '' },
    biography: { type: String, default: '' },
    skills: { type: [String], default: [] },
    experienceLevel: { type: String, enum: ['ENTRY', 'INTERMEDIATE', 'EXPERT'], default: 'INTERMEDIATE' },
    yearsOfExperience: { type: Number, default: 1 },
    hourlyRate: { type: Number, default: 35 },
    currency: { type: String, default: 'USD' },
    location: { type: String, default: '' },
    portfolioUrl: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    profileImageUrl: { type: String, default: '' },
    availability: { type: String, enum: ['AVAILABLE', 'BUSY', 'NOT_AVAILABLE'], default: 'AVAILABLE' },
    languages: { type: [String], default: ['English'] },
  },
  { timestamps: true }
);

export const FreelancerProfileModel =
  mongoose.models.FreelancerProfile ||
  mongoose.model<IFreelancerProfile>('FreelancerProfile', FreelancerProfileSchema);
