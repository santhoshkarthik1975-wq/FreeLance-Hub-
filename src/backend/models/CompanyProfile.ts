import mongoose, { Schema, Document } from 'mongoose';

export interface ICompanyProfile extends Document {
  userId: mongoose.Types.ObjectId;
  companyName: string;
  logoUrl?: string;
  industry: string;
  description: string;
  websiteUrl?: string;
  location?: string;
  companySize: string;
  contactName: string;
  publicEmail?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CompanyProfileSchema = new Schema<ICompanyProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    companyName: { type: String, required: true },
    logoUrl: { type: String, default: '' },
    industry: { type: String, default: 'Technology' },
    description: { type: String, default: '' },
    websiteUrl: { type: String, default: '' },
    location: { type: String, default: '' },
    companySize: { type: String, default: '1-10' },
    contactName: { type: String, default: '' },
    publicEmail: { type: String, default: '' },
    socialLinks: {
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

export const CompanyProfileModel =
  mongoose.models.CompanyProfile ||
  mongoose.model<ICompanyProfile>('CompanyProfile', CompanyProfileSchema);
