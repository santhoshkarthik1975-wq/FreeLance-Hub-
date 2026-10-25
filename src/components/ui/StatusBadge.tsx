import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const norm = (status || '').toUpperCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';

  // Green / Success
  if (['OPEN', 'ACCEPTED', 'ACTIVE', 'APPROVED', 'PAID', 'COMPLETED', 'AVAILABLE'].includes(norm)) {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium';
  }
  // Amber / Warning / In-progress
  else if (['PENDING', 'IN_PROGRESS', 'SUBMITTED', 'PROCESSING', 'BUSY'].includes(norm)) {
    styles = 'bg-amber-50 text-amber-700 border-amber-200 font-medium';
  }
  // Indigo / Purple
  else if (['FILLED', 'DRAFT'].includes(norm)) {
    styles = 'bg-indigo-50 text-indigo-700 border-indigo-200 font-medium';
  }
  // Rose / Destructive / Rejection
  else if (['REJECTED', 'CANCELLED', 'FAILED', 'DISPUTED', 'NOT_AVAILABLE'].includes(norm)) {
    styles = 'bg-rose-50 text-rose-700 border-rose-200 font-medium';
  }
  // Purple / Revision
  else if (['REVISION_REQUESTED'].includes(norm)) {
    styles = 'bg-purple-50 text-purple-700 border-purple-200 font-medium';
  }
  // Neutral / Grey
  else if (['CLOSED', 'ARCHIVED', 'WITHDRAWN'].includes(norm)) {
    styles = 'bg-slate-100 text-slate-600 border-slate-200 font-medium';
  }

  const formatLabel = (s: string) => {
    return s
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center rounded-md border tracking-wide uppercase text-[11px] font-semibold ${sizeClasses} ${styles}`}
    >
      {formatLabel(status)}
    </span>
  );
};
