import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Eye, EyeOff, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { AmbientGlassBackground } from '../../components/ui/AmbientGlassBackground.tsx';

export const LoginFreelancerPage: React.FC = () => {
  const [email, setEmail] = useState('freelancer.demo@example.com');
  const [password, setPassword] = useState('Demo1234!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role !== 'FREELANCER') {
        setErrorMsg('This account is registered as a Company. Please use the Company login portal.');
        toast.error('This account belongs to a Company workspace.');
        setLoading(false);
        return;
      }
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/freelancer');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
      toast.error(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemo = () => {
    setEmail('freelancer.demo@example.com');
    setPassword('Demo1234!');
  };

  return (
    <div className="relative min-h-screen bg-slate-900/10 flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden">
      <AmbientGlassBackground />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500/90 to-purple-600/90 p-[1px] shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-[15px] bg-slate-900/20 backdrop-blur-sm flex items-center justify-center text-white">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">Freelance Hub</span>
        </Link>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          Freelancer Portal
        </h2>
        <p className="mt-1 text-xs font-medium text-slate-600">
          Access your projects, proposals, active milestones, and earnings.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="glass-panel py-8 px-6 shadow-2xl shadow-indigo-900/10 border border-white/70 sm:rounded-3xl sm:px-10">
          {/* Quick Demo Autofill Notice */}
          <div className="mb-5 p-3 rounded-2xl glass-panel-subtle border border-indigo-200/50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-indigo-950 font-semibold">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Demo credentials ready</span>
            </div>
            <button
              type="button"
              onClick={handleUseDemo}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline"
            >
              Reset
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-300/40 text-xs text-rose-800 font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="freelancer.demo@example.com"
                  className="glass-input w-full pl-10 pr-3 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-800">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="glass-input w-full pl-10 pr-10 py-2.5 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="glass-button-primary w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-bold text-sm shadow-md shadow-indigo-500/25 disabled:opacity-50 active:scale-[0.98] transition"
            >
              {loading ? 'Authenticating...' : 'Sign In as Freelancer'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 border-t border-white/50 pt-4 text-center space-y-2">
            <p className="text-xs text-slate-600">
              Don't have a freelancer profile?{' '}
              <Link to="/register/freelancer" className="font-bold text-indigo-600 hover:text-indigo-800">
                Register as Freelancer
              </Link>
            </p>
            <p className="text-xs text-slate-500">
              Are you a client?{' '}
              <Link to="/login/company" className="font-bold text-slate-800 hover:text-indigo-600 underline">
                Go to Company Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
