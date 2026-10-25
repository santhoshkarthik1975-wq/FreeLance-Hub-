import React, { useState, useEffect } from 'react';
import { Building, Globe, MapPin, Mail, User, Save, CheckCircle2, Linkedin, Twitter } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { api } from '../../services/api.ts';
import { calculateCompanyProfileCompletion } from '../../utils/formatters.ts';
import type { CompanyProfile } from '../../types/index.ts';

export const CompanyProfilePage: React.FC = () => {
  const { user, profile, refreshUser } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    companyName: '',
    logoUrl: '',
    industry: 'Technology',
    description: '',
    websiteUrl: '',
    location: '',
    companySize: '11-50 employees',
    contactName: '',
    publicEmail: '',
    socialLinks: {
      linkedin: '',
      twitter: '',
    },
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      const p = profile as CompanyProfile;
      setFormData({
        companyName: p.companyName || user?.name || '',
        logoUrl: p.logoUrl || '',
        industry: p.industry || 'Technology',
        description: p.description || '',
        websiteUrl: p.websiteUrl || '',
        location: p.location || '',
        companySize: p.companySize || '11-50 employees',
        contactName: p.contactName || '',
        publicEmail: p.publicEmail || user?.email || '',
        socialLinks: {
          linkedin: p.socialLinks?.linkedin || '',
          twitter: p.socialLinks?.twitter || '',
        },
      });
    }
  }, [profile, user]);

  const completionScore = calculateCompanyProfileCompletion(formData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/profiles/company/me', formData);
      toast.success('Company profile updated successfully!');
      await refreshUser();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update company profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-xs">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 text-2xl font-bold overflow-hidden shrink-0">
            {formData.logoUrl ? (
              <img
                src={formData.logoUrl}
                alt="Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <Building className="w-8 h-8 text-indigo-600" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{formData.companyName || 'Company Name'}</h1>
            <p className="text-xs text-slate-500 font-mono">{formData.publicEmail}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {formData.industry}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-600">{formData.companySize}</span>
            </div>
          </div>
        </div>

        {/* Completion Bar */}
        <div className="bg-slate-50 border border-slate-200/70 p-3.5 rounded-xl w-full sm:w-60">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="font-semibold text-slate-700">Company Strength</span>
            <span className="font-bold text-indigo-600">{completionScore}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionScore}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Complete company bio & website to attract top-tier freelancers.
          </p>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Company Identity & Location
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Industry Sector
              </label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
              >
                <option value="Technology">Technology & Software</option>
                <option value="FinTech">FinTech & Cloud Systems</option>
                <option value="E-Commerce">E-Commerce & Retail</option>
                <option value="Design">Digital Design & Mobile</option>
                <option value="Healthcare">Healthcare & BioTech</option>
                <option value="Other">Other Industry</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              About the Company / Mission
            </label>
            <textarea
              rows={4}
              placeholder="Describe your company culture, product mission, and typical engineering stack..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Website URL
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="url"
                  placeholder="https://company.io"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                HQ Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. San Francisco, CA"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company Size
              </label>
              <select
                value={formData.companySize}
                onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
              >
                <option value="1-10 employees">1-10 employees</option>
                <option value="11-50 employees">11-50 employees</option>
                <option value="51-200 employees">51-200 employees</option>
                <option value="201-500 employees">201-500 employees</option>
                <option value="500+ employees">500+ enterprise</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Person Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Public Inquiries Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={formData.publicEmail}
                  onChange={(e) => setFormData({ ...formData, publicEmail: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Company Logo Image URL
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono"
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Social & Brand Profiles
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                LinkedIn Company Page
              </label>
              <div className="relative">
                <Linkedin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="url"
                  placeholder="https://linkedin.com/company/apex-innovations"
                  value={formData.socialLinks.linkedin}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, linkedin: e.target.value },
                    })
                  }
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Twitter / X Profile
              </label>
              <div className="relative">
                <Twitter className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="url"
                  placeholder="https://twitter.com/apex_demo"
                  value={formData.socialLinks.twitter}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, twitter: e.target.value },
                    })
                  }
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Company Details'}
          </button>
        </div>
      </form>
    </div>
  );
};
