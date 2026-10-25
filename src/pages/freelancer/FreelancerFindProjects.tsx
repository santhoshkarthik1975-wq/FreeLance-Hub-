import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  DollarSign,
  Clock,
  Briefcase,
  Building,
  CheckCircle2,
  X,
  Send,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { StatusBadge } from '../../components/ui/StatusBadge.tsx';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { formatDate } from '../../utils/formatters.ts';
import type { ProjectPosting, Application } from '../../types/index.ts';

export const FreelancerFindProjects: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [projects, setProjects] = useState<ProjectPosting[]>([]);
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Modals
  const [selectedProject, setSelectedProject] = useState<ProjectPosting | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Form state
  const [applyForm, setApplyForm] = useState({
    coverLetter: '',
    proposedAmount: '',
    estimatedDuration: '3 weeks',
    portfolioUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchProjectsAndApps = async () => {
    try {
      setLoading(true);
      const [projRes, appRes] = await Promise.all([
        api.get('/projects?status=OPEN'),
        api.get('/freelancer/applications'),
      ]);
      if (projRes.data?.data) setProjects(projRes.data.data);
      if (appRes.data?.data) setMyApplications(appRes.data.data);
    } catch (err: any) {
      toast.error('Failed to load project marketplace: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectsAndApps();
  }, []);

  // Set of posting IDs already applied to
  const appliedPostingIds = useMemo(() => {
    return new Set(myApplications.map((a) => a.postingId));
  }, [myApplications]);

  // Unique skills across all projects for quick filtering
  const allSkills = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => p.skills.forEach((s) => set.add(s)));
    return Array.from(set);
  }, [projects]);

  // Client-side filtering & sorting
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        if (search) {
          const q = search.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchSum = p.summary.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          if (!matchTitle && !matchSum && !matchDesc) return false;
        }
        if (selectedSkill) {
          if (!p.skills.some((s) => s.toLowerCase() === selectedSkill.toLowerCase())) return false;
        }
        if (experienceLevel && p.experienceLevel !== experienceLevel) {
          return false;
        }
        if (minBudget && p.maxBudget < Number(minBudget)) {
          return false;
        }
        if (maxBudget && p.minBudget > Number(maxBudget)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'budget-desc') return b.maxBudget - a.maxBudget;
        if (sortBy === 'budget-asc') return a.minBudget - b.minBudget;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [projects, search, selectedSkill, experienceLevel, minBudget, maxBudget, sortBy]);

  const handleOpenApply = (p: ProjectPosting) => {
    setSelectedProject(p);
    setApplyForm({
      coverLetter: '',
      proposedAmount: String(p.maxBudget || p.minBudget || 3000),
      estimatedDuration: p.duration || '3 weeks',
      portfolioUrl: '',
    });
    setFormError('');
    setShowApplyModal(true);
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    if (applyForm.coverLetter.trim().length < 20) {
      setFormError('Please write a detailed cover letter (minimum 20 characters).');
      return;
    }
    if (Number(applyForm.proposedAmount) <= 0) {
      setFormError('Proposed bid amount must be greater than $0.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      await api.post(`/projects/${selectedProject._id}/applications`, {
        coverLetter: applyForm.coverLetter,
        proposedAmount: Number(applyForm.proposedAmount),
        currency: selectedProject.currency || 'USD',
        estimatedDuration: applyForm.estimatedDuration,
        portfolioUrl: applyForm.portfolioUrl || undefined,
      });

      toast.success('Your proposal was successfully submitted to the company!');
      setShowApplyModal(false);
      setSelectedProject(null);
      // Refresh applications list to lock the apply button
      await fetchProjectsAndApps();
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit application.');
      toast.error(err.message || 'Submission error');
    } finally {
      setSubmitting(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedSkill('');
    setExperienceLevel('');
    setMinBudget('');
    setMaxBudget('');
    setSortBy('newest');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Discover Client Projects</h1>
        <p className="text-xs text-slate-500 mt-1">
          Explore open marketplace postings, filter by required stack, and submit high-impact proposals.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keywords, title, or architecture specs..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Skill Filter Dropdown */}
          <div className="w-full md:w-48">
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white text-slate-700"
            >
              <option value="">All Tech Skills</option>
              {allSkills.map((sk) => (
                <option key={sk} value={sk}>
                  {sk}
                </option>
              ))}
            </select>
          </div>

          {/* Experience Filter */}
          <div className="w-full md:w-44">
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white text-slate-700"
            >
              <option value="">Any Experience</option>
              <option value="ENTRY">Entry Level</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="EXPERT">Expert Level</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="w-full md:w-44">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white text-slate-700 font-medium"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="budget-desc">Sort: Budget (High to Low)</option>
              <option value="budget-asc">Sort: Budget (Low to High)</option>
            </select>
          </div>
        </div>

        {/* Secondary Budget Inputs + Clear Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Budget Range ($):</span>
            <input
              type="number"
              placeholder="Min $"
              value={minBudget}
              onChange={(e) => setMinBudget(e.target.value)}
              className="w-20 px-2.5 py-1 text-xs border border-slate-200 rounded-md focus:outline-hidden"
            />
            <span className="text-slate-400">—</span>
            <input
              type="number"
              placeholder="Max $"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              className="w-20 px-2.5 py-1 text-xs border border-slate-200 rounded-md focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-semibold">{filteredProjects.length} projects found</span>
            {(search || selectedSkill || experienceLevel || minBudget || maxBudget || sortBy !== 'newest') && (
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Projects List */}
      {loading ? (
        <SkeletonLoader rows={4} />
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          title="No Matching Projects Found"
          description="Try broadening your search keywords or resetting your budget and skill filters."
          actionLabel="Reset All Filters"
          onAction={clearFilters}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredProjects.map((project) => {
            const hasApplied = appliedPostingIds.has(project._id);

            return (
              <div
                key={project._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={project.status} size="sm" />
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      {project.company?.name || 'Apex Innovations Inc.'}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-400">
                      Posted {formatDate(project.createdAt)}
                    </span>
                    {hasApplied && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Already Applied
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{project.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed max-w-3xl">
                    {project.summary}
                  </p>

                  {/* Skills badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right side: Budget, duration, and action buttons */}
                <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <p className="text-base font-bold text-slate-900 font-mono">
                      ${project.minBudget.toLocaleString()} – ${project.maxBudget.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {project.projectType} • {project.duration}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedProject(project)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      View Details
                    </button>

                    {hasApplied ? (
                      <button
                        disabled
                        className="px-3.5 py-1.5 rounded-lg bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed"
                      >
                        Applied
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenApply(project)}
                        className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-xs"
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project Details Modal */}
      {selectedProject && !showApplyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start gap-3 border-b border-slate-100 pb-4">
              <div>
                <StatusBadge status={selectedProject.status} size="sm" />
                <h2 className="text-lg font-bold text-slate-900 mt-2">{selectedProject.title}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Posted by {selectedProject.company?.name || 'Company'} on {formatDate(selectedProject.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold">Budget Range</span>
                  <p className="font-mono font-bold text-slate-900 mt-0.5">
                    ${selectedProject.minBudget} – ${selectedProject.maxBudget}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold">Project Type</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{selectedProject.projectType}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold">Experience</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{selectedProject.experienceLevel}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold">Duration</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{selectedProject.duration}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">Project Summary</h4>
                <p className="text-slate-600 leading-relaxed">{selectedProject.summary}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">Detailed Description</h4>
                <div className="text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                  {selectedProject.description}
                </div>
              </div>

              {selectedProject.requirements && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Key Requirements</h4>
                  <p className="text-slate-600 leading-relaxed">{selectedProject.requirements}</p>
                </div>
              )}

              <div>
                <h4 className="font-bold text-slate-900 mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProject.skills.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              {appliedPostingIds.has(selectedProject._id) ? (
                <button
                  disabled
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed"
                >
                  ✓ Already Applied
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleOpenApply(selectedProject);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                >
                  Submit Proposal
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submit Proposal Modal */}
      {showApplyModal && selectedProject && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">Submit Proposal</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{selectedProject.title}</h3>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleApplySubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Proposed Bid Amount ($ USD) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    required
                    min={1}
                    value={applyForm.proposedAmount}
                    onChange={(e) => setApplyForm({ ...applyForm, proposedAmount: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono font-bold"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Client posted budget range: ${selectedProject.minBudget} – ${selectedProject.maxBudget}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estimated Delivery Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={applyForm.estimatedDuration}
                  onChange={(e) => setApplyForm({ ...applyForm, estimatedDuration: e.target.value })}
                  placeholder="e.g. 3 weeks, 1 month"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cover Letter & Technical Approach <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={applyForm.coverLetter}
                  onChange={(e) => setApplyForm({ ...applyForm, coverLetter: e.target.value })}
                  placeholder="Explain your technical qualification, previous work with these technologies, and roadmap for delivery..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Relevant Work / Portfolio URL <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="url"
                  value={applyForm.portfolioUrl}
                  onChange={(e) => setApplyForm({ ...applyForm, portfolioUrl: e.target.value })}
                  placeholder="https://github.com/myusername/project"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? 'Submitting...' : 'Send Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
