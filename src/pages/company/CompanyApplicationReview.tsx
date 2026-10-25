import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Users,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ExternalLink,
  DollarSign,
  Clock,
  Briefcase,
  User,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { StatusBadge } from '../../components/ui/StatusBadge.tsx';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { formatDate } from '../../utils/formatters.ts';
import type { Application, ProjectPosting } from '../../types/index.ts';

export const CompanyApplicationReview: React.FC = () => {
  const { id: postingId } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectPosting | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const loadData = async () => {
    if (!postingId) return;
    try {
      setLoading(true);
      const [projRes, appRes] = await Promise.all([
        api.get(`/projects/${postingId}`),
        api.get(`/company/projects/${postingId}/applications`),
      ]);
      if (projRes.data?.data) setProject(projRes.data.data);
      if (appRes.data?.data) setApplications(appRes.data.data);
    } catch (err: any) {
      toast.error('Failed to load applicants: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [postingId]);

  const handleAcceptApplication = async (application: Application) => {
    const candidateName = application.freelancer?.name || 'Freelancer';
    const amount = application.proposedAmount;

    if (
      !confirm(
        `Are you sure you want to hire ${candidateName} for $${amount}? This will accept their proposal, automatically create the active contract, mark the posting as Filled, and update other applicants.`
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.post(`/applications/${application._id}/accept`);
      toast.success(
        `🎉 Candidate hired! Contract created for $${amount}. Posting is now marked as Filled.`
      );
      // Navigate to active jobs where contract is ready
      navigate('/company/jobs');
    } catch (err: any) {
      toast.error(err.message || 'Failed to accept application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    if (!confirm('Are you sure you want to decline this applicant proposal?')) {
      return;
    }

    setActionLoading(true);
    try {
      await api.post(`/applications/${applicationId}/reject`);
      toast.info('Application declined.');
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject application');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button and Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Link
            to="/company/postings/active"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Active Postings
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Applicant Proposals</h1>
            {project && <StatusBadge status={project.status} size="sm" />}
          </div>
          {project && (
            <p className="text-xs text-slate-500 mt-0.5">
              Reviewing candidate submissions for: <span className="font-semibold text-slate-800">{project.title}</span> (Budget: ${project.minBudget} - ${project.maxBudget})
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <SkeletonLoader rows={2} />
      ) : applications.length === 0 ? (
        <EmptyState
          title="No Applications Received Yet"
          description="Your posting is active in the marketplace. When freelancers submit bids, they will appear here for review."
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const freelancer = app.freelancer;
            const profile = freelancer?.profile;

            return (
              <div
                key={app._id}
                className={`bg-white rounded-2xl border p-6 shadow-xs space-y-4 transition ${
                  app.status === 'ACCEPTED'
                    ? 'border-emerald-300 ring-2 ring-emerald-50'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                {/* Candidate Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-base shrink-0">
                      {freelancer?.name ? freelancer.name.charAt(0).toUpperCase() : 'F'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{freelancer?.name || 'Freelancer'}</h3>
                        <StatusBadge status={app.status} size="sm" />
                      </div>
                      <p className="text-xs text-slate-500">
                        {profile?.headline || 'Full Stack Engineer'} • Applied {formatDate(app.appliedDate)}
                      </p>
                    </div>
                  </div>

                  {/* Proposed Amount */}
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Proposed Bid</span>
                    <p className="text-xl font-mono font-bold text-slate-900">
                      ${app.proposedAmount.toLocaleString()} {app.currency}
                    </p>
                    <p className="text-xs text-slate-500">Delivery in {app.estimatedDuration}</p>
                  </div>
                </div>

                {/* Cover letter */}
                <div className="space-y-2 text-xs">
                  <h4 className="font-bold text-slate-900">Cover Letter & Technical Approach</h4>
                  <div className="text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                    {app.coverLetter}
                  </div>
                </div>

                {/* Candidate Skills & External Links */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-slate-400 font-semibold mr-1">Skills:</span>
                    {(profile?.skills || ['React', 'TypeScript', 'Node.js']).slice(0, 5).map((sk, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                        {sk}
                      </span>
                    ))}
                  </div>

                  {app.portfolioUrl && (
                    <a
                      href={app.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:underline flex items-center gap-1 font-mono font-semibold"
                    >
                      Portfolio Work <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {/* Actions: Accept (Hire) / Reject */}
                {app.status === 'PENDING' && project?.status === 'OPEN' && (
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleRejectApplication(app._id)}
                      className="px-3.5 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition"
                    >
                      Decline Proposal
                    </button>

                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleAcceptApplication(app)}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Accept & Hire Candidate</span>
                    </button>
                  </div>
                )}

                {app.status === 'ACCEPTED' && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-semibold">
                        This proposal was accepted. An active contract was initiated for ${app.proposedAmount}.
                      </span>
                    </div>
                    <Link
                      to="/company/jobs"
                      className="font-bold text-emerald-800 underline text-xs"
                    >
                      View Active Job →
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
