import React, { useState, useEffect } from 'react';
import {
  User,
  Briefcase,
  MapPin,
  DollarSign,
  Globe,
  Github,
  Linkedin,
  Save,
  CheckCircle2,
  Plus,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { api } from '../../services/api.ts';
import { calculateFreelancerProfileCompletion } from '../../utils/formatters.ts';
import type { FreelancerProfile, ExperienceLevel, AvailabilityStatus } from '../../types/index.ts';

export const FreelancerProfilePage: React.FC = () => {
  const { user, profile, refreshUser } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    headline: '',
    biography: '',
    skills: [] as string[],
    experienceLevel: 'INTERMEDIATE' as ExperienceLevel,
    yearsOfExperience: 3,
    hourlyRate: 50,
    currency: 'USD',
    location: '',
    portfolioUrl: '',
    githubUrl: '',
    linkedinUrl: '',
    profileImageUrl: '',
    availability: 'AVAILABLE' as AvailabilityStatus,
    languages: ['English'],
  });

  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      const p = profile as FreelancerProfile;
      setFormData({
        headline: p.headline || '',
        biography: p.biography || '',
        skills: p.skills || [],
        experienceLevel: p.experienceLevel || 'INTERMEDIATE',
        yearsOfExperience: p.yearsOfExperience || 1,
        hourlyRate: p.hourlyRate || 35,
        currency: p.currency || 'USD',
        location: p.location || '',
        portfolioUrl: p.portfolioUrl || '',
        githubUrl: p.githubUrl || '',
        linkedinUrl: p.linkedinUrl || '',
        profileImageUrl: p.profileImageUrl || '',
        availability: p.availability || 'AVAILABLE',
        languages: p.languages || ['English'],
      });
    }
  }, [profile]);

  const completionScore = calculateFreelancerProfileCompletion(formData);

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = newSkill.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/profiles/freelancer/me', formData);
      toast.success('Your professional profile has been updated!');
      await refreshUser();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Completion Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 text-2xl font-bold overflow-hidden shrink-0">
            {formData.profileImageUrl ? (
              <img
                src={formData.profileImageUrl}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              user?.name?.charAt(0).toUpperCase() || 'A'
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{user?.name}</h1>
            <p className="text-xs text-slate-500 font-mono">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {formData.availability}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-700 font-mono">
                ${formData.hourlyRate}/hr
              </span>
            </div>
          </div>
        </div>

        {/* Live Completion Bar */}
        <div className="bg-slate-50 border border-slate-200/70 p-3.5 rounded-xl w-full sm:w-60">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="font-semibold text-slate-700">Profile Strength</span>
            <span className="font-bold text-indigo-600">{completionScore}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionScore}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {completionScore >= 80 ? '✓ Ready to attract enterprise clients' : 'Fill in portfolio & skills to reach 100%'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6 text-xs">
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            General Professional Information
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Professional Headline <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Senior Full Stack TypeScript & Cloud Architect"
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Professional Biography & Value Proposition
            </label>
            <textarea
              rows={4}
              placeholder="Summarize your engineering background, favorite technologies, and architectural experience..."
              value={formData.biography}
              onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Experience Level
              </label>
              <select
                value={formData.experienceLevel}
                onChange={(e) =>
                  setFormData({ ...formData, experienceLevel: e.target.value as ExperienceLevel })
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
              >
                <option value="ENTRY">Entry Level (0-2 yrs)</option>
                <option value="INTERMEDIATE">Intermediate (2-5 yrs)</option>
                <option value="EXPERT">Expert (5+ yrs)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Years of Experience
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={formData.yearsOfExperience}
                onChange={(e) =>
                  setFormData({ ...formData, yearsOfExperience: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hourly Rate ($ USD)
              </label>
              <input
                type="number"
                min={5}
                max={1000}
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Location / Timezone
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. Seattle, WA (Remote)"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Availability Status
              </label>
              <select
                value={formData.availability}
                onChange={(e) =>
                  setFormData({ ...formData, availability: e.target.value as AvailabilityStatus })
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
              >
                <option value="AVAILABLE">Available for Work</option>
                <option value="BUSY">Currently Busy</option>
                <option value="NOT_AVAILABLE">Not Available</option>
              </select>
            </div>
          </div>
        </div>

        {/* Skills Tag Management */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Technical Skills & Badges
          </h2>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add skill (e.g. React, PostgreSQL, Docker, Redis)..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={handleAddSkill}
              className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {formData.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-indigo-400 hover:text-indigo-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Portfolio & Social URLs */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Portfolio, GitHub & Verified Profiles
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Portfolio Website URL
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="url"
                  placeholder="https://portfolio.demo.dev"
                  value={formData.portfolioUrl}
                  onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                GitHub Profile URL
              </label>
              <div className="relative">
                <Github className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="url"
                  placeholder="https://github.com/myusername"
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                LinkedIn Profile URL
              </label>
              <div className="relative">
                <Linkedin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/myusername"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Profile Image Web URL
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={formData.profileImageUrl}
                onChange={(e) => setFormData({ ...formData, profileImageUrl: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Changes...' : 'Save Profile Details'}
          </button>
        </div>
      </form>
    </div>
  );
};
