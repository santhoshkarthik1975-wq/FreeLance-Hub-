import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User.ts';
import { FreelancerProfileModel } from '../models/FreelancerProfile.ts';
import { CompanyProfileModel } from '../models/CompanyProfile.ts';
import { ProjectPostingModel } from '../models/ProjectPosting.ts';
import { ApplicationModel } from '../models/Application.ts';
import { ContractModel } from '../models/Contract.ts';
import { MilestoneModel } from '../models/Milestone.ts';
import { DeliverableSubmissionModel } from '../models/DeliverableSubmission.ts';
import { PaymentModel } from '../models/Payment.ts';
import { NotificationModel } from '../models/Notification.ts';
import { ReviewModel } from '../models/Review.ts';

dotenv.config();

async function runSeed() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/freelance_hub';

  // Safety guard against accidentally wiping production
  if (process.env.NODE_ENV === 'production' || uri.includes('prod')) {
    console.error('❌ SEED ABORTED: Will not run seed against a production database.');
    process.exit(1);
  }

  console.log(`[Seed] Connecting to MongoDB: ${uri}`);
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
    console.log('[Seed] Connected to database. Preparing seed data...');

    // Clean existing test/demo collections safely
    await UserModel.deleteMany({ email: { $regex: /@example\.com|@starlight\.demo/ } });

    const passwordHash = bcrypt.hashSync('Demo1234!', 10);

    // 1. Create Company User
    const companyUser = await UserModel.create({
      name: 'Apex Innovations Inc.',
      email: 'company.demo@example.com',
      passwordHash,
      role: 'COMPANY',
      status: 'ACTIVE',
    });

    const companyProfile = await CompanyProfileModel.create({
      userId: companyUser._id,
      companyName: 'Apex Innovations Inc.',
      logoUrl: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=150&auto=format&fit=crop&q=80',
      industry: 'FinTech & Cloud Systems',
      description: 'Apex Innovations builds next-generation financial technology and scalable cloud infrastructure for modern enterprise teams.',
      websiteUrl: 'https://apex-innovations.demo.io',
      location: 'San Francisco, CA',
      companySize: '51-200 employees',
      contactName: 'David Vance',
      publicEmail: 'talent@apex-innovations.demo.io',
      profileCompletion: 100,
    });

    // 2. Create Freelancer User
    const freelancerUser = await UserModel.create({
      name: 'Alex Morgan',
      email: 'freelancer.demo@example.com',
      passwordHash,
      role: 'FREELANCER',
      status: 'ACTIVE',
    });

    const freelancerProfile = await FreelancerProfileModel.create({
      userId: freelancerUser._id,
      headline: 'Senior Full Stack TypeScript & Cloud Architect',
      biography: 'Specializing in React, Node.js, TypeScript, PostgreSQL, and scalable distributed architectures.',
      skills: ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Tailwind CSS', 'Docker'],
      experienceLevel: 'EXPERT',
      yearsOfExperience: 6,
      hourlyRate: 65,
      currency: 'USD',
      location: 'Seattle, WA (Remote)',
      portfolioUrl: 'https://alexmorgan-portfolio.demo.dev',
      availability: 'AVAILABLE',
      languages: ['English', 'Spanish'],
      profileCompletion: 100,
    });

    // 3. Create Project Postings
    const openPosting = await ProjectPostingModel.create({
      companyId: companyUser._id,
      title: 'Full-Stack SaaS Analytics Dashboard in React & Node.js',
      summary: 'Design and build an interactive analytics dashboard featuring real-time telemetry charts.',
      description: 'Apex Innovations is looking for an experienced full-stack engineer to implement an enterprise analytics dashboard.',
      skills: ['React', 'TypeScript', 'Node.js', 'Recharts', 'Express'],
      minBudget: 3500,
      maxBudget: 5500,
      currency: 'USD',
      projectType: 'FIXED',
      experienceLevel: 'EXPERT',
      duration: '4 weeks',
      status: 'OPEN',
      applicantCount: 1,
    });

    const filledPosting = await ProjectPostingModel.create({
      companyId: companyUser._id,
      title: 'High-Throughput GraphQL API Microservice',
      summary: 'Production-ready GraphQL microservice with dataloaders and caching.',
      description: 'Develop a containerized GraphQL service to aggregate data across internal databases.',
      skills: ['Node.js', 'GraphQL', 'TypeScript', 'Docker'],
      minBudget: 5000,
      maxBudget: 5000,
      currency: 'USD',
      projectType: 'FIXED',
      experienceLevel: 'EXPERT',
      duration: '6 weeks',
      status: 'FILLED',
      applicantCount: 1,
    });

    // 4. Create Applications
    const appOpen = await ApplicationModel.create({
      postingId: openPosting._id,
      freelancerId: freelancerUser._id,
      coverLetter: 'I have 4 years building high-performance dashboards with React and Recharts.',
      proposedAmount: 4800,
      currency: 'USD',
      estimatedDuration: '4 weeks',
      status: 'PENDING',
    });

    const appFilled = await ApplicationModel.create({
      postingId: filledPosting._id,
      freelancerId: freelancerUser._id,
      coverLetter: 'I have delivered several enterprise GraphQL APIs with Node.js.',
      proposedAmount: 5000,
      currency: 'USD',
      estimatedDuration: '6 weeks',
      status: 'ACCEPTED',
    });

    // 5. Create Contract & Milestones
    const contract = await ContractModel.create({
      postingId: filledPosting._id,
      applicationId: appFilled._id,
      companyId: companyUser._id,
      freelancerId: freelancerUser._id,
      contractTitle: filledPosting.title,
      agreedAmount: 500000, // $5,000 in minor units
      currency: 'USD',
      projectType: 'FIXED',
      status: 'ACTIVE',
    });

    const m1 = await MilestoneModel.create({
      contractId: contract._id,
      title: 'Milestone 1: Architecture & Schema Design',
      description: 'Define type definitions and schema contracts.',
      amount: 150000,
      currency: 'USD',
      sequenceNumber: 1,
      status: 'PAID',
    });

    const m2 = await MilestoneModel.create({
      contractId: contract._id,
      title: 'Milestone 2: Query Resolvers & Dataloader Caching',
      description: 'Implement core data resolvers and batching.',
      amount: 200000,
      currency: 'USD',
      sequenceNumber: 2,
      status: 'APPROVED',
    });

    const m3 = await MilestoneModel.create({
      contractId: contract._id,
      title: 'Milestone 3: Security Hardening & Rate Limiting',
      description: 'Add query complexity limits and Docker containerization.',
      amount: 150000,
      currency: 'USD',
      sequenceNumber: 3,
      status: 'SUBMITTED',
    });

    await DeliverableSubmissionModel.create({
      milestoneId: m3._id,
      submittedBy: freelancerUser._id,
      message: 'Security hardening and rate limiting middleware completed with tests.',
      deliverableUrl: 'https://github.com/apex-innovations/graphql-service/pull/8',
    });

    // 6. Payment record (simulated)
    await PaymentModel.create({
      contractId: contract._id,
      milestoneId: m1._id,
      companyId: companyUser._id,
      freelancerId: freelancerUser._id,
      amount: 150000,
      currency: 'USD',
      provider: 'DEMO',
      idempotencyKey: 'idemp_seed_milestone_1',
      status: 'COMPLETED',
    });

    // 7. Notification
    await NotificationModel.create({
      recipientId: freelancerUser._id,
      type: 'PAYMENT_RECEIVED',
      title: 'Demo Payment Received',
      message: 'Apex Innovations recorded simulated payment of $1,500.00 for Milestone 1.',
      resourceType: 'contract',
      resourceId: contract._id.toString(),
      isRead: false,
    });

    console.log('✅ Seed completed successfully!');
    console.log('Demo Accounts:');
    console.log('  Freelancer: freelancer.demo@example.com / Demo1234!');
    console.log('  Company:    company.demo@example.com    / Demo1234!');

    await mongoose.disconnect();
  } catch (err: any) {
    console.error('⚠️ Note: Local MongoDB seed could not connect to 127.0.0.1:27017.');
    console.error('Reason:', err.message);
    console.log('💡 In AI Studio cloud preview, the application automatically uses the pre-seeded embedded store.');
    console.log('💡 When you export to Windows, ensure MongoDB service is running and run: npm run seed');
  }
}

runSeed();
