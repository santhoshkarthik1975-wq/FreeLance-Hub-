import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  Building,
  Calendar,
  DollarSign,
  ExternalLink,
  X,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { StatusBadge } from '../../components/ui/StatusBadge.tsx';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { formatMinorUnits, formatDate } from '../../utils/formatters.ts';
import type { Contract, Milestone } from '../../types/index.ts';

export const FreelancerActiveJobs: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  // Deliverable modal state
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [deliverableForm, setDeliverableForm] = useState({
    message: '',
    deliverableUrl: '',
    attachmentUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const toast = useToast();

  const fetchActiveContracts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/freelancer/contracts');
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
    fetchActiveContracts();
  }, []);

  const handleOpenSubmitDeliverable = (contract: Contract, milestone: Milestone) => {
    setSelectedContract(contract);
    setSelectedMilestone(milestone);
    setDeliverableForm({
      message: '',
      deliverableUrl: '',
      attachmentUrl: '',
    });
    setErrorMsg('');
  };

  const handleSubmitDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMilestone) return;

    if (deliverableForm.message.trim().length < 10) {
      setErrorMsg('Please describe what has been completed in this milestone (minimum 10 characters).');
      return;
    }
    if (!deliverableForm.deliverableUrl.startsWith('http')) {
      setErrorMsg('Please enter a valid web link to your deliverable (e.g. GitHub Pull Request, Figma file, preview URL).');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      await api.post(`/milestones/${selectedMilestone._id}/submit`, {
        message: deliverableForm.message,
        deliverableUrl: deliverableForm.deliverableUrl,
        attachmentUrls: deliverableForm.attachmentUrl ? [deliverableForm.attachmentUrl] : [],
      });

      toast.success('Deliverable submitted successfully! Client has been notified for review.');
      setSelectedMilestone(null);
      setSelectedContract(null);
      await fetchActiveContracts();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit deliverable');
      toast.error(err.message || 'Submission error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Active Contracts & Milestones</h1>
        <p className="text-xs text-slate-500 mt-1">
          Deliver project phases, submit pull requests & review links, and track client approvals.
        </p>
      </div>

      {loading ? (
        <SkeletonLoader rows={2} />
      ) : contracts.length === 0 ? (
        <EmptyState
          title="No Active Contracts Currently"
          description="You do not have any ongoing jobs at this time. Submit proposals to open postings to win contracts!"
          actionLabel="Find Open Projects"
          onAction={() => (window.location.href = '/freelancer/projects')}
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
                {/* Contract Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <StatusBadge status={contract.status} size="sm" />
                      <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        {contract.companyName || 'Company'}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                      {contract.contractTitle}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Contract started {formatDate(contract.startDate)} • Target completion:{' '}
                      {formatDate(contract.expectedCompletionDate)}
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-xs text-slate-400 uppercase font-semibold">Total Contract Value</p>
                    <p className="text-xl font-mono font-bold text-slate-900">
                      {formatMinorUnits(contract.agreedAmount, contract.currency)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="w-28 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-indigo-700">{progress}%</span>
                    </div>
                  </div>
                </div>

                {/* Milestones Timeline */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Milestones Breakdown ({milestones.length})
                  </h3>

                  <div className="space-y-3">
                    {milestones.map((m, index) => {
                      const isSubmissible =
                        m.status === 'PENDING' ||
                        m.status === 'IN_PROGRESS' ||
                        m.status === 'REVISION_REQUESTED';
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
                                  {index + 1}
                                </span>
                                <h4 className="text-sm font-bold text-slate-900">{m.title}</h4>
                                <StatusBadge status={m.status} size="sm" />
                              </div>

                              <p className="text-xs text-slate-600 pl-7">{m.description}</p>
                              {m.dueDate && (
                                <p className="text-[11px] text-slate-400 pl-7">
                                  Target Deadline: {formatDate(m.dueDate)}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-3 pl-7 sm:pl-0">
                              <span className="text-sm font-mono font-bold text-slate-900">
                                {formatMinorUnits(m.amount, m.currency)}
                              </span>

                              {isSubmissible && (
                                <button
                                  onClick={() => handleOpenSubmitDeliverable(contract, m)}
                                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>{m.status === 'REVISION_REQUESTED' ? 'Submit Revision' : 'Submit Deliverable'}</span>
                                </button>
                              )}

                              {m.status === 'SUBMITTED' && (
                                <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                                  In Review by Client
                                </span>
                              )}

                              {m.status === 'PAID' && (
                                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                                  ✓ Paid & Settled
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Revision feedback banner if requested */}
                          {m.status === 'REVISION_REQUESTED' && latestSubmission?.revisionFeedback && (
                            <div className="mt-3 ml-7 p-3 rounded-lg bg-purple-50 border border-purple-200 text-xs text-purple-900">
                              <p className="font-bold flex items-center gap-1.5">
                                <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                                Client Revision Feedback:
                              </p>
                              <p className="mt-0.5 text-purple-800 leading-relaxed">
                                "{latestSubmission.revisionFeedback}"
                              </p>
                            </div>
                          )}

                          {/* Submission Details */}
                          {latestSubmission && (
                            <div className="mt-2.5 ml-7 text-[11px] text-slate-500 bg-white p-2.5 rounded-lg border border-slate-100 flex items-center justify-between">
                              <span className="truncate max-w-md">
                                <strong className="text-slate-700">Latest Submission:</strong> {latestSubmission.message}
                              </span>
                              <a
                                href={latestSubmission.deliverableUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-indigo-600 hover:underline flex items-center gap-1 font-mono font-medium shrink-0 ml-2"
                              >
                                View Deliverable <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Deliverable Submission Modal */}
      {selectedMilestone && selectedContract && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                  Deliverable Submission
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{selectedMilestone.title}</h3>
                <p className="text-xs text-slate-500">
                  Value: {formatMinorUnits(selectedMilestone.amount, selectedMilestone.currency)}
                </p>
              </div>
              <button
                onClick={() => setSelectedMilestone(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmitDeliverable} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deliverable Web URL (GitHub PR / Figma / Preview) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://github.com/organization/repo/pull/1"
                  value={deliverableForm.deliverableUrl}
                  onChange={(e) =>
                    setDeliverableForm({ ...deliverableForm, deliverableUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Submission Summary & Notes for Client <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Summarize the completed tasks, testing performed, and instructions for how the client can verify the work..."
                  value={deliverableForm.message}
                  onChange={(e) => setDeliverableForm({ ...deliverableForm, message: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Documentation / Spec Link <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/deployment-guide.md"
                  value={deliverableForm.attachmentUrl}
                  onChange={(e) =>
                    setDeliverableForm({ ...deliverableForm, attachmentUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedMilestone(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? 'Submitting...' : 'Send for Client Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
