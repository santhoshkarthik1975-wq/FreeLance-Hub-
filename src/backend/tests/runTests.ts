import bcrypt from 'bcryptjs';
import { dataStore } from '../services/store.ts';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

async function test(name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    results.push({ name, passed: true });
    console.log(`  ✅ PASS: ${name}`);
  } catch (err: any) {
    results.push({ name, passed: false, error: err.message });
    console.error(`  ❌ FAIL: ${name} -> ${err.message}`);
  }
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('🧪 Running Freelance Hub Automated Core Tests Suite');
  console.log('====================================================\n');

  // Test 1: Freelancer Registration
  await test('Freelancer registration creates active user and profile', () => {
    const email = `test.free.${Date.now()}@example.com`;
    const user = dataStore.createUser({
      name: 'Test Freelancer',
      email,
      password: 'SecretPassword123!',
      role: 'FREELANCER',
    });
    assert(user._id !== undefined, 'User must have an ID');
    assert(user.role === 'FREELANCER', 'Role must be FREELANCER');
    assert(user.status === 'ACTIVE', 'User must be ACTIVE');
    const profile = dataStore.getFreelancerProfile(user._id);
    assert(profile !== undefined, 'Freelancer profile must be created automatically');
  });

  // Test 2: Company Registration
  await test('Company registration creates company user and company profile', () => {
    const email = `test.comp.${Date.now()}@example.com`;
    const user = dataStore.createUser({
      name: 'Acme Test Corp',
      email,
      password: 'SecretPassword123!',
      role: 'COMPANY',
    });
    assert(user.role === 'COMPANY', 'Role must be COMPANY');
    const profile = dataStore.getCompanyProfile(user._id);
    assert(profile !== undefined, 'Company profile must be created automatically');
    assert(profile?.companyName === 'Acme Test Corp', 'Company name must match');
  });

  // Test 3: Duplicate Email Rejection
  await test('Duplicate email registration is strictly rejected', () => {
    let threw = false;
    try {
      dataStore.createUser({
        name: 'Duplicate Test',
        email: 'freelancer.demo@example.com',
        password: 'Password123!',
        role: 'FREELANCER',
      });
    } catch (e: any) {
      threw = true;
      assert(e.message.includes('already exists'), 'Error message must mention email existence');
    }
    assert(threw, 'Should have thrown duplicate email error');
  });

  // Test 4: Password Hashing Verification
  await test('Passwords are encrypted using bcrypt salt and hash', () => {
    const user = dataStore.findUserByEmail('freelancer.demo@example.com');
    assert(Boolean(user), 'Demo freelancer should exist');
    assert(user!.passwordHash.startsWith('$2'), 'Password hash must be a bcrypt hash');
    assert(bcrypt.compareSync('Demo1234!', user!.passwordHash), 'Bcrypt compare must succeed for valid password');
    assert(!bcrypt.compareSync('WrongPassword', user!.passwordHash), 'Bcrypt compare must fail for wrong password');
  });

  // Test 5: Project Posting Creation & Ownership
  let testPostingId = '';
  await test('Company can create a project posting with valid budget', () => {
    const company = dataStore.findUserByEmail('company.demo@example.com')!;
    const posting = dataStore.createProjectPosting(company._id, {
      title: 'Automated Test Mobile App',
      summary: 'Automated test suite posting summary description',
      description: 'Comprehensive project description for automated test suite checking.',
      skills: ['React Native', 'TypeScript'],
      minBudget: 3000,
      maxBudget: 4500,
      currency: 'USD',
      projectType: 'FIXED',
      experienceLevel: 'INTERMEDIATE',
      duration: '3 weeks',
      status: 'OPEN',
    });
    assert(Boolean(posting?._id), 'Posting ID must be generated');
    assert(posting?.companyId === company._id, 'Company ownership must be set correctly');
    testPostingId = posting!._id;
  });

  // Test 6: Freelancer Application Submission
  let testAppId = '';
  await test('Freelancer can submit an application to an open project', () => {
    const freelancer = dataStore.findUserByEmail('freelancer.demo@example.com')!;
    const app = dataStore.createApplication(freelancer._id, {
      postingId: testPostingId,
      coverLetter: 'I am highly experienced with React Native and TypeScript.',
      proposedAmount: 3800,
      currency: 'USD',
      estimatedDuration: '3 weeks',
    });
    assert(Boolean(app._id), 'Application must have an ID');
    assert(app.status === 'PENDING', 'Initial status must be PENDING');
    testAppId = app._id;
  });

  // Test 7: Duplicate Application Prevention
  await test('Duplicate applications by the same freelancer for the same posting are prevented', () => {
    const freelancer = dataStore.findUserByEmail('freelancer.demo@example.com')!;
    let threw = false;
    try {
      dataStore.createApplication(freelancer._id, {
        postingId: testPostingId,
        coverLetter: 'Trying to apply a second time',
        proposedAmount: 3500,
        currency: 'USD',
        estimatedDuration: '2 weeks',
      });
    } catch (e: any) {
      threw = true;
      assert(e.message.includes('already submitted'), 'Error must inform user of existing application');
    }
    assert(threw, 'Must throw error on duplicate application');
  });

  // Test 8: Hiring & Contract Creation Workflow
  let testContractId = '';
  await test('Company accepting application creates contract and marks posting filled', () => {
    const company = dataStore.findUserByEmail('company.demo@example.com')!;
    const result = dataStore.acceptApplication(testAppId, company._id);
    assert(result.contract !== undefined, 'Contract must be created');
    assert(result.contract.status === 'ACTIVE', 'Contract status must be ACTIVE');
    assert(result.contract.agreedAmount === 380000, 'Agreed amount must be in minor units ($3,800.00 = 380000 cents)');
    assert(result.posting.status === 'FILLED', 'Posting must transition to FILLED');
    assert(result.application.status === 'ACCEPTED', 'Application must transition to ACCEPTED');
    testContractId = result.contract._id;
  });

  // Test 9: Milestone Management
  let testMilestoneId = '';
  await test('Company can create milestone on active contract', () => {
    const company = dataStore.findUserByEmail('company.demo@example.com')!;
    const milestone = dataStore.createMilestone(testContractId, company._id, {
      title: 'Phase 2: Core Components',
      description: 'Build user interface components',
      amountMajor: 1800,
    });
    assert(milestone.amount === 180000, 'Amount must be stored in cents');
    assert(milestone.status === 'PENDING', 'Status must be PENDING');
    testMilestoneId = milestone._id;
  });

  // Test 10: Deliverable Submission
  await test('Freelancer can submit deliverable with URL', () => {
    const freelancer = dataStore.findUserByEmail('freelancer.demo@example.com')!;
    const result = dataStore.submitDeliverable(testMilestoneId, freelancer._id, {
      message: 'Completed Phase 2 deliverables ready for review.',
      deliverableUrl: 'https://github.com/apex-innovations/test-repo/pull/12',
    });
    assert(result.milestone.status === 'SUBMITTED', 'Milestone status must update to SUBMITTED');
    assert(result.submission.deliverableUrl.startsWith('https://'), 'Deliverable URL must be saved');
  });

  // Test 11: Milestone Revision Request
  await test('Company can request revision with actionable feedback', () => {
    const company = dataStore.findUserByEmail('company.demo@example.com')!;
    const updated = dataStore.requestMilestoneRevision(
      testMilestoneId,
      company._id,
      'Please add dark mode support and adjust responsive breakpoints.'
    );
    assert(updated.status === 'REVISION_REQUESTED', 'Status must be REVISION_REQUESTED');
  });

  // Test 12: Milestone Approval
  await test('Company can approve revised deliverable', () => {
    const company = dataStore.findUserByEmail('company.demo@example.com')!;
    const updated = dataStore.approveMilestone(testMilestoneId, company._id);
    assert(updated.status === 'APPROVED', 'Status must be APPROVED');
  });

  // Test 13: Simulated Demo Payment & Idempotency
  await test('Simulated demo payment records successfully with minor units and idempotency', () => {
    const company = dataStore.findUserByEmail('company.demo@example.com')!;
    const idempotencyKey = `idemp_test_${Date.now()}`;
    const firstAttempt = dataStore.recordSimulatedPayment(testMilestoneId, company._id, idempotencyKey);
    assert(firstAttempt.payment.status === 'COMPLETED', 'Payment status must be COMPLETED');
    assert(firstAttempt.payment.amount === 180000, 'Payment amount must be $1,800.00 in minor units');

    // Duplicate test
    const secondAttempt = dataStore.recordSimulatedPayment(testMilestoneId, company._id, idempotencyKey);
    assert(secondAttempt.duplicated === true, 'Duplicate payment attempt must be flagged as idempotent');
    assert(secondAttempt.payment._id === firstAttempt.payment._id, 'Duplicate payment must return existing record');
  });

  // Test 14: Notification Ownership
  await test('Users can only access their own notifications', () => {
    const freelancer = dataStore.findUserByEmail('freelancer.demo@example.com')!;
    const notifs = dataStore.getNotifications(freelancer._id);
    assert(Array.isArray(notifs), 'Notifications must be an array');
    assert(notifs.every((n) => n.recipientId === freelancer._id), 'All returned notifications must belong to this user');
  });

  console.log('\n====================================================');
  const passedCount = results.filter((r) => r.passed).length;
  console.log(`🏁 Test Summary: ${passedCount} / ${results.length} PASSED`);
  console.log('====================================================\n');

  if (passedCount !== results.length) {
    process.exit(1);
  }
}

runTestSuite();
