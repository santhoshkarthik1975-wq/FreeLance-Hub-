import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ToastProvider } from './context/ToastContext.tsx';
import { NotificationProvider } from './context/NotificationContext.tsx';
import { DashboardLayout } from './components/layout/DashboardLayout.tsx';

// Public Pages
import { LandingPage } from './pages/public/LandingPage.tsx';
import { LoginFreelancerPage } from './pages/auth/LoginFreelancerPage.tsx';
import { LoginCompanyPage } from './pages/auth/LoginCompanyPage.tsx';
import { RegisterFreelancerPage } from './pages/auth/RegisterFreelancerPage.tsx';
import { RegisterCompanyPage } from './pages/auth/RegisterCompanyPage.tsx';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage.tsx';
import { UnauthorizedPage } from './pages/public/UnauthorizedPage.tsx';
import { NotFoundPage } from './pages/public/NotFoundPage.tsx';

// Freelancer Pages
import { FreelancerOverview } from './pages/freelancer/FreelancerOverview.tsx';
import { FreelancerAnalyticsPage } from './pages/freelancer/FreelancerAnalytics.tsx';
import { FreelancerFindProjects } from './pages/freelancer/FreelancerFindProjects.tsx';
import { FreelancerApplications } from './pages/freelancer/FreelancerApplications.tsx';
import { FreelancerActiveJobs } from './pages/freelancer/FreelancerActiveJobs.tsx';
import { FreelancerCompletedJobs } from './pages/freelancer/FreelancerCompletedJobs.tsx';
import { FreelancerProfilePage } from './pages/freelancer/FreelancerProfile.tsx';
import { FreelancerPaymentsPage } from './pages/freelancer/FreelancerPayments.tsx';
import { FreelancerNotificationsPage } from './pages/freelancer/FreelancerNotifications.tsx';

// Company Pages
import { CompanyHome } from './pages/company/CompanyHome.tsx';
import { CompanyProfilePage } from './pages/company/CompanyProfile.tsx';
import { CompanyAnalyticsPage } from './pages/company/CompanyAnalytics.tsx';
import { CompanyActiveJobs } from './pages/company/CompanyActiveJobs.tsx';
import { CompanyCompletedJobs } from './pages/company/CompanyCompletedJobs.tsx';
import { CompanyActivePostings } from './pages/company/CompanyActivePostings.tsx';
import { CompanyPreviousPostings } from './pages/company/CompanyPreviousPostings.tsx';
import { CompanyCreatePosting } from './pages/company/CompanyCreatePosting.tsx';
import { CompanyApplicationReview } from './pages/company/CompanyApplicationReview.tsx';
import { CompanyPaymentsPage } from './pages/company/CompanyPayments.tsx';
import { CompanyNotificationsPage } from './pages/company/CompanyNotifications.tsx';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: 'FREELANCER' | 'COMPANY';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={allowedRole === 'COMPANY' ? '/login/company' : '/login/freelancer'} replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login/freelancer" element={<LoginFreelancerPage />} />
              <Route path="/login/company" element={<LoginCompanyPage />} />
              <Route path="/register/freelancer" element={<RegisterFreelancerPage />} />
              <Route path="/register/company" element={<RegisterCompanyPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* Freelancer Workspace Protected Routes */}
              <Route
                path="/freelancer"
                element={
                  <ProtectedRoute allowedRole="FREELANCER">
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<FreelancerOverview />} />
                <Route path="analytics" element={<FreelancerAnalyticsPage />} />
                <Route path="projects" element={<FreelancerFindProjects />} />
                <Route path="applications" element={<FreelancerApplications />} />
                <Route path="jobs" element={<FreelancerActiveJobs />} />
                <Route path="completed" element={<FreelancerCompletedJobs />} />
                <Route path="profile" element={<FreelancerProfilePage />} />
                <Route path="payments" element={<FreelancerPaymentsPage />} />
                <Route path="notifications" element={<FreelancerNotificationsPage />} />
              </Route>

              {/* Company Workspace Protected Routes */}
              <Route
                path="/company"
                element={
                  <ProtectedRoute allowedRole="COMPANY">
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<CompanyHome />} />
                <Route path="profile" element={<CompanyProfilePage />} />
                <Route path="analytics" element={<CompanyAnalyticsPage />} />
                <Route path="jobs" element={<CompanyActiveJobs />} />
                <Route path="completed" element={<CompanyCompletedJobs />} />
                <Route path="postings/active" element={<CompanyActivePostings />} />
                <Route path="postings/previous" element={<CompanyPreviousPostings />} />
                <Route path="postings/create" element={<CompanyCreatePosting />} />
                <Route path="postings/:id/applications" element={<CompanyApplicationReview />} />
                <Route path="payments" element={<CompanyPaymentsPage />} />
                <Route path="notifications" element={<CompanyNotificationsPage />} />
              </Route>

              {/* 404 Catch All */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
