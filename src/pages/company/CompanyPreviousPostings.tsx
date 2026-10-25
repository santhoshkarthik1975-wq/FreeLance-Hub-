import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Archive, Search, Users, ExternalLink, Calendar, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { StatusBadge } from '../../components/ui/StatusBadge.tsx';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { formatDate } from '../../utils/formatters.ts';
import type { ProjectPosting } from '../../types/index.ts';

export const CompanyPreviousPostings: React.FC = () => {
  const [postings, setPostings] = useState<ProjectPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const toast = useToast();

  const fetchPreviousPostings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/company/projects');
      if (res.data?.data?.previousPostings) {
        setPostings(res.data.data.previousPostings);
      }
    } catch (err: any) {
      toast.error('Failed to load previous postings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreviousPostings();
  }, []);

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
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Previous & Archived Postings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Historical record of filled engineering positions, closed requirements, and archived listings.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search previous postings..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs font-semibold">
          {['ALL', 'FILLED', 'CLOSED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'All Previous' : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <SkeletonLoader rows={3} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No Previous Postings Yet"
          description="When you hire a candidate for a posting, it transitions to Filled and is preserved here in your historical records."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider bg-slate-50/70">
                  <th className="py-3 px-4">Project Title</th>
                  <th className="py-3 px-4">Budget Range</th>
                  <th className="py-3 px-4">Applicants</th>
                  <th className="py-3 px-4">Published Date</th>
                  <th className="py-3 px-4">Final Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((posting) => (
                  <tr key={posting._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs truncate">
                      {posting.title}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                      ${posting.minBudget} – ${posting.maxBudget}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-700">{posting.applicantCount} proposals</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{formatDate(posting.createdAt)}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={posting.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Link
                        to={`/company/postings/${posting._id}/applications`}
                        className="px-2.5 py-1 rounded-md text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition"
                      >
                        Applicants
                      </Link>
                      {posting.status === 'FILLED' && (
                        <Link
                          to="/company/jobs"
                          className="px-2.5 py-1 rounded-md text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition"
                        >
                          Active Contract →
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
