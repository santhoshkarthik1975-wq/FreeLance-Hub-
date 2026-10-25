import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  DollarSign,
  Calendar,
  Layers,
  Plus,
  X,
  Save,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import type { ProjectType, ExperienceLevel } from '../../types/index.ts';

export const CompanyCreatePosting: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    description: '',
    skills: ['React', 'TypeScript', 'Node.js'],
    minBudget: '3000',
    maxBudget: '5000',
    currency: 'USD',
    projectType: 'FIXED' as ProjectType,
    experienceLevel: 'INTERMEDIATE' as ExperienceLevel,
    duration: '4 weeks',
    deadline: '',
    requirements: '',
    status: 'OPEN' as 'OPEN' | 'DRAFT',
  });

  const [newSkill, setNewSkill] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const toast = useToast();
  const navigate = useNavigate();

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const s = newSkill.trim();
    if (s && !formData.skills.includes(s)) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, s] }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((sk) => sk !== skill),
    }));
  };

  const handleSubmit = async (publishStatus: 'OPEN' | 'DRAFT') => {
    setErrorMsg('');

    if (formData.title.trim().length < 5) {
      setErrorMsg('Project title must be at least 5 characters');
      return;
    }
    if (formData.summary.trim().length < 10) {
      setErrorMsg('Summary must be at least 10 characters');
      return;
    }
    if (formData.description.trim().length < 20) {
      setErrorMsg('Detailed description must be at least 20 characters');
      return;
    }
    if (formData.skills.length === 0) {
      setErrorMsg('At least one technical skill is required');
      return;
    }
    if (Number(formData.minBudget) > Number(formData.maxBudget)) {
      setErrorMsg('Minimum budget cannot exceed maximum budget');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/projects', {
        title: formData.title,
        summary: formData.summary,
        description: formData.description,
        skills: formData.skills,
        minBudget: Number(formData.minBudget),
        maxBudget: Number(formData.maxBudget),
        currency: formData.currency,
        projectType: formData.projectType,
        experienceLevel: formData.experienceLevel,
        duration: formData.duration,
        deadline: formData.deadline || undefined,
        requirements: formData.requirements || undefined,
        status: publishStatus,
      });

      toast.success(
        publishStatus === 'OPEN'
          ? 'Project published successfully to marketplace!'
          : 'Project saved as draft.'
      );
      navigate('/company/postings/active');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create project posting');
      toast.error(err.message || 'Posting creation error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-xs">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create New Project Posting</h1>
        <p className="text-xs text-slate-500 mt-1">
          Publish engineering requirements to discover qualified freelancers and receive proposals.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit('OPEN'); }} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Project Basics
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Full-Stack SaaS Analytics Dashboard in React & Node.js"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Short Summary (1-2 sentences) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Brief high-level overview displayed on marketplace cards..."
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Detailed Architecture & Scope Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={5}
                required
                placeholder="Describe project deliverables, expected architecture, API endpoints, milestone expectations..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Specific Candidate Qualifications / Requirements
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Strong experience with Recharts, React 19, and modular state management..."
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Budget & Timeline */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Budget & Timeline Specifications
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Minimum Budget ($ USD) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={formData.minBudget}
                  onChange={(e) => setFormData({ ...formData, minBudget: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Maximum Budget ($ USD) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={formData.maxBudget}
                  onChange={(e) => setFormData({ ...formData, maxBudget: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Billing Type
                </label>
                <select
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value as ProjectType })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
                >
                  <option value="FIXED">Fixed Price (Milestone Based)</option>
                  <option value="HOURLY">Hourly Engagement</option>
                </select>
              </div>
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
                  <option value="ENTRY">Entry Level</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="EXPERT">Expert</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estimated Duration <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4 weeks, 2 months"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Deadline Date
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Technical Skills */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Required Technical Skills
            </h2>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add required skill (e.g. React, TypeScript, GraphQL)..."
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

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit('DRAFT')}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition"
            >
              Save as Draft
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Publishing...' : 'Publish to Marketplace'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
