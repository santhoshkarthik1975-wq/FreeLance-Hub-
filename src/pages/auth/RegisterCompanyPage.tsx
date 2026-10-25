import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building, Eye, EyeOff, Lock, Mail, User, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { AmbientGlassBackground } from '../../components/ui/AmbientGlassBackground.tsx';

export const RegisterCompanyPage: React.FC = () => {
  const [formData, setFormData] = useState({
    contactName: '',
    email: '',
    companyName: '',
    password: '',
    confirmPassword: '',
    industry: 'Technology',
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { registerCompany } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    if (!formData.agreeToTerms) {
      setErrorMsg('You must agree to the Terms of Service to create a company account');
      return;
    }

    setLoading(true);
    try {
      await registerCompany({
        contactName: formData.contactName,
        email: formData.email,
        companyName: formData.companyName,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        industry: formData.industry,
        agreeToTerms: formData.agreeToTerms,
      });

      toast.success('Company workspace registered successfully!');
      navigate('/company');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
      toast.error(err.message || 'Registration error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-900/10 flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden">
      <AmbientGlassBackground />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500/90 to-purple-600/90 p-[1px] shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-[15px] bg-slate-900/20 backdrop-blur-sm flex items-center justify-center text-white">
              <Building className="w-5 h-5 text-white" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">Freelance Hub</span>
        </Link>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          Register Company
        </h2>
        <p className="mt-1 text-xs font-medium text-slate-600">
          Publish engineering projects and collaborate with verified contractors.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg relative z-10 px-4 sm:px-0">
        <div className="glass-panel py-8 px-6 shadow-2xl shadow-indigo-900/10 border border-white/70 sm:rounded-3xl sm:px-10">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-300/40 text-xs text-rose-800 font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Company Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Building className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="e.g. Apex Innovations Inc."
                  className="glass-input w-full pl-10 pr-3 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Contact Person Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  placeholder="e.g. David Vance"
                  className="glass-input w-full pl-10 pr-3 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Work Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="david@apex-innovations.io"
                  className="glass-input w-full pl-10 pr-3 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Industry Sector
              </label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="glass-input w-full px-3.5 py-2.5 text-sm bg-white/60"
              >
                <option value="Technology">Technology & Software</option>
                <option value="FinTech">FinTech & Banking</option>
                <option value="E-Commerce">E-Commerce & Retail</option>
                <option value="Healthcare">Healthcare & BioTech</option>
                <option value="Design">Creative Agency & Design</option>
                <option value="Other">Other Industry</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min 6 characters"
                  className="glass-input w-full px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Repeat password"
                  className="glass-input w-full px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showPassword ? 'Hide Passwords' : 'Show Passwords'}
              </button>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="terms-company"
                checked={formData.agreeToTerms}
                onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="terms-company" className="text-xs text-slate-600 font-medium">
                I agree to the <span className="text-indigo-600 font-bold">Terms of Service</span> and client agreement.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="glass-button-primary w-full mt-2 py-3 px-4 rounded-xl text-white font-bold text-sm shadow-md shadow-indigo-500/25 disabled:opacity-50 active:scale-[0.98] transition"
            >
              {loading ? 'Registering...' : 'Register Company Account'}
            </button>
          </form>

          <div className="mt-6 border-t border-white/50 pt-4 text-center">
            <p className="text-xs text-slate-600 font-medium">
              Already have a company account?{' '}
              <Link to="/login/company" className="font-bold text-indigo-600 hover:text-indigo-800">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
