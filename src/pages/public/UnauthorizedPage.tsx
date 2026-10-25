import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

export const UnauthorizedPage: React.FC = () => {
  const { role } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-4">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Access Restricted</h1>
      <p className="text-sm text-slate-600 max-w-md mt-2 mb-6 leading-relaxed">
        You do not have permission to access this workspace section. The page you requested requires specific role authorization.
      </p>
      <div className="flex gap-3">
        <Link
          to={role === 'FREELANCER' ? '/freelancer' : role === 'COMPANY' ? '/company' : '/'}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
        >
          <ArrowLeft className="w-4 h-4" /> Go to Your Workspace
        </Link>
      </div>
    </div>
  );
};
