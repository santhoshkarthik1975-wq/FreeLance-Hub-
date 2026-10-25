import React from 'react';

export const SkeletonLoader: React.FC<{ rows?: number }> = ({ rows = 3 }) => {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200/80 p-5 space-y-3">
          <div className="flex justify-between items-center">
            <div className="h-5 bg-slate-200 rounded w-1/3"></div>
            <div className="h-5 bg-slate-200 rounded w-16"></div>
          </div>
          <div className="h-4 bg-slate-100 rounded w-full"></div>
          <div className="h-4 bg-slate-100 rounded w-2/3"></div>
          <div className="pt-2 flex gap-2">
            <div className="h-6 bg-slate-200 rounded w-20"></div>
            <div className="h-6 bg-slate-200 rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
