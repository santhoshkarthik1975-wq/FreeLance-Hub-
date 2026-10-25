import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, AlertCircle, Trash2, ExternalLink, X, FileText } from 'lucide-react';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { StatusBadge } from '../../components/ui/StatusBadge.tsx';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { formatDate } from '../../utils/formatters.ts';
import type { Application } from '../../types/index.ts';

export const FreelancerApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const toast = useToast();

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/freelancer/applications');
      if (res.data?.data) {
        setApplications(res.data.data);
      }
    } catch (err: any) {
      toast.error('Failed to load applications: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async (applicationId: string) => {
    if (!confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(true);
      await api.patch(`/applications/${applicationId}/withdraw`);
      toast.success('Application withdrawn successfully');
      setSelectedApp(null);
      await fetchApplications();
    } catch (err: any) {
      toast.error(err.message || 'Failed to withdraw application');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredApps = applications.filter((app) => {
    if (statusFilter !== 'ALL' && app.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchTitle = app.posting?.title.toLowerCase().includes(q);
      const matchComp = app.posting?.company?.name?.toLowerCase().includes(q);
      if (!matchTitle && !matchComp) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Submitted Applications</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review the status of your project proposals, submitted bid amounts, and withdraw applications if needed.
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by project or company..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs font-semibold">
          {['ALL', 'PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'All Applications' : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      {loading ? (
        <SkeletonLoader rows={3} />
      ) : filteredApps.length === 0 ? (
        <EmptyState
          title="No Applications Found"
          description="You have not submitted applications matching the chosen filter. Explore available projects in the marketplace."
          actionLabel="Find Projects"
          onAction={() => (window.location.href = '/freelancer/projects')}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider bg-slate-50/70">
                  <th className="py-3 px-4">Project Title</th>
                  <th className="py-3 px-4">Hiring Company</th>
                  <th className="py-3 px-4">Proposed Bid</th>
                  <th className="py-3 px-4">Estimated Delivery</th>
                  <th className="py-3 px-4">Applied Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs truncate">
                      {app.posting?.title || 'Project'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {app.posting?.company?.name || 'Apex Innovations Inc.'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      ${app.proposedAmount.toLocaleString()} {app.currency}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{app.estimatedDuration}</td>
                    <td className="py-3.5 px-4 text-slate-500">{formatDate(app.appliedDate)}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={app.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="px-2.5 py-1 rounded-md text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition"
                      >
                        Details
                      </button>
                      {app.status === 'PENDING' && (
                        <button
                          onClick={() => handleWithdraw(app._id)}
                          className="px-2.5 py-1 rounded-md text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                          title="Withdraw application"
                        >
                          Withdraw
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Application Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start gap-3 border-b border-slate-100 pb-3">
              <div>
                <StatusBadge status={selectedApp.status} size="sm" />
                <h3 className="text-base font-bold text-slate-900 mt-1">{selectedApp.posting?.title}</h3>
                <p className="text-xs text-slate-500">
                  Company: {selectedApp.posting?.company?.name} • Applied {formatDate(selectedApp.appliedDate)}
                </p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold">Your Proposed Amount</span>
                  <p className="font-mono font-bold text-slate-900 mt-0.5 text-sm">
                    ${selectedApp.proposedAmount} {selectedApp.currency}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold">Estimated Delivery</span>
                  <p className="font-semibold text-slate-900 mt-0.5 text-sm">{selectedApp.estimatedDuration}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">Your Submitted Cover Letter</h4>
                <div className="text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {selectedApp.coverLetter}
                </div>
              </div>

              {selectedApp.portfolioUrl && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Portfolio Reference</h4>
                  <a
                    href={selectedApp.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:underline flex items-center gap-1 font-mono"
                  >
                    {selectedApp.portfolioUrl} <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {selectedApp.status === 'ACCEPTED' && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
                  <p className="font-bold">🎉 Proposal Accepted!</p>
                  <p className="mt-0.5 text-[11px]">
                    The hiring company accepted this application and created your active contract. Head over to Active Jobs to view milestones and submit work.
                  </p>
                  <Link
                    to="/freelancer/jobs"
                    className="inline-block mt-2 text-xs font-bold text-emerald-700 underline"
                  >
                    View Active Contract →
                  </Link>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              {selectedApp.status === 'PENDING' ? (
                <button
                  onClick={() => handleWithdraw(selectedApp._id)}
                  disabled={actionLoading}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200"
                >
                  Withdraw Proposal
                </button>
              ) : (
                <div></div>
              )}

              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
