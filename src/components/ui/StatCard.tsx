import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  color?: 'indigo' | 'emerald' | 'amber' | 'blue' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'indigo',
}) => {
  const colorMap = {
    indigo: 'bg-indigo-50/80 text-indigo-600 border-indigo-200/60 shadow-indigo-500/10',
    emerald: 'bg-emerald-50/80 text-emerald-600 border-emerald-200/60 shadow-emerald-500/10',
    amber: 'bg-amber-50/80 text-amber-600 border-amber-200/60 shadow-amber-500/10',
    blue: 'bg-blue-50/80 text-blue-600 border-blue-200/60 shadow-blue-500/10',
    purple: 'bg-purple-50/80 text-purple-600 border-purple-200/60 shadow-purple-500/10',
  };

  return (
    <div className="glass-card rounded-2xl p-5 relative overflow-hidden group">
      {/* Subtle specular top highlight */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />

      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{title}</span>
        <div className={`p-2.5 rounded-xl border ${colorMap[color]} shadow-sm group-hover:scale-105 transition-transform`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-extrabold tracking-tight text-slate-900">{value}</span>
        {trend && (
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50/90 border border-emerald-200/60 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>

      {subtitle && <p className="mt-1 text-xs text-slate-500 font-medium">{subtitle}</p>}
    </div>
  );
};
