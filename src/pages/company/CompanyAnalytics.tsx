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
import { BarChart3, TrendingUp, DollarSign, Users, Briefcase, FileCheck } from 'lucide-react';
import { api } from '../../services/api.ts';
import { StatCard } from '../../components/ui/StatCard.tsx';
import { formatMinorUnits } from '../../utils/formatters.ts';
import type { CompanyAnalytics } from '../../types/index.ts';

const STATUS_COLORS = ['#3b82f6', '#10b981', '#f43f5e', '#94a3b8'];

export const CompanyAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<CompanyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await api.get('/analytics/company');
        if (res.data?.data) {
          setAnalytics(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const spendingData = (analytics?.monthlySpending || []).map((item) => ({
    month: item.month,
    spending: item.amountMinor / 100,
  }));

  const pieData = (analytics?.applicationStatusDistribution || []).map((item) => ({
    name: item.status,
    value: item.count,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hiring & Spend Analytics</h1>
        <p className="text-xs text-slate-500 mt-1">
          Detailed metrics aggregated across all active and previous postings, applicant flows, and milestone disbursements.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Hiring Conversion Rate"
          value={`${analytics?.hiringConversionRate ?? 0}%`}
          subtitle="Accepted proposals / total applicants"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Total Contract Value Spent"
          value={formatMinorUnits(analytics?.totalSpentMinor ?? 0)}
          subtitle="Simulated escrow disbursements"
          icon={DollarSign}
          color="indigo"
        />
        <StatCard
          title="Total Postings Published"
          value={analytics?.totalPostings ?? 0}
          subtitle={`${analytics?.openPostings ?? 0} open, ${analytics?.filledPostings ?? 0} filled`}
          icon={Briefcase}
          color="blue"
        />
        <StatCard
          title="Total Applications Received"
          value={analytics?.totalApplications ?? 0}
          subtitle={`${analytics?.pendingReviewCount ?? 0} awaiting review`}
          icon={Users}
          color="purple"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Spending */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">Monthly Contractor Disbursements ($ USD)</h3>
            <p className="text-xs text-slate-500">Historical simulated escrow funds released</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendingData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  formatter={(val: any) => [`$${val}`, 'Spend']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="spending" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Applicant Funnel Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">Application Pipeline Distribution</h3>
            <p className="text-xs text-slate-500">Breakdown of proposals across candidate pipeline</p>
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
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
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
    </div>
  );
};
