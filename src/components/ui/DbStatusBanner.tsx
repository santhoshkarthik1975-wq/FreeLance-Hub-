import React from 'react';
import { Database, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

export const DbStatusBanner: React.FC = () => {
  const { dbStatus } = useAuth();

  if (!dbStatus) return null;

  const isMongo = dbStatus.type === 'mongodb';

  return (
    <div className="bg-slate-900 text-slate-200 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
      <div className="flex items-center gap-2">
        <Database className="w-3.5 h-3.5 text-indigo-400" />
        <span className="font-semibold text-slate-100">Database Engine:</span>
        {isMongo ? (
          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
            <CheckCircle2 className="w-3 h-3" /> MongoDB Connected (Local/Remote)
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-indigo-300 font-medium">
            Cloud Preview Mode (Embedded Store) • Local MongoDB ready: <code className="bg-slate-800 px-1 py-0.5 rounded text-[11px] text-indigo-200">mongodb://127.0.0.1:27017/freelance_hub</code>
          </span>
        )}
      </div>
      <div className="text-[11px] text-slate-400">
        Demo Credentials: <span className="text-slate-200 font-mono">company.demo@example.com</span> / <span className="text-slate-200 font-mono">freelancer.demo@example.com</span> (Password: <span className="text-slate-200 font-mono">Demo1234!</span>)
      </div>
    </div>
  );
};
