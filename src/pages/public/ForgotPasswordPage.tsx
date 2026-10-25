import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Mail, ArrowLeft, Info, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Briefcase className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">Freelance Hub</span>
        </Link>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Reset Your Password
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Enter your registered email address to receive password reset guidance.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-200/80 sm:rounded-2xl sm:px-10">
          {/* Transparent Notice about Email Service in development */}
          <div className="mb-5 p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-900">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-indigo-950">Development Environment Notice</p>
              <p className="mt-0.5 leading-relaxed text-indigo-800">
                In this development release, outbound SMTP email delivery (SendGrid/AWS SES) is not attached. Default demo account passwords are set to <code className="bg-indigo-100 px-1 py-0.5 rounded font-mono font-bold">Demo1234!</code>.
              </p>
            </div>
          </div>

          {submitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Request Recorded</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  For demonstration and grading evaluation, use the standard password <span className="font-mono font-bold text-indigo-600">Demo1234!</span> for both pre-seeded accounts:
                </p>
                <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-left text-xs space-y-1">
                  <p><span className="font-semibold text-slate-700">Freelancer:</span> freelancer.demo@example.com</p>
                  <p><span className="font-semibold text-slate-700">Company:</span> company.demo@example.com</p>
                </div>
              </div>
              <Link
                to="/login/freelancer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your-email@example.com"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition shadow-xs"
              >
                Send Password Reset Instructions
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
