import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  DollarSign,
  Briefcase,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { StatCard } from '../../components/ui/StatCard.tsx';
import { StatusBadge } from '../../components/ui/StatusBadge.tsx';
import { formatMinorUnits, formatMajorUnits, formatDate } from '../../utils/formatters.ts';
import type { FreelancerAnalytics, ProjectPosting, Application } from '../../types/index.ts';

export const FreelancerOverview: React.FC = () => {
  const { user, profile } = useAuth();
  const [analytics, setAnalytics] = useState<FreelancerAnalytics | null>(null);
  const [recentApps, setRecentApps] = useState<Application[]>([]);
  const [recommendedProjects, setRecommendedProjects] = useState<ProjectPosting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [anRes, appRes, projRes] = await Promise.all([
          api.get('/analytics/freelancer'),
          api.get('/freelancer/applications'),
          api.get('/projects?status=OPEN'),
        ]);

        if (anRes.data?.data) setAnalytics(anRes.data.data);
        if (appRes.data?.data) setRecentApps(appRes.data.data.slice(0, 4));
        if (projRes.data?.data) setRecommendedProjects(projRes.data.data.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const completionPercent = (profile as any)?.profileCompletion || 75;

  const chartData = (analytics?.monthlyEarnings || []).map((item) => ({
    month: item.month,
    earnings: item.amountMinor / 100,
  }));

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="glass-panel relative overflow-hidden rounded-3xl p-6 text-slate-800 shadow-xl border border-white/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">Freelancer Workspace</span>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-2">
            Welcome back, {user?.name || 'Freelancer'}! 👋
          </h1>
          <p className="text-xs font-medium text-slate-600 mt-1 max-w-xl">
            Track your contract proposals, review active milestones, and monitor your simulated payments in one centralized dashboard.
          </p>
        </div>

        {/* Profile Completion Indicator */}
        <div className="glass-card rounded-2xl p-4 min-w-[220px] border border-white/60">
          <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
            <span className="text-slate-700">Profile Completion</span>
            <span className="text-indigo-600">{completionPercent}%</span>
          </div>
          <div className="w-full bg-slate-200/60 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            ></div>
          </div>
          <Link
            to="/freelancer/profile"
            className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mt-2 font-bold"
          >
            Update Profile Details <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Applications"
          value={analytics?.totalApplications ?? 0}
          icon={FileText}
          color="indigo"
        />
        <StatCard
          title="Pending Review"
          value={analytics?.pendingApplications ?? 0}
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Active Contracts"
          value={analytics?.activeContracts ?? 0}
          icon={Briefcase}
          color="blue"
        />
        <StatCard
          title="Completed Jobs"
          value={analytics?.completedContracts ?? 0}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Total Earnings"
          value={formatMinorUnits(analytics?.totalCompletedEarningsMinor ?? 0)}
          subtitle="Simulated demo funds"
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Pending Payments"
          value={formatMinorUnits(analytics?.pendingPaymentsMinor ?? 0)}
          subtitle="Awaiting release"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Middle Section: Earnings Trend Chart + Recommended Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings Chart */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-5 shadow-lg border border-white/70">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Earnings & Disbursement Trend</h3>
              <p className="text-xs text-slate-500">Persisted simulated payments over time</p>
            </div>
            <Link
              to="/freelancer/payments"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              View Payment Ledger
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  formatter={(val: any) => [`$${val}`, 'Disbursed']}
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(8px)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.6)', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="earnings" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorEarnings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recommended Projects based on profile */}
        <div className="glass-card rounded-3xl p-5 shadow-lg border border-white/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" /> Recommended For You
              </h3>
              <Link to="/freelancer/projects" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
                Explore All
              </Link>
            </div>

            <div className="space-y-3">
              {recommendedProjects.map((p) => (
                <div key={p._id} className="p-3 rounded-2xl glass-panel-subtle hover:border-indigo-300 transition">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{p.title}</h4>
                    <span className="text-xs font-bold text-emerald-700 font-mono shrink-0">
                      ${p.minBudget} - ${p.maxBudget}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{p.summary}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.skills.slice(0, 3).map((s, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-700 font-semibold border border-indigo-500/20">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/freelancer/projects"
            className="w-full mt-4 py-2.5 px-3 rounded-xl glass-button-primary text-white text-xs font-bold text-center transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>Search & Apply to Projects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="glass-card rounded-3xl p-5 shadow-lg border border-white/70">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Applications</h3>
            <p className="text-xs text-slate-500">Track the status of your submitted proposals</p>
          </div>
          <Link to="/freelancer/applications" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
            View All Applications
          </Link>
        </div>

        {recentApps.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No applications submitted yet. Browse open projects to submit your first proposal!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/40 text-slate-500 font-bold uppercase text-[10px] tracking-wider bg-white/20">
                  <th className="py-2.5 px-3">Project Title</th>
                  <th className="py-2.5 px-3">Hiring Company</th>
                  <th className="py-2.5 px-3">Proposed Bid</th>
                  <th className="py-2.5 px-3">Applied Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/30">
                {recentApps.map((app) => (
                  <tr key={app._id} className="hover:bg-white/40 transition">
                    <td className="py-3 px-3 font-bold text-slate-900">{app.posting?.title || 'Project'}</td>
                    <td className="py-3 px-3 text-slate-600 font-medium">{app.posting?.company?.name || 'Apex Innovations Inc.'}</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">${app.proposedAmount}</td>
                    <td className="py-3 px-3 text-slate-500">{formatDate(app.appliedDate)}</td>
                    <td className="py-3 px-3">
                      <StatusBadge status={app.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        to="/freelancer/applications"
                        className="text-indigo-600 hover:text-indigo-800 font-bold"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
