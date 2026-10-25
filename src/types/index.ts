export type UserRole = 'FREELANCER' | 'COMPANY';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
}

export type ExperienceLevel = 'ENTRY' | 'INTERMEDIATE' | 'EXPERT';
export type AvailabilityStatus = 'AVAILABLE' | 'BUSY' | 'NOT_AVAILABLE';

export interface FreelancerProfile {
  _id: string;
  userId: string;
  headline: string;
  biography: string;
  skills: string[];
  experienceLevel: ExperienceLevel;
  yearsOfExperience: number;
  hourlyRate: number;
  currency: string;
  location?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  profileImageUrl?: string;
  availability: AvailabilityStatus;
  languages?: string[];
  profileCompletion: number;
  rating?: number;
  reviewCount?: number;
}

export interface CompanyProfile {
  _id: string;
  userId: string;
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
  profileCompletion: number;
  rating?: number;
  reviewCount?: number;
}

export type ProjectPostingStatus = 'DRAFT' | 'OPEN' | 'FILLED' | 'CLOSED' | 'CANCELLED' | 'ARCHIVED';
export type ProjectType = 'FIXED' | 'HOURLY';

export interface ProjectPosting {
  _id: string;
  companyId: string;
  company?: {
    _id: string;
    name: string;
    profile?: CompanyProfile;
  };
  title: string;
  summary: string;
  description: string;
  skills: string[];
  minBudget: number;
  maxBudget: number;
  currency: string;
  projectType: ProjectType;
  experienceLevel: ExperienceLevel;
  duration: string;
  deadline?: string;
  attachmentUrls?: string[];
  requirements?: string;
  status: ProjectPostingStatus;
  applicantCount: number;
  publishedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

export interface Application {
  _id: string;
  postingId: string;
  posting?: ProjectPosting;
  freelancerId: string;
  freelancer?: {
    _id: string;
    name: string;
    email: string;
    profile?: FreelancerProfile;
  };
  coverLetter: string;
  proposedAmount: number;
  currency: string;
  estimatedDuration: string;
  portfolioUrl?: string;
  status: ApplicationStatus;
  appliedDate: string;
  updatedAt: string;
}

export type ContractStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';

export interface Contract {
  _id: string;
  postingId: string;
  postingTitle?: string;
  applicationId: string;
  companyId: string;
  companyName?: string;
  company?: {
    _id: string;
    name: string;
    profile?: CompanyProfile;
  };
  freelancerId: string;
  freelancerName?: string;
  freelancer?: {
    _id: string;
    name: string;
    profile?: FreelancerProfile;
  };
  contractTitle: string;
  agreedAmount: number; // In minor units (cents)
  currency: string;
  projectType: ProjectType;
  status: ContractStatus;
  startDate: string;
  expectedCompletionDate?: string;
  completionDate?: string;
  milestones?: Milestone[];
  createdAt: string;
  updatedAt: string;
}

export type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'REVISION_REQUESTED' | 'APPROVED' | 'PAID';

export interface Milestone {
  _id: string;
  contractId: string;
  title: string;
  description: string;
  amount: number; // minor units (cents)
  currency: string;
  sequenceNumber: number;
  dueDate?: string;
  status: MilestoneStatus;
  submissions?: DeliverableSubmission[];
  createdAt: string;
  updatedAt: string;
}

export interface DeliverableSubmission {
  _id: string;
  milestoneId: string;
  submittedBy: string;
  message: string;
  deliverableUrl: string;
  attachmentUrls?: string[];
  revisionFeedback?: string;
  createdAt: string;
}

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface Payment {
  _id: string;
  contractId: string;
  contractTitle?: string;
  milestoneId: string;
  milestoneTitle?: string;
  companyId: string;
  companyName?: string;
  freelancerId: string;
  freelancerName?: string;
  amount: number; // minor units (cents)
  currency: string;
  provider: 'DEMO';
  idempotencyKey: string;
  status: PaymentStatus;
  createdAt: string;
  completedDate?: string;
  failureReason?: string;
}

export interface Notification {
  _id: string;
  recipientId: string;
  type: string;
  title: string;
  message: string;
  resourceType?: string;
  resourceId?: string;
  isRead: boolean;
  createdAt: string;
  readDate?: string;
}

export interface Review {
  _id: string;
  contractId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: UserRole;
  revieweeId: string;
  rating: number; // 1-5
  reviewText: string;
  createdAt: string;
}

export interface FreelancerAnalytics {
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  activeContracts: number;
  completedContracts: number;
  totalCompletedEarningsMinor: number;
  pendingPaymentsMinor: number;
  applicationStatusDistribution: { status: string; count: number }[];
  monthlyEarnings: { month: string; amountMinor: number }[];
  recentActivity: { id: string; title: string; date: string; type: string }[];
}

export interface CompanyAnalytics {
  totalPostings: number;
  openPostings: number;
  filledPostings: number;
  activeContracts: number;
  completedContracts: number;
  totalApplications: number;
  pendingReviewCount: number;
  hiringConversionRate: number; // percentage
  totalSpentMinor: number;
  monthlySpending: { month: string; amountMinor: number }[];
  applicationStatusDistribution: { status: string; count: number }[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  code?: string;
  error?: string;
}
