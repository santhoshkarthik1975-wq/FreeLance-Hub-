import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

export const NotFoundPage: React.FC = () => {
  const { isAuthenticated, role } = useAuth();

  const destination = !isAuthenticated ? '/' : role === 'COMPANY' ? '/company' : '/freelancer';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mb-4">
        <HelpCircle className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">404 — Page Not Found</h1>
      <p className="text-sm text-slate-600 max-w-md mt-2 mb-6 leading-relaxed">
        The page or resource you are looking for does not exist or has been moved to another section.
      </p>
      <Link
        to={destination}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Dashboard
      </Link>
    </div>
  );
};
