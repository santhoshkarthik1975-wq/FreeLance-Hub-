import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  Plus,
  ExternalLink,
  DollarSign,
  MessageSquare,
  X,
  Send,
  Building,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { StatusBadge } from '../../components/ui/StatusBadge.tsx';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { formatMinorUnits, formatDate } from '../../utils/formatters.ts';
import type { Contract, Milestone } from '../../types/index.ts';

export const CompanyActiveJobs: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Modal state (Approve vs Request Revision)
  const [reviewMilestone, setReviewMilestone] = useState<Milestone | null>(null);
  const [reviewContract, setReviewContract] = useState<Contract | null>(null);
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Add Milestone Modal state
  const [addMilestoneContract, setAddMilestoneContract] = useState<Contract | null>(null);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    amountMajor: '',
    dueDate: '',
  });

  const toast = useToast();

  const fetchActiveJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/company/contracts');
      if (res.data?.data?.active) {
        setContracts(res.data.data.active);
      }
    } catch (err: any) {
      toast.error('Failed to load active contracts: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveJobs();
  }, []);

  const handleApproveMilestone = async () => {
    if (!reviewMilestone) return;
    setActionLoading(true);
    try {
      await api.post(`/milestones/${reviewMilestone._id}/approve`);
      toast.success('Milestone approved! You can now release simulated demo payment from Payments.');
      setReviewMilestone(null);
      setReviewContract(null);
      await fetchActiveJobs();
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve milestone');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewMilestone) return;

    if (revisionFeedback.trim().length < 5) {
      toast.error('Please provide clear feedback explaining what revisions are needed.');
      return;
    }

    setActionLoading(true);
    try {
      await api.post(`/milestones/${reviewMilestone._id}/request-revision`, {
        feedback: revisionFeedback,
      });
      toast.success('Revision request sent to the freelancer with your feedback.');
      setReviewMilestone(null);
      setReviewContract(null);
      setShowRevisionForm(false);
      setRevisionFeedback('');
      await fetchActiveJobs();
    } catch (err: any) {
      toast.error(err.message || 'Failed to request revision');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddMilestoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addMilestoneContract) return;

    if (!newMilestone.title.trim()) {
      toast.error('Milestone title is required');
      return;
    }
    if (Number(newMilestone.amountMajor) <= 0) {
      toast.error('Milestone amount must be greater than $0');
      return;
    }

    setActionLoading(true);
    try {
      await api.post(`/contracts/${addMilestoneContract._id}/milestones`, {
        title: newMilestone.title,
        description: newMilestone.description,
        amountMajor: Number(newMilestone.amountMajor),
        dueDate: newMilestone.dueDate || undefined,
      });

      toast.success('New milestone added to contract!');
      setAddMilestoneContract(null);
      setNewMilestone({ title: '', description: '', amountMajor: '', dueDate: '' });
      await fetchActiveJobs();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create milestone');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Active Contractor Jobs</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor deliverable submissions, approve completed milestones, or request technical revisions.
        </p>
      </div>

      {loading ? (
        <SkeletonLoader rows={2} />
      ) : contracts.length === 0 ? (
        <EmptyState
          title="No Active Contracts"
          description="When you accept an application for an open posting, an active contract is created automatically."
          actionLabel="View Active Postings"
          onAction={() => (window.location.href = '/company/postings/active')}
        />
      ) : (
        <div className="space-y-6">
          {contracts.map((contract) => {
            const milestones = contract.milestones || [];
            const completedCount = milestones.filter(
              (m) => m.status === 'PAID' || m.status === 'APPROVED'
            ).length;
            const progress = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

            return (
              <div
                key={contract._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6"
              >
                {/* Contract Summary */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <StatusBadge status={contract.status} size="sm" />
                      <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        Contractor: {contract.freelancerName || 'Freelancer'}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                      {contract.contractTitle}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Started {formatDate(contract.startDate)} • Target deadline: {formatDate(contract.expectedCompletionDate)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Total Contract Value</span>
                      <p className="text-xl font-mono font-bold text-slate-900">
                        {formatMinorUnits(contract.agreedAmount, contract.currency)}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-indigo-700">{progress}%</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setAddMilestoneContract(contract)}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Milestone
                    </button>
                  </div>
                </div>

                {/* Milestones List */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Contract Milestones ({milestones.length})
                  </h3>

                  {milestones.map((m, idx) => {
                    const latestSubmission = (m.submissions || []).slice(-1)[0];

                    return (
                      <div
                        key={m._id}
                        className="p-4 rounded-xl border border-slate-200/70 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                                {idx + 1}
                              </span>
                              <h4 className="text-sm font-bold text-slate-900">{m.title}</h4>
                              <StatusBadge status={m.status} size="sm" />
                            </div>
                            <p className="text-xs text-slate-600 pl-7">{m.description}</p>
                            {m.dueDate && (
                              <p className="text-[11px] text-slate-400 pl-7">
                                Due date: {formatDate(m.dueDate)}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-3 pl-7 sm:pl-0">
                            <span className="text-sm font-mono font-bold text-slate-900">
                              {formatMinorUnits(m.amount, m.currency)}
                            </span>

                            {m.status === 'SUBMITTED' && (
                              <button
                                onClick={() => {
                                  setReviewContract(contract);
                                  setReviewMilestone(m);
                                  setShowRevisionForm(false);
                                  setRevisionFeedback('');
                                }}
                                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
                              >
                                Review Deliverable
                              </button>
                            )}

                            {m.status === 'APPROVED' && (
                              <a
                                href="/company/payments"
                                className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition"
                              >
                                Ready to Pay →
                              </a>
                            )}

                            {m.status === 'PAID' && (
                              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                                ✓ Paid & Settled
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Deliverable preview if submitted */}
                        {latestSubmission && (
                          <div className="mt-3 ml-7 p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800">Contractor Submission:</span>
                              <a
                                href={latestSubmission.deliverableUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-indigo-600 hover:underline flex items-center gap-1 font-mono font-semibold"
                              >
                                {latestSubmission.deliverableUrl} <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                            <p className="text-slate-600 leading-relaxed italic">
                              "{latestSubmission.message}"
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Deliverable Modal */}
      {reviewMilestone && reviewContract && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                  Deliverable Evaluation
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{reviewMilestone.title}</h3>
                <p className="text-xs text-slate-500">
                  Value: {formatMinorUnits(reviewMilestone.amount, reviewMilestone.currency)}
                </p>
              </div>
              <button
                onClick={() => {
                  setReviewMilestone(null);
                  setReviewContract(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Submitted deliverable details */}
            {reviewMilestone.submissions && reviewMilestone.submissions.length > 0 && (
              <div className="my-4 p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs space-y-2">
                <span className="font-bold text-slate-700">Contractor Deliverable URL:</span>
                <a
                  href={reviewMilestone.submissions[reviewMilestone.submissions.length - 1].deliverableUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-indigo-600 hover:underline font-mono truncate"
                >
                  {reviewMilestone.submissions[reviewMilestone.submissions.length - 1].deliverableUrl}
                </a>
                <p className="text-slate-600 pt-1">
                  <strong>Notes:</strong> {reviewMilestone.submissions[reviewMilestone.submissions.length - 1].message}
                </p>
              </div>
            )}

            {!showRevisionForm ? (
              <div className="space-y-3 pt-2">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Carefully evaluate the deliverable against your technical requirements. Approving this milestone permits releasing simulated demo escrow payment.
                </p>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    onClick={handleApproveMilestone}
                    disabled={actionLoading}
                    className="flex-1 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Deliverable</span>
                  </button>

                  <button
                    onClick={() => setShowRevisionForm(true)}
                    className="flex-1 py-2.5 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Request Changes</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRequestRevision} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Describe Required Revisions <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide constructive actionable feedback detailing specific code fixes, styling issues, or missing criteria..."
                    value={revisionFeedback}
                    onChange={(e) => setRevisionFeedback(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRevisionForm(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Revision Request</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add Milestone Modal */}
      {addMilestoneContract && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add Milestone to Contract</h3>
                <p className="text-xs text-slate-500">{addMilestoneContract.contractTitle}</p>
              </div>
              <button
                onClick={() => setAddMilestoneContract(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMilestoneSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Milestone Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Phase 3: Integration Testing & Deployment"
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Deliverable Specs
                </label>
                <textarea
                  rows={3}
                  placeholder="Specify key deliverables expected for this phase..."
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Amount Allocated ($ USD) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="1500"
                    value={newMilestone.amountMajor}
                    onChange={(e) => setNewMilestone({ ...newMilestone, amountMajor: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Due Date
                  </label>
                  <input
                    type="date"
                    value={newMilestone.dueDate}
                    onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddMilestoneContract(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs disabled:opacity-50"
                >
                  {actionLoading ? 'Adding...' : 'Add Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
