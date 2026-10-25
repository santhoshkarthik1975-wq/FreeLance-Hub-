import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const DemoPaymentBanner: React.FC = () => {
  return (
    <div className="flex items-center gap-3 p-4 bg-amber-50/90 border border-amber-200 rounded-xl text-amber-900 text-sm shadow-xs">
      <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
      <div>
        <p className="font-semibold text-amber-950">Simulated Demo Payments Environment</p>
        <p className="text-xs text-amber-800 leading-relaxed mt-0.5">
          Demo payments only — no real money is transferred. All transactions and milestone disbursements are safely recorded and persisted as simulated records with unique idempotency keys.
        </p>
      </div>
    </div>
  );
};
