import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDbStatus } from '../config/db.ts';
import { dataStore } from '../services/store.ts';
import { authenticate, requireRole, generateToken } from '../middleware/authMiddleware.ts';
import {
  RegisterFreelancerSchema,
  RegisterCompanySchema,
  LoginSchema,
  ProjectPostingSchema,
  ApplicationSubmissionSchema,
  MilestoneCreateSchema,
  DeliverableSubmissionSchema,
  RevisionRequestSchema,
  SimulatedPaymentSchema,
  ReviewSubmissionSchema,
} from '../validators/index.ts';

const router = Router();

// --- Health Check ---
router.get('/health', (_req, res) => {
  const db = getDbStatus();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      connected: db.connected,
      type: db.type,
      uri: db.uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@'),
      databaseName: db.databaseName,
      message: db.message,
    },
    service: 'Freelance Hub API v1',
  });
});

// --- Auth Routes ---
router.post('/auth/register/freelancer', (req, res, next) => {
  try {
    const validated = RegisterFreelancerSchema.parse(req.body);
    const user = dataStore.createUser({
      name: validated.name,
      email: validated.email,
      password: validated.password,
      role: 'FREELANCER',
    });

    if (validated.headline || (validated.skills && validated.skills.length > 0)) {
      dataStore.updateFreelancerProfile(user._id, {
        headline: validated.headline || '',
        skills: validated.skills || [],
      });
    }

    const token = generateToken({
      userId: user._id,
      role: user.role,
      email: user.email,
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const profile = dataStore.getFreelancerProfile(user._id);

    res.status(201).json({
      success: true,
      message: 'Freelancer account created successfully',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          profile,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/auth/register/company', (req, res, next) => {
  try {
    const validated = RegisterCompanySchema.parse(req.body);
    const user = dataStore.createUser({
      name: validated.companyName,
      email: validated.email,
      password: validated.password,
      role: 'COMPANY',
    });

    dataStore.updateCompanyProfile(user._id, {
      companyName: validated.companyName,
      contactName: validated.contactName,
      publicEmail: validated.email,
      industry: validated.industry || 'Technology',
    });

    const token = generateToken({
      userId: user._id,
      role: user.role,
      email: user.email,
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const profile = dataStore.getCompanyProfile(user._id);

    res.status(201).json({
      success: true,
      message: 'Company account registered successfully',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          profile,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/auth/login', (req, res, next) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);
    const user = dataStore.findUserByEmail(email);

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS',
      });
      return;
    }

    const isValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS',
      });
      return;
    }

    const token = generateToken({
      userId: user._id,
      role: user.role,
      email: user.email,
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const profile =
      user.role === 'FREELANCER'
        ? dataStore.getFreelancerProfile(user._id)
        : dataStore.getCompanyProfile(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          profile,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/auth/logout', (_req, res) => {
  res.clearCookie('token');
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

router.get('/auth/me', authenticate, (req, res) => {
  const user = dataStore.findUserById(req.user!.userId);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  const profile =
    user.role === 'FREELANCER'
      ? dataStore.getFreelancerProfile(user._id)
      : dataStore.getCompanyProfile(user._id);

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      profile,
    },
  });
});

// --- Profiles ---
router.get('/profiles/freelancer/:id', (req, res) => {
  const user = dataStore.findUserById(req.params.id);
  const profile = dataStore.getFreelancerProfile(req.params.id);
  if (!profile) {
    res.status(404).json({ success: false, message: 'Freelancer profile not found' });
    return;
  }
  res.json({
    success: true,
    data: {
      ...profile,
      user: {
        name: user?.name || 'Freelancer',
        createdAt: user?.createdAt,
      },
    },
  });
});

router.put('/profiles/freelancer/me', authenticate, requireRole('FREELANCER'), (req, res, next) => {
  try {
    const updated = dataStore.updateFreelancerProfile(req.user!.userId, req.body);
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/profiles/company/:id', (req, res) => {
  const user = dataStore.findUserById(req.params.id);
  const profile = dataStore.getCompanyProfile(req.params.id);
  if (!profile) {
    res.status(404).json({ success: false, message: 'Company profile not found' });
    return;
  }
  res.json({
    success: true,
    data: {
      ...profile,
      user: {
        name: user?.name || 'Company',
        createdAt: user?.createdAt,
      },
    },
  });
});

router.put('/profiles/company/me', authenticate, requireRole('COMPANY'), (req, res, next) => {
  try {
    const updated = dataStore.updateCompanyProfile(req.user!.userId, req.body);
    res.json({
      success: true,
      message: 'Company profile updated successfully',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

// --- Projects & Postings ---
router.get('/projects', (req, res) => {
  const { status, companyId, search, skill, experienceLevel, minBudget, maxBudget, sort } = req.query;
  const list = dataStore.getProjectPostings({
    status: (status as string) || undefined,
    companyId: (companyId as string) || undefined,
    search: (search as string) || undefined,
    skill: (skill as string) || undefined,
    experienceLevel: (experienceLevel as string) || undefined,
    minBudget: minBudget ? Number(minBudget) : undefined,
    maxBudget: maxBudget ? Number(maxBudget) : undefined,
    sort: (sort as string) || undefined,
  });

  res.json({
    success: true,
    data: list,
    total: list.length,
  });
});

router.get('/projects/:id', (req, res) => {
  const project = dataStore.getProjectById(req.params.id);
  if (!project) {
    res.status(404).json({ success: false, message: 'Project posting not found' });
    return;
  }
  res.json({ success: true, data: project });
});

router.post('/projects', authenticate, requireRole('COMPANY'), (req, res, next) => {
  try {
    const validated = ProjectPostingSchema.parse(req.body);
    const created = dataStore.createProjectPosting(req.user!.userId, validated as any);
    res.status(201).json({
      success: true,
      message: 'Project published successfully',
      data: created,
    });
  } catch (err) {
    next(err);
  }
});

router.put('/projects/:id', authenticate, requireRole('COMPANY'), (req, res, next) => {
  try {
    const updated = dataStore.updateProjectPosting(req.params.id, req.user!.userId, req.body);
    res.json({
      success: true,
      message: 'Project updated successfully',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/projects/:id/status', authenticate, requireRole('COMPANY'), (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['DRAFT', 'OPEN', 'FILLED', 'CLOSED', 'CANCELLED', 'ARCHIVED'];
    if (!allowed.includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status value' });
      return;
    }
    const updated = dataStore.updateProjectPosting(req.params.id, req.user!.userId, { status });
    res.json({
      success: true,
      message: `Project status changed to ${status}`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/company/projects', authenticate, requireRole('COMPANY'), (_req, res) => {
  const all = dataStore.getProjectPostings({ companyId: _req.user!.userId });
  // Active postings: OPEN or DRAFT
  const activePostings = all.filter((p) => p.status === 'OPEN' || p.status === 'DRAFT');
  // Previous postings: FILLED, CLOSED, CANCELLED, ARCHIVED
  const previousPostings = all.filter(
    (p) => p.status === 'FILLED' || p.status === 'CLOSED' || p.status === 'CANCELLED' || p.status === 'ARCHIVED'
  );

  res.json({
    success: true,
    data: {
      all,
      activePostings,
      previousPostings,
    },
  });
});

// --- Applications ---
router.post('/projects/:id/applications', authenticate, requireRole('FREELANCER'), (req, res, next) => {
  try {
    const validated = ApplicationSubmissionSchema.parse(req.body);
    const application = dataStore.createApplication(req.user!.userId, {
      postingId: req.params.id,
      ...validated,
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      data: application,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/freelancer/applications', authenticate, requireRole('FREELANCER'), (req, res) => {
  const apps = dataStore.getApplicationsByFreelancer(req.user!.userId);
  res.json({ success: true, data: apps });
});

router.get('/company/projects/:id/applications', authenticate, requireRole('COMPANY'), (req, res, next) => {
  try {
    const apps = dataStore.getApplicationsByPosting(req.params.id, req.user!.userId);
    res.json({ success: true, data: apps });
  } catch (err) {
    next(err);
  }
});

router.patch('/applications/:id/withdraw', authenticate, requireRole('FREELANCER'), (req, res, next) => {
  try {
    const app = dataStore.withdrawApplication(req.params.id, req.user!.userId);
    res.json({
      success: true,
      message: 'Application withdrawn successfully',
      data: app,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/applications/:id/accept', authenticate, requireRole('COMPANY'), (req, res, next) => {
  try {
    const result = dataStore.acceptApplication(req.params.id, req.user!.userId);
    res.json({
      success: true,
      message: 'Candidate hired! Contract has been created and posting is now filled.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/applications/:id/reject', authenticate, requireRole('COMPANY'), (req, res, next) => {
  try {
    const rejected = dataStore.rejectApplication(req.params.id, req.user!.userId);
    res.json({
      success: true,
      message: 'Application rejected',
      data: rejected,
    });
  } catch (err) {
    next(err);
  }
});

// --- Contracts ---
router.get('/contracts', authenticate, (req, res) => {
  const contracts = dataStore.getContracts(req.user!.userId, req.user!.role);
  res.json({ success: true, data: contracts });
});

router.get('/contracts/:id', authenticate, (req, res, next) => {
  try {
    const contract = dataStore.getContractById(req.params.id, req.user!.userId);
    res.json({ success: true, data: contract });
  } catch (err) {
    next(err);
  }
});

router.get('/freelancer/contracts', authenticate, requireRole('FREELANCER'), (req, res) => {
  const active = dataStore.getContracts(req.user!.userId, 'FREELANCER', 'ACTIVE');
  const completed = dataStore.getContracts(req.user!.userId, 'FREELANCER', 'COMPLETED');
  res.json({
    success: true,
    data: {
      active,
      completed,
    },
  });
});

router.get('/company/contracts', authenticate, requireRole('COMPANY'), (req, res) => {
  const active = dataStore.getContracts(req.user!.userId, 'COMPANY', 'ACTIVE');
  const completed = dataStore.getContracts(req.user!.userId, 'COMPANY', 'COMPLETED');
  res.json({
    success: true,
    data: {
      active,
      completed,
    },
  });
});

// --- Milestones & Deliverables ---
router.get('/contracts/:id/milestones', authenticate, (req, res) => {
  const milestones = dataStore.getMilestonesByContract(req.params.id);
  res.json({ success: true, data: milestones });
});

router.post('/contracts/:id/milestones', authenticate, requireRole('COMPANY'), (req, res, next) => {
  try {
    const validated = MilestoneCreateSchema.parse(req.body);
    const milestone = dataStore.createMilestone(req.params.id, req.user!.userId, {
      title: validated.title,
      description: validated.description || '',
      amountMajor: validated.amountMajor,
      dueDate: validated.dueDate,
    });
    res.status(201).json({
      success: true,
      message: 'Milestone created successfully',
      data: milestone,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/milestones/:id/submit', authenticate, requireRole('FREELANCER'), (req, res, next) => {
  try {
    const validated = DeliverableSubmissionSchema.parse(req.body);
    const result = dataStore.submitDeliverable(req.params.id, req.user!.userId, validated);
    res.json({
      success: true,
      message: 'Deliverable submitted for client review!',
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/milestones/:id/request-revision', authenticate, requireRole('COMPANY'), (req, res, next) => {
  try {
    const validated = RevisionRequestSchema.parse(req.body);
    const updated = dataStore.requestMilestoneRevision(req.params.id, req.user!.userId, validated.feedback);
    res.json({
      success: true,
      message: 'Revision requested with feedback provided to freelancer',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/milestones/:id/approve', authenticate, requireRole('COMPANY'), (req, res, next) => {
  try {
    const updated = dataStore.approveMilestone(req.params.id, req.user!.userId);
    res.json({
      success: true,
      message: 'Milestone approved! You can now initiate simulated payment.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

// --- Payments (Simulated Demo Payments) ---
router.post('/milestones/:id/pay', authenticate, requireRole('COMPANY'), (req, res, next) => {
  try {
    const { idempotencyKey } = SimulatedPaymentSchema.parse(req.body);
    const result = dataStore.recordSimulatedPayment(req.params.id, req.user!.userId, idempotencyKey);
    res.json({
      success: true,
      message: 'Simulated demo payment recorded. No real money was transferred.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/payments', authenticate, (req, res) => {
  const payments = dataStore.getPaymentsByUser(req.user!.userId, req.user!.role);
  res.json({ success: true, data: payments });
});

// --- Notifications ---
router.get('/notifications', authenticate, (req, res) => {
  const notifs = dataStore.getNotifications(req.user!.userId);
  res.json({ success: true, data: notifs });
});

router.get('/notifications/unread-count', authenticate, (req, res) => {
  const count = dataStore.getUnreadNotificationCount(req.user!.userId);
  res.json({ success: true, count });
});

router.patch('/notifications/:id/read', authenticate, (req, res) => {
  const notif = dataStore.markNotificationRead(req.params.id, req.user!.userId);
  res.json({ success: true, data: notif });
});

router.post('/notifications/read-all', authenticate, (req, res) => {
  dataStore.markAllNotificationsRead(req.user!.userId);
  res.json({ success: true, message: 'All notifications marked as read' });
});

// --- Analytics ---
router.get('/analytics/freelancer', authenticate, requireRole('FREELANCER'), (req, res) => {
  const analytics = dataStore.getFreelancerAnalytics(req.user!.userId);
  res.json({ success: true, data: analytics });
});

router.get('/analytics/company', authenticate, requireRole('COMPANY'), (req, res) => {
  const analytics = dataStore.getCompanyAnalytics(req.user!.userId);
  res.json({ success: true, data: analytics });
});

// --- Reviews ---
router.post('/contracts/:id/reviews', authenticate, (req, res, next) => {
  try {
    const validated = ReviewSubmissionSchema.parse(req.body);
    const review = dataStore.createReview(
      req.params.id,
      req.user!.userId,
      validated.rating,
      validated.reviewText
    );
    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/contracts/:id/reviews', (req, res) => {
  const reviews = dataStore.getReviewsByContract(req.params.id);
  res.json({ success: true, data: reviews });
});

export default router;
