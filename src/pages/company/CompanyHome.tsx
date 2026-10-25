import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  FileCheck,
  CreditCard,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { StatCard } from '../../components/ui/StatCard.tsx';
import { StatusBadge } from '../../components/ui/StatusBadge.tsx';
import { formatMinorUnits, formatDate } from '../../utils/formatters.ts';
import type { CompanyAnalytics, ProjectPosting, Application, Contract } from '../../types/index.ts';

export const CompanyHome: React.FC = () => {
  const { user, profile } = useAuth();
  const [analytics, setAnalytics] = useState<CompanyAnalytics | null>(null);
  const [activePostings, setActivePostings] = useState<ProjectPosting[]>([]);
  const [activeContracts, setActiveContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCompanyDashboard() {
      try {
        setLoading(true);
        const [anRes, postRes, contRes] = await Promise.all([
          api.get('/analytics/company'),
          api.get('/company/projects'),
          api.get('/company/contracts'),
        ]);

        if (anRes.data?.data) setAnalytics(anRes.data.data);
        if (postRes.data?.data?.activePostings) setActivePostings(postRes.data.data.activePostings.slice(0, 3));
        if (contRes.data?.data?.active) setActiveContracts(contRes.data.data.active.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCompanyDashboard();
  }, []);

  const completionPercent = (profile as any)?.profileCompletion || 85;

  const spendingChartData = (analytics?.monthlySpending || []).map((item) => ({
    month: item.month,
    spending: item.amountMinor / 100,
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel relative overflow-hidden rounded-3xl p-6 text-slate-800 shadow-xl border border-white/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">Company Portal</span>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-2">
            {profile && 'companyName' in profile ? (profile as any).companyName : user?.name || 'Company Dashboard'}
          </h1>
          <p className="text-xs font-medium text-slate-600 mt-1 max-w-xl">
            Publish engineering projects, evaluate incoming candidate proposals, oversee milestone progress, and record simulated demo disbursements.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link
            to="/company/postings/create"
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl glass-button-primary text-white font-bold text-xs transition shadow-md shadow-indigo-500/25 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Job Posting</span>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Active Postings"
          value={analytics?.openPostings ?? 0}
          icon={Briefcase}
          color="indigo"
        />
        <StatCard
          title="Applications Received"
          value={analytics?.totalApplications ?? 0}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Awaiting Review"
          value={analytics?.pendingReviewCount ?? 0}
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Active Contracts"
          value={analytics?.activeContracts ?? 0}
          icon={FileCheck}
          color="purple"
        />
        <StatCard
          title="Hire Conversion"
          value={`${analytics?.hiringConversionRate ?? 0}%`}
          subtitle="Proposals hired"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Total Spent"
          value={formatMinorUnits(analytics?.totalSpentMinor ?? 0)}
          subtitle="Simulated demo funds"
          icon={CreditCard}
          color="emerald"
        />
      </div>

      {/* Middle Grid: Spending Chart + Active Postings Quick View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Recharts Area/Bar */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-5 shadow-lg border border-white/70">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monthly Project Spending & Escrow ($ USD)</h3>
              <p className="text-xs text-slate-500">Historical simulated disbursements to contractors</p>
            </div>
            <Link to="/company/payments" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
              Payments Ledger
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendingChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  formatter={(val: any) => [`$${val}`, 'Simulated Spend']}
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(8px)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.6)', fontSize: '12px' }}
                />
                <Bar dataKey="spending" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Company Profile Strength & Quick Actions */}
        <div className="glass-card rounded-3xl p-5 shadow-lg border border-white/70 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">Company Profile Strength</h3>
            <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
              <span className="text-slate-600">Profile completeness</span>
              <span className="text-indigo-600">{completionPercent}%</span>
            </div>
            <div className="w-full bg-slate-200/60 rounded-full h-2 overflow-hidden mb-4">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              ></div>
            </div>

            <div className="p-3.5 rounded-2xl glass-panel-subtle border border-white/80 space-y-2 text-xs">
              <p className="font-bold text-slate-900">⚡ Hiring Management Shortcut</p>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Review applicants for your active postings. Accepting a candidate automatically creates a contract and marks the posting as Filled.
              </p>
              <Link
                to="/company/postings/active"
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 pt-1"
              >
                Review Active Postings <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-white/50 flex gap-2">
            <Link
              to="/company/postings/create"
              className="flex-1 py-2.5 text-center rounded-xl glass-button-primary text-white font-bold text-xs shadow-sm"
            >
              Post a Project
            </Link>
            <Link
              to="/company/profile"
              className="px-3.5 py-2.5 rounded-xl glass-panel-subtle text-slate-700 hover:bg-white/80 font-bold text-xs border border-white/60 transition"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Active Postings Overview */}
      <div className="glass-card rounded-3xl p-5 shadow-lg border border-white/70">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Current Active Postings</h3>
            <p className="text-xs text-slate-500">Postings currently open or accepting proposals</p>
          </div>
          <Link
            to="/company/postings/active"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
          >
            Manage All ({activePostings.length})
          </Link>
        </div>

        {activePostings.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No active postings. Click "Create New Job Posting" to recruit freelancers.</p>
        ) : (
          <div className="divide-y divide-white/30">
            {activePostings.map((p) => (
              <div key={p._id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={p.status} size="sm" />
                    <h4 className="font-bold text-slate-900 text-sm">{p.title}</h4>
                  </div>
                  <p className="text-slate-500 text-[11px] line-clamp-1 max-w-xl">{p.summary}</p>
                  <div className="flex items-center gap-3 text-slate-400 text-[11px] font-medium">
                    <span>Budget: ${p.minBudget} - ${p.maxBudget}</span>
                    <span>•</span>
                    <span className="font-bold text-indigo-600">{p.applicantCount} Applicants</span>
                    <span>•</span>
                    <span>Posted {formatDate(p.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/company/postings/${p._id}/applications`}
                    className="px-3.5 py-1.5 rounded-xl glass-panel-subtle hover:bg-white/90 text-indigo-700 font-bold text-xs border border-indigo-200/60 transition shadow-xs"
                  >
                    Review Applicants ({p.applicantCount})
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
