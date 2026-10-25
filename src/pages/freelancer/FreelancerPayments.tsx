import React, { useState, useEffect } from 'react';
import { DollarSign, CreditCard, ShieldCheck, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { DemoPaymentBanner } from '../../components/ui/DemoPaymentBanner.tsx';
import { StatCard } from '../../components/ui/StatCard.tsx';
import { StatusBadge } from '../../components/ui/StatusBadge.tsx';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { formatMinorUnits, formatDateTime } from '../../utils/formatters.ts';
import type { Payment, FreelancerAnalytics } from '../../types/index.ts';

export const FreelancerPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [analytics, setAnalytics] = useState<FreelancerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const toast = useToast();

  useEffect(() => {
    async function loadPaymentsData() {
      try {
        setLoading(true);
        const [payRes, anRes] = await Promise.all([
          api.get('/payments'),
          api.get('/analytics/freelancer'),
        ]);
        if (payRes.data?.data) setPayments(payRes.data.data);
        if (anRes.data?.data) setAnalytics(anRes.data.data);
      } catch (err: any) {
        toast.error('Failed to load payments: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadPaymentsData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Earnings & Payment Records</h1>
        <p className="text-xs text-slate-500 mt-1">
          Historical record of all simulated milestone disbursements and pending contract receivables.
        </p>
      </div>

      {/* Mandatory Demo Payments Safety Banner */}
      <DemoPaymentBanner />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Disbursed to Date"
          value={formatMinorUnits(analytics?.totalCompletedEarningsMinor ?? 0)}
          subtitle="Completed simulated disbursements"
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Pending Receivables"
          value={formatMinorUnits(analytics?.pendingPaymentsMinor ?? 0)}
          subtitle="Approved deliverables awaiting release"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Verified Transactions"
          value={payments.length}
          subtitle="Idempotent ledger entries"
          icon={CheckCircle2}
          color="indigo"
        />
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Persisted Disbursement Ledger</h2>
            <p className="text-xs text-slate-500">Every disbursement is assigned a unique idempotency key</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">{payments.length} Records</span>
        </div>

        {loading ? (
          <SkeletonLoader rows={3} />
        ) : payments.length === 0 ? (
          <EmptyState
            title="No Payment Records Yet"
            description="When a company approves your milestones and initiates simulated demo disbursement, your records will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider bg-slate-50/70">
                  <th className="py-3 px-4">Contract Reference</th>
                  <th className="py-3 px-4">Milestone</th>
                  <th className="py-3 px-4">Payer Company</th>
                  <th className="py-3 px-4">Disbursed Amount</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Settled Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs truncate">
                      {p.contractTitle}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {p.milestoneTitle}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {p.companyName}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 text-sm">
                      +{formatMinorUnits(p.amount, p.currency)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                        {p.provider}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={p.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500 font-mono text-[11px]">
                      {formatDateTime(p.completedDate || p.createdAt)}
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
