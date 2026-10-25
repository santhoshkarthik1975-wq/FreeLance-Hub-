import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { BarChart3, TrendingUp, DollarSign, Activity, CheckCircle, Clock } from 'lucide-react';
import { api } from '../../services/api.ts';
import { StatCard } from '../../components/ui/StatCard.tsx';
import { formatMinorUnits, formatDateTime } from '../../utils/formatters.ts';
import type { FreelancerAnalytics } from '../../types/index.ts';

const COLORS = ['#f59e0b', '#10b981', '#f43f5e', '#94a3b8'];

export const FreelancerAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<FreelancerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        const res = await api.get('/analytics/freelancer');
        if (res.data?.data) {
          setAnalytics(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  const pieData = (analytics?.applicationStatusDistribution || []).map((item) => ({
    name: item.status,
    value: item.count,
  }));

  const barData = (analytics?.monthlyEarnings || []).map((item) => ({
    month: item.month,
    amount: item.amountMinor / 100,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Performance & Earnings Analytics</h1>
        <p className="text-xs text-slate-500 mt-1">
          Detailed metrics aggregated from real application and contract database records.
        </p>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Lifetime Earnings"
          value={formatMinorUnits(analytics?.totalCompletedEarningsMinor ?? 0)}
          subtitle="Simulated demo transactions"
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Approved Awaiting Pay"
          value={formatMinorUnits(analytics?.pendingPaymentsMinor ?? 0)}
          subtitle="Ready for company disbursement"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Accepted Proposals"
          value={analytics?.acceptedApplications ?? 0}
          subtitle={`Out of ${analytics?.totalApplications ?? 0} applications`}
          icon={CheckCircle}
          color="indigo"
        />
        <StatCard
          title="Active Contracts"
          value={analytics?.activeContracts ?? 0}
          subtitle="Ongoing milestone execution"
          icon={TrendingUp}
          color="blue"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Earnings Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">Monthly Completed Earnings ($ USD)</h3>
            <p className="text-xs text-slate-500">Historical simulated disbursements recorded</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  formatter={(val: any) => [`$${val}`, 'Earnings']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="amount" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Application Status Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">Application Status Distribution</h3>
            <p className="text-xs text-slate-500">Breakdown of submitted proposal outcomes</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {pieData.every((p) => p.value === 0) ? (
              <p className="text-xs text-slate-400">No applications recorded yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-600" /> Recent Marketplace Events
        </h3>
        {(!analytics?.recentActivity || analytics.recentActivity.length === 0) ? (
          <p className="text-xs text-slate-400 py-4">No recent activity events recorded.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {analytics.recentActivity.map((act) => (
              <div key={act.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-800">{act.title}</p>
                  <span className="text-[10px] text-slate-400">{act.type}</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{formatDateTime(act.date)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
