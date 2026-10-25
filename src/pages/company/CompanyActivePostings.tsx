import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  Search,
  Users,
  Edit3,
  XCircle,
  Eye,
  Calendar,
  DollarSign,
  X,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { StatusBadge } from '../../components/ui/StatusBadge.tsx';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { formatDate } from '../../utils/formatters.ts';
import type { ProjectPosting } from '../../types/index.ts';

export const CompanyActivePostings: React.FC = () => {
  const [postings, setPostings] = useState<ProjectPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPosting, setSelectedPosting] = useState<ProjectPosting | null>(null);

  const toast = useToast();

  const fetchPostings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/company/projects');
      if (res.data?.data?.activePostings) {
        setPostings(res.data.data.activePostings);
      }
    } catch (err: any) {
      toast.error('Failed to load postings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostings();
  }, []);

  const handleClosePosting = async (id: string) => {
    if (!confirm('Are you sure you want to close this posting? It will stop receiving new applications.')) {
      return;
    }

    try {
      await api.patch(`/projects/${id}/status`, { status: 'CLOSED' });
      toast.success('Project posting has been closed and moved to Previous Postings.');
      await fetchPostings();
    } catch (err: any) {
      toast.error(err.message || 'Failed to close posting');
    }
  };

  const filtered = postings.filter((p) => {
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.title.toLowerCase().includes(q) && !p.summary.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Active Job Postings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your open engineering positions, monitor applicant counts, and hire candidates.
          </p>
        </div>

        <Link
          to="/company/postings/create"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Posting</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search active postings..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          {['ALL', 'OPEN', 'DRAFT'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'All Active' : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Postings List */}
      {loading ? (
        <SkeletonLoader rows={3} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No Active Postings Found"
          description="Create an open project posting to attract proposals from vetted full-stack engineers."
          actionLabel="Create Project Posting"
          onAction={() => (window.location.href = '/company/postings/create')}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((posting) => (
            <div
              key={posting._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <StatusBadge status={posting.status} size="sm" />
                  <span className="text-xs text-slate-400">
                    Created {formatDate(posting.createdAt)}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {posting.applicantCount} Proposals
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{posting.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2 max-w-3xl leading-relaxed">
                  {posting.summary}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {posting.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right Side Actions */}
              <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="text-left md:text-right">
                  <span className="text-base font-mono font-bold text-slate-900">
                    ${posting.minBudget} – ${posting.maxBudget}
                  </span>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {posting.projectType} • {posting.duration}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/company/postings/${posting._id}/applications`}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition flex items-center gap-1"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Review Applicants ({posting.applicantCount})</span>
                  </Link>

                  <button
                    onClick={() => setSelectedPosting(posting)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleClosePosting(posting._id)}
                    className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                    title="Close Posting"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedPosting && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start gap-3 border-b border-slate-100 pb-3">
              <div>
                <StatusBadge status={selectedPosting.status} size="sm" />
                <h3 className="text-base font-bold text-slate-900 mt-1">{selectedPosting.title}</h3>
              </div>
              <button
                onClick={() => setSelectedPosting(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs leading-relaxed">
              <p className="text-slate-700 whitespace-pre-line">{selectedPosting.description}</p>
              <div className="pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-800">Requirements:</span>
                <p className="text-slate-600 mt-0.5">{selectedPosting.requirements || 'Standard requirements apply.'}</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs">
              <Link
                to={`/company/postings/${selectedPosting._id}/applications`}
                className="text-indigo-600 hover:text-indigo-800 font-bold"
              >
                Go to Applicants ({selectedPosting.applicantCount}) →
              </Link>
              <button
                onClick={() => setSelectedPosting(null)}
                className="px-4 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
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
