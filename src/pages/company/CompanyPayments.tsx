import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { DemoPaymentBanner } from '../../components/ui/DemoPaymentBanner.tsx';
import { StatCard } from '../../components/ui/StatCard.tsx';
import { StatusBadge } from '../../components/ui/StatusBadge.tsx';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { formatMinorUnits, formatDateTime } from '../../utils/formatters.ts';
import type { Payment, Contract, Milestone, CompanyAnalytics } from '../../types/index.ts';

export const CompanyPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [activeContracts, setActiveContracts] = useState<Contract[]>([]);
  const [analytics, setAnalytics] = useState<CompanyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [payingMilestoneId, setPayingMilestoneId] = useState<string | null>(null);

  const toast = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [payRes, contRes, anRes] = await Promise.all([
        api.get('/payments'),
        api.get('/company/contracts'),
        api.get('/analytics/company'),
      ]);

      if (payRes.data?.data) setPayments(payRes.data.data);
      if (contRes.data?.data?.active) setActiveContracts(contRes.data.data.active);
      if (anRes.data?.data) setAnalytics(anRes.data.data);
    } catch (err: any) {
      toast.error('Failed to load payments ledger: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Collect all approved milestones ready for demo payment
  const payableMilestones: { contract: Contract; milestone: Milestone }[] = [];
  activeContracts.forEach((c) => {
    (c.milestones || []).forEach((m) => {
      if (m.status === 'APPROVED') {
        payableMilestones.push({ contract: c, milestone: m });
      }
    });
  });

  const handlePayMilestone = async (milestone: Milestone, contract: Contract) => {
    const formattedAmt = formatMinorUnits(milestone.amount, milestone.currency);
    if (
      !confirm(
        `Record simulated demo payment of ${formattedAmt} to ${contract.freelancerName || 'freelancer'} for "${milestone.title}"?`
      )
    ) {
      return;
    }

    setPayingMilestoneId(milestone._id);
    try {
      // Safe client idempotency key
      const idempotencyKey = `idemp_company_${milestone._id}_${Date.now()}`;
      const res = await api.post(`/milestones/${milestone._id}/pay`, {
        idempotencyKey,
      });

      toast.success(
        `✅ Simulated demo payment recorded! ${formattedAmt} credited to contractor ledger.`
      );
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Payment recording failed');
    } finally {
      setPayingMilestoneId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Contractor Disbursements & Escrow</h1>
        <p className="text-xs text-slate-500 mt-1">
          Release simulated demo payments for approved milestones and inspect the persistent financial ledger.
        </p>
      </div>

      {/* Safety Notice */}
      <DemoPaymentBanner />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Contract Funds Disbursed"
          value={formatMinorUnits(analytics?.totalSpentMinor ?? 0)}
          subtitle="Completed simulated disbursements"
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Approved Awaiting Payment"
          value={payableMilestones.length}
          subtitle={`${payableMilestones.length} milestone ready to disburse`}
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Total Ledger Records"
          value={payments.length}
          subtitle="Idempotent payment transactions"
          icon={CheckCircle2}
          color="indigo"
        />
      </div>

      {/* Actionable Approved Milestones Section */}
      {payableMilestones.length > 0 && (
        <div className="bg-amber-50/60 rounded-2xl border border-amber-200/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-amber-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" /> Approved Milestones Ready for Disbursement ({payableMilestones.length})
              </h2>
              <p className="text-xs text-amber-800">
                These deliverables have been approved and are awaiting your demo simulated payment release.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {payableMilestones.map(({ contract, milestone }) => (
              <div
                key={milestone._id}
                className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    {contract.contractTitle} • Contractor: {contract.freelancerName}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm mt-0.5">{milestone.title}</h4>
                  <p className="text-slate-500 text-[11px]">{milestone.description}</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-base font-mono font-bold text-emerald-700">
                    {formatMinorUnits(milestone.amount, milestone.currency)}
                  </span>

                  <button
                    onClick={() => handlePayMilestone(milestone, contract)}
                    disabled={payingMilestoneId === milestone._id}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>
                      {payingMilestoneId === milestone._id
                        ? 'Recording...'
                        : 'Release Demo Payment'}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Persisted Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Historical Disbursement Ledger</h2>
            <p className="text-xs text-slate-500">Persisted demo payment records</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">{payments.length} Records</span>
        </div>

        {loading ? (
          <SkeletonLoader rows={3} />
        ) : payments.length === 0 ? (
          <EmptyState
            title="No Payment Records Recorded"
            description="When you disburse payments for approved contractor milestones, the records will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider bg-slate-50/70">
                  <th className="py-3 px-4">Contract Reference</th>
                  <th className="py-3 px-4">Milestone</th>
                  <th className="py-3 px-4">Contractor</th>
                  <th className="py-3 px-4">Amount</th>
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
                      {p.freelancerName}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-sm">
                      {formatMinorUnits(p.amount, p.currency)}
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
