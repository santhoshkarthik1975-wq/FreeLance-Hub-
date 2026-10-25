import { z } from 'zod';

export const RegisterFreelancerSchema = z
  .object({
    name: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    headline: z.string().optional(),
    skills: z.array(z.string()).optional(),
    agreeToTerms: z.boolean().refine((val) => val === true, 'You must agree to the terms and conditions'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const RegisterCompanySchema = z
  .object({
    contactName: z.string().min(2, 'Contact person name must be at least 2 characters'),
    email: z.string().email('Please enter a valid work email address'),
    companyName: z.string().min(2, 'Company name must be at least 2 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    industry: z.string().optional(),
    agreeToTerms: z.boolean().refine((val) => val === true, 'You must agree to the terms and conditions'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const LoginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const ProjectPostingSchema = z
  .object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(120),
    summary: z.string().min(10, 'Summary must be at least 10 characters').max(300),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    skills: z.array(z.string()).min(1, 'At least one skill is required'),
    minBudget: z.number().min(1, 'Minimum budget must be greater than 0'),
    maxBudget: z.number().min(1, 'Maximum budget must be greater than 0'),
    currency: z.string().default('USD'),
    projectType: z.enum(['FIXED', 'HOURLY']).default('FIXED'),
    experienceLevel: z.enum(['ENTRY', 'INTERMEDIATE', 'EXPERT']).default('INTERMEDIATE'),
    duration: z.string().min(1, 'Expected duration is required'),
    deadline: z.string().optional(),
    attachmentUrls: z.array(z.string().url('Attachment must be a valid URL')).optional(),
    requirements: z.string().optional(),
    status: z.enum(['DRAFT', 'OPEN', 'FILLED', 'CLOSED', 'CANCELLED', 'ARCHIVED']).default('OPEN'),
  })
  .refine((data) => data.minBudget <= data.maxBudget, {
    message: 'Minimum budget cannot exceed maximum budget',
    path: ['minBudget'],
  });

export const ApplicationSubmissionSchema = z.object({
  coverLetter: z.string().min(20, 'Cover letter must be at least 20 characters'),
  proposedAmount: z.number().min(1, 'Proposed bid amount must be greater than 0'),
  currency: z.string().default('USD'),
  estimatedDuration: z.string().min(1, 'Estimated delivery time is required'),
  portfolioUrl: z.string().url('Portfolio link must be a valid URL').optional().or(z.literal('')),
});

export const MilestoneCreateSchema = z.object({
  title: z.string().min(3, 'Milestone title is required'),
  description: z.string().optional(),
  amountMajor: z.number().min(1, 'Milestone amount must be at least $1'),
  dueDate: z.string().optional(),
});

export const DeliverableSubmissionSchema = z.object({
  message: z.string().min(10, 'Submission message must be at least 10 characters'),
  deliverableUrl: z.string().url('Deliverable URL must be a valid web link (e.g. GitHub PR, preview link)'),
  attachmentUrls: z.array(z.string()).optional(),
});

export const RevisionRequestSchema = z.object({
  feedback: z.string().min(5, 'Revision feedback must be at least 5 characters explaining what needs adjustment'),
});

export const SimulatedPaymentSchema = z.object({
  idempotencyKey: z.string().min(6, 'Valid idempotency key is required'),
});

export const ReviewSubmissionSchema = z.object({
  rating: z.number().min(1).max(5),
  reviewText: z.string().min(5, 'Review comment must be at least 5 characters'),
});
