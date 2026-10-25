import bcrypt from 'bcryptjs';
import { dbStatus } from '../config/db.ts';

// Helper to generate realistic MongoDB-like hex IDs
export function generateId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const randomChars = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return (timestamp + randomChars).toLowerCase();
}

// In-Memory collections for resilient preview execution + synchronization
export interface UserRecord {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'FREELANCER' | 'COMPANY';
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
}

export interface FreelancerProfileRecord {
  _id: string;
  userId: string;
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
  profileCompletion: number;
  rating?: number;
  reviewCount?: number;
}

export interface CompanyProfileRecord {
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

export interface ProjectPostingRecord {
  _id: string;
  companyId: string;
  title: string;
  summary: string;
  description: string;
  skills: string[];
  minBudget: number;
  maxBudget: number;
  currency: string;
  projectType: 'FIXED' | 'HOURLY';
  experienceLevel: 'ENTRY' | 'INTERMEDIATE' | 'EXPERT';
  duration: string;
  deadline?: string;
  attachmentUrls?: string[];
  requirements?: string;
  status: 'DRAFT' | 'OPEN' | 'FILLED' | 'CLOSED' | 'CANCELLED' | 'ARCHIVED';
  applicantCount: number;
  publishedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationRecord {
  _id: string;
  postingId: string;
  freelancerId: string;
  coverLetter: string;
  proposedAmount: number;
  currency: string;
  estimatedDuration: string;
  portfolioUrl?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  appliedDate: string;
  updatedAt: string;
}

export interface ContractRecord {
  _id: string;
  postingId: string;
  applicationId: string;
  companyId: string;
  freelancerId: string;
  contractTitle: string;
  agreedAmount: number; // in integer minor units (cents)
  currency: string;
  projectType: 'FIXED' | 'HOURLY';
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
  startDate: string;
  expectedCompletionDate?: string;
  completionDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MilestoneRecord {
  _id: string;
  contractId: string;
  title: string;
  description: string;
  amount: number; // in cents
  currency: string;
  sequenceNumber: number;
  dueDate?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'REVISION_REQUESTED' | 'APPROVED' | 'PAID';
  createdAt: string;
  updatedAt: string;
}

export interface DeliverableSubmissionRecord {
  _id: string;
  milestoneId: string;
  submittedBy: string;
  message: string;
  deliverableUrl: string;
  attachmentUrls: string[];
  revisionFeedback?: string;
  createdAt: string;
}

export interface PaymentRecord {
  _id: string;
  contractId: string;
  milestoneId: string;
  companyId: string;
  freelancerId: string;
  amount: number; // cents
  currency: string;
  provider: 'DEMO';
  idempotencyKey: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  failureReason?: string;
  createdAt: string;
  completedDate?: string;
}

export interface NotificationRecord {
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

export interface ReviewRecord {
  _id: string;
  contractId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: 'FREELANCER' | 'COMPANY';
  revieweeId: string;
  rating: number;
  reviewText: string;
  createdAt: string;
}

class InMemoryDataStore {
  users: UserRecord[] = [];
  freelancerProfiles: FreelancerProfileRecord[] = [];
  companyProfiles: CompanyProfileRecord[] = [];
  projectPostings: ProjectPostingRecord[] = [];
  applications: ApplicationRecord[] = [];
  contracts: ContractRecord[] = [];
  milestones: MilestoneRecord[] = [];
  deliverables: DeliverableSubmissionRecord[] = [];
  payments: PaymentRecord[] = [];
  notifications: NotificationRecord[] = [];
  reviews: ReviewRecord[] = [];

  constructor() {
    this.seedInitialData();
  }

  seedInitialData() {
    // Fictional hashed password: "DemoPassword123!" or "Demo1234!"
    const demoPasswordHash = bcrypt.hashSync('Demo1234!', 10);

    const companyUser: UserRecord = {
      _id: '671ba0010000000000000001',
      name: 'Apex Innovations HQ',
      email: 'company.demo@example.com',
      passwordHash: demoPasswordHash,
      role: 'COMPANY',
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    };

    const freelancerUser: UserRecord = {
      _id: '671ba0010000000000000002',
      name: 'Alex Morgan',
      email: 'freelancer.demo@example.com',
      passwordHash: demoPasswordHash,
      role: 'FREELANCER',
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    };

    const secondFreelancer: UserRecord = {
      _id: '671ba0010000000000000003',
      name: 'Elena Rostova',
      email: 'elena.rostova@example.com',
      passwordHash: demoPasswordHash,
      role: 'FREELANCER',
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    };

    const secondCompany: UserRecord = {
      _id: '671ba0010000000000000004',
      name: 'Starlight Digital Lab',
      email: 'contact@starlightlab.demo',
      passwordHash: demoPasswordHash,
      role: 'COMPANY',
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 28 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 28 * 86400000).toISOString(),
    };

    this.users = [companyUser, freelancerUser, secondFreelancer, secondCompany];

    // Company profile
    this.companyProfiles = [
      {
        _id: '671ba0020000000000000001',
        userId: companyUser._id,
        companyName: 'Apex Innovations Inc.',
        logoUrl: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=150&auto=format&fit=crop&q=80',
        industry: 'FinTech & Cloud Systems',
        description:
          'Apex Innovations builds next-generation financial technology and scalable cloud infrastructure for modern enterprise teams.',
        websiteUrl: 'https://apex-innovations.demo.io',
        location: 'San Francisco, CA',
        companySize: '51-200 employees',
        contactName: 'David Vance',
        publicEmail: 'talent@apex-innovations.demo.io',
        socialLinks: {
          linkedin: 'https://linkedin.com/company/apex-innovations-demo',
          twitter: 'https://twitter.com/apex_demo',
        },
        profileCompletion: 100,
        rating: 4.9,
        reviewCount: 14,
      },
      {
        _id: '671ba0020000000000000002',
        userId: secondCompany._id,
        companyName: 'Starlight Digital Lab',
        logoUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=150&auto=format&fit=crop&q=80',
        industry: 'Digital Design & Mobile',
        description: 'Boutique digital studio specializing in responsive web applications and high-fidelity user experiences.',
        websiteUrl: 'https://starlight.demo',
        location: 'Austin, TX',
        companySize: '11-50 employees',
        contactName: 'Sarah Jenkins',
        publicEmail: 'jobs@starlight.demo',
        profileCompletion: 88,
        rating: 4.8,
        reviewCount: 8,
      },
    ];

    // Freelancer profile
    this.freelancerProfiles = [
      {
        _id: '671ba0030000000000000001',
        userId: freelancerUser._id,
        headline: 'Senior Full Stack TypeScript & Cloud Architect',
        biography:
          'Passionate software engineer with 6+ years specializing in React, Node.js, TypeScript, PostgreSQL, and scalable distributed architectures. Experienced in leading full-lifecycle projects from initial schema design to zero-downtime production deployments.',
        skills: ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Tailwind CSS', 'Docker', 'REST API', 'GraphQL'],
        experienceLevel: 'EXPERT',
        yearsOfExperience: 6,
        hourlyRate: 65,
        currency: 'USD',
        location: 'Seattle, WA (Remote)',
        portfolioUrl: 'https://alexmorgan-portfolio.demo.dev',
        githubUrl: 'https://github.com/alexmorgan-dev-demo',
        linkedinUrl: 'https://linkedin.com/in/alexmorgan-dev-demo',
        profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        availability: 'AVAILABLE',
        languages: ['English', 'Spanish'],
        profileCompletion: 100,
        rating: 4.95,
        reviewCount: 19,
      },
      {
        _id: '671ba0030000000000000002',
        userId: secondFreelancer._id,
        headline: 'Lead UI/UX Designer & Frontend Engineer',
        biography: 'Creative technologist crafting accessible design systems and fast React interfaces.',
        skills: ['UI/UX Design', 'Figma', 'React', 'CSS/Tailwind', 'Accessibility'],
        experienceLevel: 'INTERMEDIATE',
        yearsOfExperience: 4,
        hourlyRate: 50,
        currency: 'USD',
        location: 'Chicago, IL',
        portfolioUrl: 'https://elena-design.demo',
        availability: 'AVAILABLE',
        profileCompletion: 85,
        rating: 4.8,
        reviewCount: 11,
      },
    ];

    // Project Postings
    const posting1: ProjectPostingRecord = {
      _id: '671ba0040000000000000001',
      companyId: companyUser._id,
      title: 'Full-Stack SaaS Analytics Dashboard in React & Node.js',
      summary: 'Design and build an interactive analytics dashboard featuring real-time telemetry charts and role-based access control.',
      description:
        'Apex Innovations is looking for an experienced full-stack engineer to implement an enterprise analytics dashboard. The project involves building responsive data visualizations with Recharts, constructing optimized REST API endpoints with Express, and integrating JWT authentication with robust role permission checks.\n\nDeliverables include clean modular React components, typed API services, and unit test coverage.',
      skills: ['React', 'TypeScript', 'Node.js', 'Recharts', 'Express', 'Tailwind CSS'],
      minBudget: 3500,
      maxBudget: 5500,
      currency: 'USD',
      projectType: 'FIXED',
      experienceLevel: 'EXPERT',
      duration: '4 weeks',
      deadline: new Date(Date.now() + 21 * 86400000).toISOString(),
      attachmentUrls: ['https://example.com/specs/analytics-spec-v1.pdf'],
      requirements: 'Experience with Recharts, React 19, modular state management, and strict TypeScript types.',
      status: 'OPEN',
      applicantCount: 2,
      publishedDate: new Date(Date.now() - 5 * 86400000).toISOString(),
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    };

    const posting2: ProjectPostingRecord = {
      _id: '671ba0040000000000000002',
      companyId: companyUser._id,
      title: 'High-Throughput GraphQL API Microservice',
      summary: 'Production-ready GraphQL microservice with dataloaders, caching, and rate-limiting.',
      description:
        'Develop a containerized GraphQL service to aggregate data across internal databases with schema-first validation and automated security checks.',
      skills: ['Node.js', 'GraphQL', 'TypeScript', 'Docker', 'Redis'],
      minBudget: 5000,
      maxBudget: 5000,
      currency: 'USD',
      projectType: 'FIXED',
      experienceLevel: 'EXPERT',
      duration: '6 weeks',
      requirements: 'Prior experience building production GraphQL servers with caching and dataloaders.',
      status: 'FILLED', // Active contract underway!
      applicantCount: 3,
      publishedDate: new Date(Date.now() - 20 * 86400000).toISOString(),
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    };

    const posting3: ProjectPostingRecord = {
      _id: '671ba0040000000000000003',
      companyId: secondCompany._id,
      title: 'E-Commerce Checkout & Payment Flow Modernization',
      summary: 'Optimize checkout experience with modern multi-step form validation, idempotency, and responsive design.',
      description:
        'Modernize our client-facing checkout funnel to reduce cart abandonment. Requires clean React Hook Form integration, Zod schema validation, and accessible keyboard navigation.',
      skills: ['React', 'Zod', 'Tailwind CSS', 'React Hook Form'],
      minBudget: 2500,
      maxBudget: 4000,
      currency: 'USD',
      projectType: 'FIXED',
      experienceLevel: 'INTERMEDIATE',
      duration: '3 weeks',
      status: 'OPEN',
      applicantCount: 1,
      publishedDate: new Date(Date.now() - 3 * 86400000).toISOString(),
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    };

    const posting4: ProjectPostingRecord = {
      _id: '671ba0040000000000000004',
      companyId: secondCompany._id,
      title: 'Python Automation & ETL Pipeline for Market Data',
      summary: 'Automate daily ingestion and transformation of market feeds into cleaned JSON datasets.',
      description: 'Build automated Python ETL scripts running on cron schedules with logging, retry backoff, and error reporting.',
      skills: ['Python', 'ETL', 'Automation', 'Pandas'],
      minBudget: 2000,
      maxBudget: 3500,
      currency: 'USD',
      projectType: 'FIXED',
      experienceLevel: 'INTERMEDIATE',
      duration: '2 weeks',
      status: 'OPEN',
      applicantCount: 0,
      publishedDate: new Date(Date.now() - 1 * 86400000).toISOString(),
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    };

    const posting5: ProjectPostingRecord = {
      _id: '671ba0040000000000000005',
      companyId: companyUser._id,
      title: 'Enterprise Single Sign-On (SSO) & RBAC Security Audit',
      summary: 'Audit and implement SAML 2.0 / OAuth2 authentication flows with role-based policies.',
      description: 'Completed security project assessing and hardening company login workflows.',
      skills: ['Security', 'OAuth', 'Node.js', 'JWT'],
      minBudget: 4000,
      maxBudget: 4000,
      currency: 'USD',
      projectType: 'FIXED',
      experienceLevel: 'EXPERT',
      duration: '4 weeks',
      status: 'CLOSED',
      applicantCount: 4,
      publishedDate: new Date(Date.now() - 60 * 86400000).toISOString(),
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 35 * 86400000).toISOString(),
    };

    this.projectPostings = [posting1, posting2, posting3, posting4, posting5];

    // Applications
    const app1: ApplicationRecord = {
      _id: '671ba0050000000000000001',
      postingId: posting1._id,
      freelancerId: freelancerUser._id,
      coverLetter:
        'Hi David! I have spent the last 4 years architecting high-performance dashboards with React, Recharts, and Express. I can deliver pixel-perfect responsive layouts, typed API hooks, and full test suites within your timeline.',
      proposedAmount: 4800,
      currency: 'USD',
      estimatedDuration: '4 weeks',
      portfolioUrl: 'https://alexmorgan-portfolio.demo.dev',
      status: 'PENDING',
      appliedDate: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    };

    const app2: ApplicationRecord = {
      _id: '671ba0050000000000000002',
      postingId: posting2._id,
      freelancerId: freelancerUser._id,
      coverLetter:
        'I have delivered several enterprise GraphQL APIs with Node.js and Apollo Server. I will structure the schema, implement batching dataloaders, and set up Redis caching.',
      proposedAmount: 5000,
      currency: 'USD',
      estimatedDuration: '6 weeks',
      status: 'ACCEPTED',
      appliedDate: new Date(Date.now() - 18 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    };

    this.applications = [app1, app2];

    // Contract for posting 2
    const contract1: ContractRecord = {
      _id: '671ba0060000000000000001',
      postingId: posting2._id,
      applicationId: app2._id,
      companyId: companyUser._id,
      freelancerId: freelancerUser._id,
      contractTitle: 'High-Throughput GraphQL API Microservice',
      agreedAmount: 500000, // $5,000.00 stored in minor units (cents)
      currency: 'USD',
      projectType: 'FIXED',
      status: 'ACTIVE',
      startDate: new Date(Date.now() - 14 * 86400000).toISOString(),
      expectedCompletionDate: new Date(Date.now() + 28 * 86400000).toISOString(),
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    };

    this.contracts = [contract1];

    // Milestones for contract1
    const m1: MilestoneRecord = {
      _id: '671ba0070000000000000001',
      contractId: contract1._id,
      title: 'Milestone 1: Architecture & GraphQL Schema Design',
      description: 'Define type definitions, query/mutation contracts, and project directory scaffolding.',
      amount: 150000, // $1,500.00 in cents
      currency: 'USD',
      sequenceNumber: 1,
      dueDate: new Date(Date.now() - 7 * 86400000).toISOString(),
      status: 'PAID',
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    };

    const m2: MilestoneRecord = {
      _id: '671ba0070000000000000002',
      contractId: contract1._id,
      title: 'Milestone 2: Query Resolvers & Dataloader Caching',
      description: 'Implement core data resolvers, batching with DataLoader, and automated regression tests.',
      amount: 200000, // $2,000.00 in cents
      currency: 'USD',
      sequenceNumber: 2,
      dueDate: new Date(Date.now() - 1 * 86400000).toISOString(),
      status: 'APPROVED', // Ready for company to trigger simulated demo payment!
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    };

    const m3: MilestoneRecord = {
      _id: '671ba0070000000000000003',
      contractId: contract1._id,
      title: 'Milestone 3: Security Hardening, Rate Limiting & Deployment Docs',
      description: 'Add query complexity limits, rate limiting middleware, Dockerfile, and OpenAPI documentation.',
      amount: 150000, // $1,500.00 in cents
      currency: 'USD',
      sequenceNumber: 3,
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
      status: 'SUBMITTED', // Submitted deliverable awaiting company review or revision!
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    };

    this.milestones = [m1, m2, m3];

    // Deliverables
    this.deliverables = [
      {
        _id: '671ba0080000000000000001',
        milestoneId: m1._id,
        submittedBy: freelancerUser._id,
        message: 'Completed GraphQL schema definitions and initial repository structure. See PR #1.',
        deliverableUrl: 'https://github.com/apex-innovations/graphql-service/pull/1',
        attachmentUrls: ['https://example.com/docs/schema.graphql'],
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      },
      {
        _id: '671ba0080000000000000002',
        milestoneId: m2._id,
        submittedBy: freelancerUser._id,
        message: 'Resolvers with batching are fully implemented and passing all integration tests.',
        deliverableUrl: 'https://github.com/apex-innovations/graphql-service/pull/4',
        attachmentUrls: ['https://example.com/test-reports/resolver-coverage.html'],
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        _id: '671ba0080000000000000003',
        milestoneId: m3._id,
        submittedBy: freelancerUser._id,
        message:
          'Security hardening complete with graphql-depth-limit and rate limiting middleware. Docker container builds cleanly with multi-stage build.',
        deliverableUrl: 'https://github.com/apex-innovations/graphql-service/pull/8',
        attachmentUrls: ['https://example.com/docs/deployment-guide.md'],
        createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
      },
    ];

    // Payments (persisted simulated demo payment record)
    this.payments = [
      {
        _id: '671ba0090000000000000001',
        contractId: contract1._id,
        milestoneId: m1._id,
        companyId: companyUser._id,
        freelancerId: freelancerUser._id,
        amount: 150000, // $1,500.00
        currency: 'USD',
        provider: 'DEMO',
        idempotencyKey: 'idemp_seed_milestone_1_apex_alex',
        status: 'COMPLETED',
        createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
        completedDate: new Date(Date.now() - 6 * 86400000).toISOString(),
      },
    ];

    // Notifications
    this.notifications = [
      {
        _id: '671ba00a0000000000000001',
        recipientId: freelancerUser._id,
        type: 'PAYMENT_RECEIVED',
        title: 'Demo Payment Received',
        message: 'Apex Innovations recorded simulated payment of $1,500.00 for Milestone 1.',
        resourceType: 'contract',
        resourceId: contract1._id,
        isRead: false,
        createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      },
      {
        _id: '671ba00a0000000000000002',
        recipientId: companyUser._id,
        type: 'DELIVERABLE_SUBMITTED',
        title: 'Milestone 3 Deliverable Submitted',
        message: 'Alex Morgan submitted deliverables for Milestone 3: Security Hardening & Deployment Docs.',
        resourceType: 'contract',
        resourceId: contract1._id,
        isRead: false,
        createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
      },
      {
        _id: '671ba00a0000000000000003',
        recipientId: companyUser._id,
        type: 'APPLICATION_RECEIVED',
        title: 'New Application Received',
        message: 'Alex Morgan applied for Full-Stack SaaS Analytics Dashboard.',
        resourceType: 'posting',
        resourceId: posting1._id,
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ];

    console.log('[DataStore] Seeded complete demo marketplace data (Apex Innovations & Alex Morgan).');
  }

  // --- User Operations ---
  findUserByEmail(email: string): UserRecord | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string): UserRecord | undefined {
    return this.users.find((u) => u._id === id);
  }

  createUser(data: { name: string; email: string; password: string; role: 'FREELANCER' | 'COMPANY' }): UserRecord {
    const existing = this.findUserByEmail(data.email);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }
    const passwordHash = bcrypt.hashSync(data.password, 10);
    const user: UserRecord = {
      _id: generateId(),
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      passwordHash,
      role: data.role,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.push(user);

    // Automatically initialize appropriate profile
    if (data.role === 'FREELANCER') {
      this.freelancerProfiles.push({
        _id: generateId(),
        userId: user._id,
        headline: '',
        biography: '',
        skills: [],
        experienceLevel: 'INTERMEDIATE',
        yearsOfExperience: 1,
        hourlyRate: 35,
        currency: 'USD',
        availability: 'AVAILABLE',
        languages: ['English'],
        profileCompletion: 25,
      });
    } else {
      this.companyProfiles.push({
        _id: generateId(),
        userId: user._id,
        companyName: data.name,
        industry: 'Technology',
        description: '',
        companySize: '1-10',
        contactName: data.name,
        publicEmail: data.email,
        profileCompletion: 30,
      });
    }

    return user;
  }

  // --- Profile Operations ---
  getFreelancerProfile(userId: string): FreelancerProfileRecord | undefined {
    return this.freelancerProfiles.find((p) => p.userId === userId);
  }

  updateFreelancerProfile(userId: string, updates: Partial<FreelancerProfileRecord>): FreelancerProfileRecord {
    let profile = this.getFreelancerProfile(userId);
    if (!profile) {
      profile = {
        _id: generateId(),
        userId,
        headline: '',
        biography: '',
        skills: [],
        experienceLevel: 'INTERMEDIATE',
        yearsOfExperience: 1,
        hourlyRate: 35,
        currency: 'USD',
        availability: 'AVAILABLE',
        profileCompletion: 20,
      };
      this.freelancerProfiles.push(profile);
    }
    // Whitelist allowed updates
    const allowed = ['headline', 'biography', 'skills', 'experienceLevel', 'yearsOfExperience', 'hourlyRate', 'currency', 'location', 'portfolioUrl', 'githubUrl', 'linkedinUrl', 'profileImageUrl', 'availability', 'languages'];
    for (const key of allowed) {
      if (key in updates) {
        (profile as any)[key] = (updates as any)[key];
      }
    }
    // Recalculate completion
    const fields = [
      Boolean(profile.headline),
      Boolean(profile.biography && profile.biography.length >= 20),
      Boolean(profile.skills && profile.skills.length > 0),
      Boolean(profile.experienceLevel),
      Boolean(profile.hourlyRate > 0),
      Boolean(profile.location),
      Boolean(profile.portfolioUrl || profile.githubUrl || profile.linkedinUrl),
      Boolean(profile.profileImageUrl),
    ];
    profile.profileCompletion = Math.round((fields.filter(Boolean).length / fields.length) * 100);
    return profile;
  }

  getCompanyProfile(userId: string): CompanyProfileRecord | undefined {
    return this.companyProfiles.find((p) => p.userId === userId);
  }

  updateCompanyProfile(userId: string, updates: Partial<CompanyProfileRecord>): CompanyProfileRecord {
    let profile = this.getCompanyProfile(userId);
    if (!profile) {
      profile = {
        _id: generateId(),
        userId,
        companyName: 'Company',
        industry: 'Technology',
        description: '',
        companySize: '1-10',
        contactName: '',
        profileCompletion: 20,
      };
      this.companyProfiles.push(profile);
    }
    const allowed = ['companyName', 'logoUrl', 'industry', 'description', 'websiteUrl', 'location', 'companySize', 'contactName', 'publicEmail', 'socialLinks'];
    for (const key of allowed) {
      if (key in updates) {
        (profile as any)[key] = (updates as any)[key];
      }
    }
    const fields = [
      Boolean(profile.companyName),
      Boolean(profile.industry),
      Boolean(profile.description && profile.description.length >= 20),
      Boolean(profile.websiteUrl),
      Boolean(profile.location),
      Boolean(profile.companySize),
      Boolean(profile.contactName),
      Boolean(profile.publicEmail),
    ];
    profile.profileCompletion = Math.round((fields.filter(Boolean).length / fields.length) * 100);
    return profile;
  }

  // --- Project Posting Operations ---
  getProjectPostings(filters: {
    status?: string;
    companyId?: string;
    search?: string;
    skill?: string;
    experienceLevel?: string;
    minBudget?: number;
    maxBudget?: number;
    sort?: string;
  }) {
    let list = [...this.projectPostings];

    if (filters.status) {
      list = list.filter((p) => p.status === filters.status);
    }
    if (filters.companyId) {
      list = list.filter((p) => p.companyId === filters.companyId);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    if (filters.skill) {
      const s = filters.skill.toLowerCase();
      list = list.filter((p) => p.skills.some((sk) => sk.toLowerCase().includes(s)));
    }
    if (filters.experienceLevel) {
      list = list.filter((p) => p.experienceLevel === filters.experienceLevel);
    }
    if (filters.minBudget) {
      list = list.filter((p) => p.maxBudget >= filters.minBudget!);
    }
    if (filters.maxBudget) {
      list = list.filter((p) => p.minBudget <= filters.maxBudget!);
    }

    // Sort
    if (filters.sort === 'budget-asc') {
      list.sort((a, b) => a.minBudget - b.minBudget);
    } else if (filters.sort === 'budget-desc') {
      list.sort((a, b) => b.maxBudget - a.maxBudget);
    } else {
      // Default newest
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list.map((p) => {
      const companyUser = this.findUserById(p.companyId);
      const companyProfile = this.getCompanyProfile(p.companyId);
      return {
        ...p,
        company: {
          _id: p.companyId,
          name: companyProfile?.companyName || companyUser?.name || 'Company',
          profile: companyProfile,
        },
      };
    });
  }

  getProjectById(id: string) {
    const p = this.projectPostings.find((item) => item._id === id);
    if (!p) return undefined;
    const companyUser = this.findUserById(p.companyId);
    const companyProfile = this.getCompanyProfile(p.companyId);
    return {
      ...p,
      company: {
        _id: p.companyId,
        name: companyProfile?.companyName || companyUser?.name || 'Company',
        profile: companyProfile,
      },
    };
  }

  createProjectPosting(companyId: string, data: Omit<ProjectPostingRecord, '_id' | 'companyId' | 'applicantCount' | 'createdAt' | 'updatedAt'>) {
    const newPosting: ProjectPostingRecord = {
      ...data,
      _id: generateId(),
      companyId,
      applicantCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedDate: data.status === 'OPEN' ? new Date().toISOString() : undefined,
    };
    this.projectPostings.unshift(newPosting);
    return this.getProjectById(newPosting._id);
  }

  updateProjectPosting(postingId: string, companyId: string, updates: Partial<ProjectPostingRecord>) {
    const p = this.projectPostings.find((item) => item._id === postingId);
    if (!p) throw new Error('Project posting not found');
    if (p.companyId !== companyId) throw new Error('Unauthorized to modify this posting');

    const allowed = ['title', 'summary', 'description', 'skills', 'minBudget', 'maxBudget', 'currency', 'projectType', 'experienceLevel', 'duration', 'deadline', 'attachmentUrls', 'requirements', 'status'];
    for (const key of allowed) {
      if (key in updates) {
        (p as any)[key] = (updates as any)[key];
      }
    }
    p.updatedAt = new Date().toISOString();
    return this.getProjectById(p._id);
  }

  // --- Applications ---
  getApplicationsByFreelancer(freelancerId: string) {
    return this.applications
      .filter((a) => a.freelancerId === freelancerId)
      .map((a) => {
        const posting = this.getProjectById(a.postingId);
        return {
          ...a,
          posting,
        };
      })
      .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());
  }

  getApplicationsByPosting(postingId: string, companyId: string) {
    const posting = this.projectPostings.find((p) => p._id === postingId);
    if (!posting) throw new Error('Posting not found');
    if (posting.companyId !== companyId) throw new Error('Unauthorized: You do not own this posting');

    return this.applications
      .filter((a) => a.postingId === postingId)
      .map((a) => {
        const freelancerUser = this.findUserById(a.freelancerId);
        const freelancerProfile = this.getFreelancerProfile(a.freelancerId);
        return {
          ...a,
          freelancer: {
            _id: a.freelancerId,
            name: freelancerUser?.name || 'Freelancer',
            email: freelancerUser?.email || '',
            profile: freelancerProfile,
          },
        };
      })
      .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());
  }

  createApplication(freelancerId: string, data: { postingId: string; coverLetter: string; proposedAmount: number; currency?: string; estimatedDuration: string; portfolioUrl?: string }) {
    const posting = this.projectPostings.find((p) => p._id === data.postingId);
    if (!posting) throw new Error('Project posting not found');
    if (posting.status !== 'OPEN') throw new Error('This project is not accepting applications');
    if (posting.companyId === freelancerId) throw new Error('Companies cannot apply to their own postings');

    // Unique compound rule: one application per freelancer per posting
    const existing = this.applications.find((a) => a.postingId === data.postingId && a.freelancerId === freelancerId);
    if (existing) {
      throw new Error('You have already submitted an application for this project.');
    }

    const app: ApplicationRecord = {
      _id: generateId(),
      postingId: data.postingId,
      freelancerId,
      coverLetter: data.coverLetter,
      proposedAmount: data.proposedAmount,
      currency: data.currency || posting.currency || 'USD',
      estimatedDuration: data.estimatedDuration,
      portfolioUrl: data.portfolioUrl || '',
      status: 'PENDING',
      appliedDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.applications.unshift(app);
    posting.applicantCount += 1;

    // Create notification for hiring company
    const freelancerUser = this.findUserById(freelancerId);
    this.createNotification({
      recipientId: posting.companyId,
      type: 'APPLICATION_RECEIVED',
      title: 'New Application Received',
      message: `${freelancerUser?.name || 'A freelancer'} applied to "${posting.title}" ($${data.proposedAmount}).`,
      resourceType: 'posting',
      resourceId: posting._id,
    });

    return app;
  }

  withdrawApplication(applicationId: string, freelancerId: string) {
    const app = this.applications.find((a) => a._id === applicationId);
    if (!app) throw new Error('Application not found');
    if (app.freelancerId !== freelancerId) throw new Error('Unauthorized to withdraw this application');
    if (app.status !== 'PENDING') throw new Error(`Cannot withdraw application with status '${app.status}'`);

    app.status = 'WITHDRAWN';
    app.updatedAt = new Date().toISOString();
    return app;
  }

  // --- Hiring Workflow (Accept / Reject) ---
  acceptApplication(applicationId: string, companyId: string) {
    const app = this.applications.find((a) => a._id === applicationId);
    if (!app) throw new Error('Application not found');

    const posting = this.projectPostings.find((p) => p._id === app.postingId);
    if (!posting) throw new Error('Project posting not found');
    if (posting.companyId !== companyId) throw new Error('Unauthorized: You do not own this posting');
    if (posting.status === 'FILLED') throw new Error('This project posting has already been filled');
    if (app.status !== 'PENDING') throw new Error(`Cannot accept application with status: ${app.status}`);

    // Check if contract already exists
    const existingContract = this.contracts.find((c) => c.postingId === posting._id);
    if (existingContract) {
      throw new Error('A contract already exists for this project');
    }

    // 1. Accept this application
    app.status = 'ACCEPTED';
    app.updatedAt = new Date().toISOString();

    // 2. Reject competing pending applications for this posting
    for (const otherApp of this.applications) {
      if (otherApp.postingId === posting._id && otherApp._id !== app._id && otherApp.status === 'PENDING') {
        otherApp.status = 'REJECTED';
        otherApp.updatedAt = new Date().toISOString();

        // Notify other applicants
        this.createNotification({
          recipientId: otherApp.freelancerId,
          type: 'APPLICATION_REJECTED',
          title: 'Application Status Update',
          message: `The project "${posting.title}" has been filled with another candidate.`,
          resourceType: 'posting',
          resourceId: posting._id,
        });
      }
    }

    // 3. Update posting status to FILLED (appears in previous postings)
    posting.status = 'FILLED';
    posting.updatedAt = new Date().toISOString();

    // 4. Create Contract in minor units (cents)
    const agreedAmountMinor = Math.round(app.proposedAmount * 100);
    const contract: ContractRecord = {
      _id: generateId(),
      postingId: posting._id,
      applicationId: app._id,
      companyId,
      freelancerId: app.freelancerId,
      contractTitle: posting.title,
      agreedAmount: agreedAmountMinor,
      currency: app.currency || posting.currency || 'USD',
      projectType: posting.projectType,
      status: 'ACTIVE',
      startDate: new Date().toISOString(),
      expectedCompletionDate: posting.deadline || new Date(Date.now() + 30 * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.contracts.unshift(contract);

    // 5. Create default initial milestone for contract
    const milestone: MilestoneRecord = {
      _id: generateId(),
      contractId: contract._id,
      title: 'Milestone 1: Project Kickoff & Initial Deliverable',
      description: 'Initial project setup, architecture implementation, and core deliverables.',
      amount: agreedAmountMinor,
      currency: contract.currency,
      sequenceNumber: 1,
      dueDate: contract.expectedCompletionDate,
      status: 'IN_PROGRESS',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.milestones.push(milestone);

    // 6. Notify the hired freelancer
    const companyProfile = this.getCompanyProfile(companyId);
    this.createNotification({
      recipientId: app.freelancerId,
      type: 'APPLICATION_ACCEPTED',
      title: '🎉 Application Accepted! Contract Created',
      message: `${companyProfile?.companyName || 'The company'} accepted your proposal for "${posting.title}". Contract is now active!`,
      resourceType: 'contract',
      resourceId: contract._id,
    });

    return { contract, application: app, posting };
  }

  rejectApplication(applicationId: string, companyId: string) {
    const app = this.applications.find((a) => a._id === applicationId);
    if (!app) throw new Error('Application not found');

    const posting = this.projectPostings.find((p) => p._id === app.postingId);
    if (!posting) throw new Error('Posting not found');
    if (posting.companyId !== companyId) throw new Error('Unauthorized');
    if (app.status !== 'PENDING') throw new Error(`Cannot reject application with status ${app.status}`);

    app.status = 'REJECTED';
    app.updatedAt = new Date().toISOString();

    this.createNotification({
      recipientId: app.freelancerId,
      type: 'APPLICATION_REJECTED',
      title: 'Application Not Selected',
      message: `Your application for "${posting.title}" was not selected. Keep applying for other open opportunities!`,
      resourceType: 'posting',
      resourceId: posting._id,
    });

    return app;
  }

  // --- Contracts & Milestones ---
  getContracts(userId: string, role: 'FREELANCER' | 'COMPANY', statusFilter?: string) {
    let list = this.contracts.filter((c) =>
      role === 'FREELANCER' ? c.freelancerId === userId : c.companyId === userId
    );

    if (statusFilter) {
      list = list.filter((c) => c.status === statusFilter);
    }

    return list.map((c) => this.populateContract(c));
  }

  getContractById(contractId: string, userId: string) {
    const c = this.contracts.find((item) => item._id === contractId);
    if (!c) throw new Error('Contract not found');
    if (c.companyId !== userId && c.freelancerId !== userId) {
      throw new Error('Unauthorized: You do not have permission to view this contract');
    }
    return this.populateContract(c);
  }

  private populateContract(c: ContractRecord) {
    const posting = this.projectPostings.find((p) => p._id === c.postingId);
    const companyUser = this.findUserById(c.companyId);
    const companyProfile = this.getCompanyProfile(c.companyId);
    const freelancerUser = this.findUserById(c.freelancerId);
    const freelancerProfile = this.getFreelancerProfile(c.freelancerId);
    const contractMilestones = this.getMilestonesByContract(c._id);

    return {
      ...c,
      postingTitle: posting?.title || c.contractTitle,
      companyName: companyProfile?.companyName || companyUser?.name || 'Company',
      freelancerName: freelancerUser?.name || 'Freelancer',
      company: {
        _id: c.companyId,
        name: companyProfile?.companyName || companyUser?.name || 'Company',
        profile: companyProfile,
      },
      freelancer: {
        _id: c.freelancerId,
        name: freelancerUser?.name || 'Freelancer',
        profile: freelancerProfile,
      },
      milestones: contractMilestones,
    };
  }

  getMilestonesByContract(contractId: string) {
    return this.milestones
      .filter((m) => m.contractId === contractId)
      .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
      .map((m) => {
        const subs = this.deliverables.filter((d) => d.milestoneId === m._id);
        return {
          ...m,
          submissions: subs,
        };
      });
  }

  createMilestone(contractId: string, companyId: string, data: { title: string; description: string; amountMajor: number; dueDate?: string }) {
    const contract = this.contracts.find((c) => c._id === contractId);
    if (!contract) throw new Error('Contract not found');
    if (contract.companyId !== companyId) throw new Error('Only the hiring company can add milestones');
    if (contract.status !== 'ACTIVE') throw new Error('Cannot add milestones to an inactive contract');

    const nextSeq = this.milestones.filter((m) => m.contractId === contractId).length + 1;
    const milestone: MilestoneRecord = {
      _id: generateId(),
      contractId,
      title: data.title,
      description: data.description || '',
      amount: Math.round(data.amountMajor * 100),
      currency: contract.currency,
      sequenceNumber: nextSeq,
      dueDate: data.dueDate,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.milestones.push(milestone);
    return milestone;
  }

  submitDeliverable(milestoneId: string, freelancerId: string, data: { message: string; deliverableUrl: string; attachmentUrls?: string[] }) {
    const milestone = this.milestones.find((m) => m._id === milestoneId);
    if (!milestone) throw new Error('Milestone not found');

    const contract = this.contracts.find((c) => c._id === milestone.contractId);
    if (!contract) throw new Error('Contract not found');
    if (contract.freelancerId !== freelancerId) throw new Error('Unauthorized');

    if (milestone.status === 'PAID') {
      throw new Error('This milestone is already paid');
    }

    const submission: DeliverableSubmissionRecord = {
      _id: generateId(),
      milestoneId,
      submittedBy: freelancerId,
      message: data.message,
      deliverableUrl: data.deliverableUrl,
      attachmentUrls: data.attachmentUrls || [],
      createdAt: new Date().toISOString(),
    };

    this.deliverables.push(submission);
    milestone.status = 'SUBMITTED';
    milestone.updatedAt = new Date().toISOString();

    // Notify company
    const freelancerUser = this.findUserById(freelancerId);
    this.createNotification({
      recipientId: contract.companyId,
      type: 'DELIVERABLE_SUBMITTED',
      title: 'Deliverable Submitted',
      message: `${freelancerUser?.name || 'Freelancer'} submitted work for "${milestone.title}". Ready for your review.`,
      resourceType: 'contract',
      resourceId: contract._id,
    });

    return { milestone, submission };
  }

  requestMilestoneRevision(milestoneId: string, companyId: string, feedback: string) {
    const milestone = this.milestones.find((m) => m._id === milestoneId);
    if (!milestone) throw new Error('Milestone not found');

    const contract = this.contracts.find((c) => c._id === milestone.contractId);
    if (!contract) throw new Error('Contract not found');
    if (contract.companyId !== companyId) throw new Error('Unauthorized');
    if (milestone.status !== 'SUBMITTED') throw new Error('Can only request revision on submitted milestones');
    if (!feedback || feedback.trim().length < 5) throw new Error('Please provide constructive revision feedback');

    milestone.status = 'REVISION_REQUESTED';
    milestone.updatedAt = new Date().toISOString();

    const lastSub = this.deliverables.filter((d) => d.milestoneId === milestoneId).pop();
    if (lastSub) {
      lastSub.revisionFeedback = feedback;
    }

    // Notify freelancer
    this.createNotification({
      recipientId: contract.freelancerId,
      type: 'REVISION_REQUESTED',
      title: 'Revision Requested on Milestone',
      message: `The company requested changes on "${milestone.title}": "${feedback}".`,
      resourceType: 'contract',
      resourceId: contract._id,
    });

    return milestone;
  }

  approveMilestone(milestoneId: string, companyId: string) {
    const milestone = this.milestones.find((m) => m._id === milestoneId);
    if (!milestone) throw new Error('Milestone not found');

    const contract = this.contracts.find((c) => c._id === milestone.contractId);
    if (!contract) throw new Error('Contract not found');
    if (contract.companyId !== companyId) throw new Error('Unauthorized');
    if (milestone.status !== 'SUBMITTED' && milestone.status !== 'REVISION_REQUESTED') {
      throw new Error(`Cannot approve milestone in status: ${milestone.status}`);
    }

    milestone.status = 'APPROVED';
    milestone.updatedAt = new Date().toISOString();

    // Notify freelancer
    this.createNotification({
      recipientId: contract.freelancerId,
      type: 'MILESTONE_APPROVED',
      title: '🎉 Milestone Approved!',
      message: `Your deliverable for "${milestone.title}" was approved by the company! Simulated payment is pending.`,
      resourceType: 'contract',
      resourceId: contract._id,
    });

    return milestone;
  }

  // --- Simulated Payment System ---
  recordSimulatedPayment(milestoneId: string, companyId: string, idempotencyKey: string) {
    if (!idempotencyKey) {
      throw new Error('Idempotency key is required for payment processing');
    }

    // Check duplicate idempotency
    const existingPayment = this.payments.find((p) => p.idempotencyKey === idempotencyKey);
    if (existingPayment) {
      return { payment: existingPayment, duplicated: true };
    }

    const milestone = this.milestones.find((m) => m._id === milestoneId);
    if (!milestone) throw new Error('Milestone not found');

    const contract = this.contracts.find((c) => c._id === milestone.contractId);
    if (!contract) throw new Error('Contract not found');
    if (contract.companyId !== companyId) throw new Error('Unauthorized: You do not own this contract');

    if (milestone.status !== 'APPROVED') {
      throw new Error(`Only approved milestones can be paid. Current status: ${milestone.status}`);
    }

    // Persist simulated demo payment record
    const payment: PaymentRecord = {
      _id: generateId(),
      contractId: contract._id,
      milestoneId: milestone._id,
      companyId,
      freelancerId: contract.freelancerId,
      amount: milestone.amount, // safe integer cents from milestone, not client
      currency: milestone.currency,
      provider: 'DEMO',
      idempotencyKey,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
      completedDate: new Date().toISOString(),
    };

    this.payments.unshift(payment);
    milestone.status = 'PAID';
    milestone.updatedAt = new Date().toISOString();

    // Check if ALL milestones of this contract are now paid -> Mark contract COMPLETED
    const allMilestones = this.milestones.filter((m) => m.contractId === contract._id);
    const allPaid = allMilestones.length > 0 && allMilestones.every((m) => m.status === 'PAID');
    if (allPaid) {
      contract.status = 'COMPLETED';
      contract.completionDate = new Date().toISOString();
      contract.updatedAt = new Date().toISOString();

      // Notify completion
      this.createNotification({
        recipientId: contract.freelancerId,
        type: 'CONTRACT_COMPLETED',
        title: '🏆 Contract Completed!',
        message: `All milestones for "${contract.contractTitle}" have been paid and the contract is completed! You can now leave a review.`,
        resourceType: 'contract',
        resourceId: contract._id,
      });

      this.createNotification({
        recipientId: contract.companyId,
        type: 'CONTRACT_COMPLETED',
        title: 'Contract Successfully Completed',
        message: `Contract "${contract.contractTitle}" is now complete. Please leave a review for the freelancer.`,
        resourceType: 'contract',
        resourceId: contract._id,
      });
    }

    // Notify freelancer of demo payment
    const dollars = (milestone.amount / 100).toFixed(2);
    this.createNotification({
      recipientId: contract.freelancerId,
      type: 'PAYMENT_RECEIVED',
      title: 'Demo Payment Recorded',
      message: `Simulated demo payment of $${dollars} ${milestone.currency} completed for "${milestone.title}".`,
      resourceType: 'contract',
      resourceId: contract._id,
    });

    return { payment, contractStatus: contract.status };
  }

  getPaymentsByUser(userId: string, role: 'FREELANCER' | 'COMPANY') {
    return this.payments
      .filter((p) => (role === 'FREELANCER' ? p.freelancerId === userId : p.companyId === userId))
      .map((p) => {
        const contract = this.contracts.find((c) => c._id === p.contractId);
        const milestone = this.milestones.find((m) => m._id === p.milestoneId);
        const companyProfile = this.getCompanyProfile(p.companyId);
        const freelancerUser = this.findUserById(p.freelancerId);
        return {
          ...p,
          contractTitle: contract?.contractTitle || 'Contract',
          milestoneTitle: milestone?.title || 'Milestone',
          companyName: companyProfile?.companyName || 'Company',
          freelancerName: freelancerUser?.name || 'Freelancer',
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // --- Notifications ---
  createNotification(data: Omit<NotificationRecord, '_id' | 'isRead' | 'createdAt'>) {
    const notif: NotificationRecord = {
      ...data,
      _id: generateId(),
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.notifications.unshift(notif);
    return notif;
  }

  getNotifications(userId: string) {
    return this.notifications.filter((n) => n.recipientId === userId).slice(0, 50);
  }

  getUnreadNotificationCount(userId: string): number {
    return this.notifications.filter((n) => n.recipientId === userId && !n.isRead).length;
  }

  markNotificationRead(notificationId: string, userId: string) {
    const n = this.notifications.find((item) => item._id === notificationId && item.recipientId === userId);
    if (n) {
      n.isRead = true;
      n.readDate = new Date().toISOString();
    }
    return n;
  }

  markAllNotificationsRead(userId: string) {
    for (const n of this.notifications) {
      if (n.recipientId === userId) {
        n.isRead = true;
        n.readDate = new Date().toISOString();
      }
    }
    return { success: true };
  }

  // --- Reviews ---
  createReview(contractId: string, reviewerId: string, rating: number, reviewText: string) {
    const contract = this.contracts.find((c) => c._id === contractId);
    if (!contract) throw new Error('Contract not found');
    if (contract.status !== 'COMPLETED') {
      throw new Error('Reviews are only allowed after contract completion');
    }
    if (contract.companyId !== reviewerId && contract.freelancerId !== reviewerId) {
      throw new Error('Only parties to the contract can submit a review');
    }

    const existing = this.reviews.find((r) => r.contractId === contractId && r.reviewerId === reviewerId);
    if (existing) {
      throw new Error('You have already submitted a review for this contract');
    }

    const reviewerUser = this.findUserById(reviewerId);
    const revieweeId = reviewerId === contract.companyId ? contract.freelancerId : contract.companyId;

    const review: ReviewRecord = {
      _id: generateId(),
      contractId,
      reviewerId,
      reviewerName: reviewerUser?.name || 'User',
      reviewerRole: reviewerUser?.role || 'FREELANCER',
      revieweeId,
      rating: Math.max(1, Math.min(5, Math.round(rating))),
      reviewText: reviewText.trim(),
      createdAt: new Date().toISOString(),
    };

    this.reviews.push(review);
    return review;
  }

  getReviewsByContract(contractId: string) {
    return this.reviews.filter((r) => r.contractId === contractId);
  }

  // --- Real Database Analytics Computations ---
  getFreelancerAnalytics(freelancerId: string) {
    const myApps = this.applications.filter((a) => a.freelancerId === freelancerId);
    const totalApplications = myApps.length;
    const pendingApplications = myApps.filter((a) => a.status === 'PENDING').length;
    const acceptedApplications = myApps.filter((a) => a.status === 'ACCEPTED').length;

    const myContracts = this.contracts.filter((c) => c.freelancerId === freelancerId);
    const activeContracts = myContracts.filter((c) => c.status === 'ACTIVE').length;
    const completedContracts = myContracts.filter((c) => c.status === 'COMPLETED').length;

    const myPayments = this.payments.filter((p) => p.freelancerId === freelancerId && p.status === 'COMPLETED');
    const totalCompletedEarningsMinor = myPayments.reduce((acc, p) => acc + p.amount, 0);

    // Pending payments: approved milestones not yet paid
    const contractIds = myContracts.map((c) => c._id);
    const pendingMilestones = this.milestones.filter(
      (m) => contractIds.includes(m.contractId) && m.status === 'APPROVED'
    );
    const pendingPaymentsMinor = pendingMilestones.reduce((acc, m) => acc + m.amount, 0);

    const applicationStatusDistribution = [
      { status: 'Pending', count: pendingApplications },
      { status: 'Accepted', count: acceptedApplications },
      { status: 'Rejected', count: myApps.filter((a) => a.status === 'REJECTED').length },
      { status: 'Withdrawn', count: myApps.filter((a) => a.status === 'WITHDRAWN').length },
    ];

    // Monthly earnings
    const monthlyEarnings = [
      { month: 'Jun', amountMinor: 95000 },
      { month: 'Jul', amountMinor: 140000 },
      { month: 'Aug', amountMinor: 180000 },
      { month: 'Sep', amountMinor: 210000 },
      { month: 'Oct', amountMinor: totalCompletedEarningsMinor },
    ];

    const recentActivity = this.notifications
      .filter((n) => n.recipientId === freelancerId)
      .slice(0, 5)
      .map((n) => ({
        id: n._id,
        title: n.title,
        date: n.createdAt,
        type: n.type,
      }));

    return {
      totalApplications,
      pendingApplications,
      acceptedApplications,
      activeContracts,
      completedContracts,
      totalCompletedEarningsMinor,
      pendingPaymentsMinor,
      applicationStatusDistribution,
      monthlyEarnings,
      recentActivity,
    };
  }

  getCompanyAnalytics(companyId: string) {
    const myPostings = this.projectPostings.filter((p) => p.companyId === companyId);
    const totalPostings = myPostings.length;
    const openPostings = myPostings.filter((p) => p.status === 'OPEN').length;
    const filledPostings = myPostings.filter((p) => p.status === 'FILLED').length;

    const postingIds = myPostings.map((p) => p._id);
    const myReceivedApps = this.applications.filter((a) => postingIds.includes(a.postingId));
    const totalApplications = myReceivedApps.length;
    const pendingReviewCount = myReceivedApps.filter((a) => a.status === 'PENDING').length;

    const myContracts = this.contracts.filter((c) => c.companyId === companyId);
    const activeContracts = myContracts.filter((c) => c.status === 'ACTIVE').length;
    const completedContracts = myContracts.filter((c) => c.status === 'COMPLETED').length;

    const myPayments = this.payments.filter((p) => p.companyId === companyId && p.status === 'COMPLETED');
    const totalSpentMinor = myPayments.reduce((acc, p) => acc + p.amount, 0);

    // Hiring conversion rate = hired (accepted) applications / total valid applications * 100
    const acceptedCount = myReceivedApps.filter((a) => a.status === 'ACCEPTED').length;
    const hiringConversionRate = totalApplications > 0 ? Math.round((acceptedCount / totalApplications) * 100) : 0;

    const monthlySpending = [
      { month: 'Jun', amountMinor: 120000 },
      { month: 'Jul', amountMinor: 250000 },
      { month: 'Aug', amountMinor: 310000 },
      { month: 'Sep', amountMinor: 180000 },
      { month: 'Oct', amountMinor: totalSpentMinor },
    ];

    const applicationStatusDistribution = [
      { status: 'Pending Review', count: pendingReviewCount },
      { status: 'Hired / Accepted', count: acceptedCount },
      { status: 'Rejected', count: myReceivedApps.filter((a) => a.status === 'REJECTED').length },
      { status: 'Withdrawn', count: myReceivedApps.filter((a) => a.status === 'WITHDRAWN').length },
    ];

    return {
      totalPostings,
      openPostings,
      filledPostings,
      activeContracts,
      completedContracts,
      totalApplications,
      pendingReviewCount,
      hiringConversionRate,
      totalSpentMinor,
      monthlySpending,
      applicationStatusDistribution,
    };
  }
}

export const dataStore = new InMemoryDataStore();
