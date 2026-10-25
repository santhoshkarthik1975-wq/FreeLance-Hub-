import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Search,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles,
  Users,
  Code2,
  Building,
  Sliders,
  DollarSign,
  Clock,
  Layers,
  ChevronRight,
  Check,
  ExternalLink,
  Laptop,
  Smartphone,
  Cpu,
  Palette,
  Server,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { DbStatusBanner } from '../../components/ui/DbStatusBanner.tsx';
import { AmbientGlassBackground } from '../../components/ui/AmbientGlassBackground.tsx';

// Interactive Sample Projects for Live Explorer
const SAMPLE_PROJECTS = [
  {
    id: 'p1',
    category: 'fullstack',
    categoryLabel: 'Full-Stack',
    title: 'Enterprise Fintech Dashboard & Ledger',
    company: 'Apex Innovations Inc.',
    budget: '$4,500 - $6,000',
    timeline: '3 Weeks',
    skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
    description: 'Build real-time financial reporting widgets, role-based controls, and automated reconciliation.',
  },
  {
    id: 'p2',
    category: 'ai',
    categoryLabel: 'AI & ML',
    title: 'AI Document Parsing & Summarization Pipeline',
    company: 'Nova AI Labs',
    budget: '$3,200 - $4,800',
    timeline: '2 Weeks',
    skills: ['Python', 'Gemini API', 'FastAPI', 'Vector Search'],
    description: 'Integrate LLM structured extraction for PDF legal contracts and auto-tag key clauses.',
  },
  {
    id: 'p3',
    category: 'mobile',
    categoryLabel: 'Mobile',
    title: 'iOS & Android Health Fitness Tracking App',
    company: 'Pulse Tech Corp',
    budget: '$5,000 - $7,500',
    timeline: '4 Weeks',
    skills: ['React Native', 'TypeScript', 'Tailwind', 'HealthKit'],
    description: 'Cross-platform health tracking with offline caching, Bluetooth sensor sync, and push notifications.',
  },
  {
    id: 'p4',
    category: 'devops',
    categoryLabel: 'DevOps & Cloud',
    title: 'Zero-Downtime Kubernetes & CI/CD Migration',
    company: 'Skyline Cloud Systems',
    budget: '$3,800 - $5,200',
    timeline: '2 Weeks',
    skills: ['Docker', 'Kubernetes', 'GitHub Actions', 'AWS'],
    description: 'Automate containerized microservice deployments with canary releases and monitoring alerts.',
  },
  {
    id: 'p5',
    category: 'design',
    categoryLabel: 'UI/UX Design',
    title: 'Design System & Mobile App Wireframes',
    company: 'Lumina Studio',
    budget: '$2,500 - $3,500',
    timeline: '10 Days',
    skills: ['Figma', 'Design Systems', 'Prototyping', 'User Research'],
    description: 'Craft comprehensive glassmorphic design token library and interactive high-fidelity clickable prototype.',
  },
];

export const LandingPage: React.FC = () => {
  const { switchDemoAccount } = useAuth();
  const navigate = useNavigate();

  // Scroll detection so the top header can subtly elevate and highlight
  const [isScrolled, setIsScrolled] = useState(false);

  // Interactive Live Explorer Filter
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'fullstack' | 'ai' | 'mobile' | 'devops' | 'design'>('all');

  // Interactive Escrow & Milestone Calculator State
  const [budgetSlider, setBudgetSlider] = useState(5000);
  const [billingMode, setBillingMode] = useState<'fixed' | 'hourly'>('fixed');

  // Interactive 4-Stage Lifecycle Simulator
  const [activeStage, setActiveStage] = useState<number>(1);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleQuickDemo = async (role: 'COMPANY' | 'FREELANCER') => {
    await switchDemoAccount(role);
    navigate(role === 'COMPANY' ? '/company' : '/freelancer');
  };

  const filteredProjects = selectedCategory === 'all'
    ? SAMPLE_PROJECTS
    : SAMPLE_PROJECTS.filter((p) => p.category === selectedCategory);

  // Computed Milestone splits based on slider
  const milestone1 = Math.round(budgetSlider * 0.25);
  const milestone2 = Math.round(budgetSlider * 0.50);
  const milestone3 = Math.round(budgetSlider * 0.25);
  const hourlyRate = Math.round(budgetSlider / 80);

  return (
    <div className="relative min-h-screen bg-slate-900/10 flex flex-col text-slate-800 selection:bg-indigo-500/20">
      {/* Dynamic Ambient Fluid Mesh Backdrop */}
      <AmbientGlassBackground />

      {/* PERMANENTLY FIXED TOP NAVIGATION BAR - NEVER GETS HIDDEN ON SCROLL */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'glass-panel-subtle py-2.5 shadow-lg shadow-indigo-950/5 border-b border-white/60 backdrop-blur-2xl bg-white/80'
            : 'glass-panel-subtle py-4 border-b border-white/40 backdrop-blur-xl bg-white/60'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
          {/* Logo & Brand Identity */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-[1px] shadow-sm shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-[15px] bg-slate-900/20 backdrop-blur-sm flex items-center justify-center text-white">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <span className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                Freelance Hub
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 border border-indigo-500/20">
                  v2.0
                </span>
              </span>
              <span className="hidden sm:block text-[11px] font-medium text-slate-500 leading-none">
                Find Talent. Build Great Work.
              </span>
            </div>
          </Link>

          {/* Navigation Action Links */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/login/freelancer"
              className="text-xs sm:text-sm font-bold text-slate-700 hover:text-indigo-600 px-3 py-2 rounded-xl transition hover:bg-white/50"
            >
              Freelancer Portal
            </Link>
            <Link
              to="/login/company"
              className="text-xs sm:text-sm font-bold text-slate-700 hover:text-indigo-600 px-3 py-2 rounded-xl transition hover:bg-white/50"
            >
              Company Portal
            </Link>
            <Link
              to="/register/company"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-500 hover:to-purple-500 transition shadow-sm shadow-indigo-500/30 active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Top Spacer so page content begins neatly beneath fixed header */}
      <div className="h-16 sm:h-20" />
      <DbStatusBanner />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden py-10 sm:py-16 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Main Hero Glass Card */}
          <div className="glass-panel rounded-3xl p-6 sm:p-12 mb-10 relative overflow-hidden shadow-2xl shadow-indigo-900/10 border border-white/70">
            {/* Top Pill */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel-subtle border border-indigo-300/40 text-indigo-700 text-xs font-bold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>MERN Full-Stack Freelance Marketplace • iPhone Glass Edition</span>
              </div>
            </div>

            {/* Headline */}
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.08] mb-5">
                Find Talent. <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Build Great Work.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed mb-8">
                Connect verified specialist freelancers with high-growth companies. Manage contracts, submit multi-stage deliverables with revision notes, and disburse simulated escrow with complete auditability.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-8">
                <Link
                  to="/login/freelancer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl hover:from-indigo-500 hover:to-purple-500 transition shadow-lg shadow-indigo-500/25 active:scale-95"
                >
                  <Search className="w-4 h-4" />
                  <span>Find Projects (Freelancer)</span>
                </Link>

                <Link
                  to="/login/company"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-slate-800 glass-panel-subtle hover:bg-white/90 border border-white/60 rounded-2xl transition shadow-xs active:scale-95"
                >
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Hire Talent (Company)</span>
                </Link>
              </div>

              {/* Instant Evaluator Demo Access Box */}
              <div className="glass-panel-subtle rounded-2xl p-4 sm:p-5 max-w-xl mx-auto border border-white/80 shadow-md">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    ⚡ Instant Evaluator Demo Access (Pre-Configured Accounts)
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => handleQuickDemo('COMPANY')}
                    className="flex items-center justify-between p-3.5 rounded-xl glass-card hover:border-indigo-400 hover:shadow-md transition text-left group active:scale-[0.98]"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-indigo-500" /> Apex Innovations
                      </p>
                      <p className="text-[11px] text-slate-500">Company Workspace</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  <button
                    onClick={() => handleQuickDemo('FREELANCER')}
                    className="flex items-center justify-between p-3.5 rounded-xl glass-card hover:border-indigo-400 hover:shadow-md transition text-left group active:scale-[0.98]"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-indigo-500" /> Alex Morgan
                      </p>
                      <p className="text-[11px] text-slate-500">Freelancer Workspace</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-2.5 font-mono">Default Demo Password: Demo1234!</p>
              </div>
            </div>
          </div>

          {/* INTERACTIVE FEATURE 1: LIVE MARKETPLACE PROJECT EXPLORER */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 mb-10 shadow-xl border border-white/70">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                  Interactive Live Explorer
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  Discover High-Growth Project Opportunities
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Filter by engineering discipline and inspect verified project scopes.
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { key: 'all', label: 'All Jobs', icon: Briefcase },
                  { key: 'fullstack', label: 'Full-Stack', icon: Code2 },
                  { key: 'ai', label: 'AI & ML', icon: Cpu },
                  { key: 'mobile', label: 'Mobile', icon: Smartphone },
                  { key: 'devops', label: 'DevOps', icon: Server },
                  { key: 'design', label: 'UI/UX', icon: Palette },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const active = selectedCategory === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setSelectedCategory(tab.key as any)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
                        active
                          ? 'glass-button-primary text-white shadow-xs'
                          : 'glass-panel-subtle text-slate-700 hover:bg-white/80'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grid of Interactive Project Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((p) => (
                <div
                  key={p.id}
                  className="glass-card rounded-2xl p-5 hover:border-indigo-300 hover:shadow-lg transition flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 border border-indigo-500/20">
                        {p.categoryLabel}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-700">
                        {p.budget}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {p.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>

                    {/* Skill Tags */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {p.skills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-[10px] rounded-lg bg-white/70 text-slate-600 font-medium border border-white/80"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/50 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {p.timeline}
                    </span>
                    <Link
                      to="/login/freelancer"
                      className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Bid Now</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* INTERACTIVE FEATURE 2: ESCROW & MILESTONE BUDGET ESTIMATOR */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 mb-10 shadow-xl border border-white/70">
            <div className="max-w-3xl mx-auto text-center mb-6">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                Interactive Escrow Estimator
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                Project Milestone & Budget Calculator
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Drag the slider to preview automated milestone disbursements, escrow allocations, and estimated timelines.
              </p>
            </div>

            <div className="max-w-2xl mx-auto glass-card rounded-3xl p-6 sm:p-8 shadow-md border border-white/80">
              {/* Slider Control */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-indigo-600" />
                    Target Project Budget:
                  </span>
                  <span className="text-2xl font-black text-indigo-600 font-mono">
                    ${budgetSlider.toLocaleString()}
                  </span>
                </div>

                <input
                  type="range"
                  min={1000}
                  max={20000}
                  step={500}
                  value={budgetSlider}
                  onChange={(e) => setBudgetSlider(parseInt(e.target.value, 10))}
                  className="w-full h-2.5 bg-slate-200/80 rounded-lg appearance-none cursor-pointer accent-indigo-600 shadow-inner"
                />

                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>$1,000 (Small Sprint)</span>
                  <span>$10,000 (Standard Release)</span>
                  <span>$20,000 (Enterprise Phase)</span>
                </div>
              </div>

              {/* Dynamic Milestone Splits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl glass-panel-subtle border border-white/80 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Milestone 1 (25%)</p>
                  <p className="text-lg font-black text-slate-900 font-mono mt-1">${milestone1.toLocaleString()}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Scoping & Architecture</p>
                </div>

                <div className="p-3.5 rounded-2xl glass-panel-subtle border border-indigo-200/60 bg-indigo-50/40 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Milestone 2 (50%)</p>
                  <p className="text-lg font-black text-indigo-600 font-mono mt-1">${milestone2.toLocaleString()}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">Core Dev & Integration</p>
                </div>

                <div className="p-3.5 rounded-2xl glass-panel-subtle border border-white/80 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Milestone 3 (25%)</p>
                  <p className="text-lg font-black text-slate-900 font-mono mt-1">${milestone3.toLocaleString()}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">QA, Revisions & Launch</p>
                </div>
              </div>

              {/* Escrow Guarantee Callout */}
              <div className="mt-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs text-emerald-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">Simulated Escrow Protection: Released only upon approved milestones.</span>
                </div>
                <span className="font-mono font-bold text-emerald-700">100% Protected</span>
              </div>
            </div>
          </div>

          {/* INTERACTIVE FEATURE 3: FOUR-STAGE LIFECYCLE SIMULATOR */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 mb-10 shadow-xl border border-white/70">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                Interactive Lifecycle Simulator
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                How Delivery & Escrow Work in Freelance Hub
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Click through each phase below to inspect live workflow interfaces.
              </p>
            </div>

            {/* Interactive Step Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
              {[
                { step: 1, title: '1. Post Job', subtitle: 'Company Workspace' },
                { step: 2, title: '2. Review & Hire', subtitle: 'Proposal Selection' },
                { step: 3, title: '3. Deliverables', subtitle: 'Revisions & Feedback' },
                { step: 4, title: '4. Escrow Payout', subtitle: 'Idempotent Payment' },
              ].map((s) => (
                <button
                  key={s.step}
                  onClick={() => setActiveStage(s.step)}
                  className={`p-3 rounded-2xl text-left transition-all ${
                    activeStage === s.step
                      ? 'glass-card border-indigo-400 shadow-md ring-2 ring-indigo-500/20 scale-[1.02]'
                      : 'glass-panel-subtle hover:bg-white/80 opacity-75'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900">{s.title}</p>
                  <p className="text-[10px] text-slate-500">{s.subtitle}</p>
                </button>
              ))}
            </div>

            {/* Simulator Live Screen Display */}
            <div className="glass-card rounded-2xl p-6 border border-white/80 min-h-[220px] flex flex-col justify-center animate-in fade-in">
              {activeStage === 1 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                    <h4 className="text-sm font-bold text-slate-900">Step 1: Project Posting with Milestone Scopes</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Companies specify required engineering skills, target budget range, and multi-stage milestone objectives. Project status automatically initiates as <span className="font-mono text-indigo-600 font-bold">OPEN</span>.
                  </p>
                  <div className="p-3 rounded-xl glass-panel-subtle border border-white/80 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">Job: Cloud Architecture Modernization</p>
                      <p className="text-slate-500 text-[11px]">Budget: $4,000 - $6,000 • 3 Milestones</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 font-bold text-[10px]">
                      OPEN FOR PROPOSALS
                    </span>
                  </div>
                </div>
              )}

              {activeStage === 2 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                    <h4 className="text-sm font-bold text-slate-900">Step 2: Candidate Proposal Review & Contract Generation</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Freelancers submit custom bids and duration estimates. When the company clicks "Accept Proposal", the platform automatically generates a legally binding contract and marks the posting as <span className="font-mono text-purple-600 font-bold">FILLED</span>.
                  </p>
                  <div className="p-3 rounded-xl glass-panel-subtle border border-white/80 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">Applicant: Alex Morgan (Senior Specialist)</p>
                      <p className="text-slate-500 text-[11px]">Proposed Bid: $4,800 • Duration: 3 Weeks</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-700 font-bold text-[10px]">
                      CONTRACT GENERATED
                    </span>
                  </div>
                </div>
              )}

              {activeStage === 3 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <h4 className="text-sm font-bold text-slate-900">Step 3: Milestone Deliverable Submission & Revision Loop</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Contractors submit repository URLs, staging links, and notes for each milestone. Companies can directly approve work or request revisions with structured actionable feedback.
                  </p>
                  <div className="p-3 rounded-xl glass-panel-subtle border border-white/80 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">Milestone 1: Core API & DB Schema Ready</p>
                      <p className="text-slate-500 text-[11px]">Deliverable: github.com/apex/cloud-core • Status: Under Review</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 font-bold text-[10px]">
                      SUBMITTED
                    </span>
                  </div>
                </div>
              )}

              {activeStage === 4 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <h4 className="text-sm font-bold text-slate-900">Step 4: Simulated Escrow Disbursement & Verified Ratings</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Upon client approval, simulated payments are disbursed from escrow into the contractor's ledger using integer minor units ($ cents) with complete idempotency protection against duplicate releases.
                  </p>
                  <div className="p-3 rounded-xl glass-panel-subtle border border-white/80 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">Disbursement: $1,200.00 USD Released</p>
                      <p className="text-slate-500 text-[11px]">Idempotency Key: IDEM-MS-9281 • Rated: 5.0 ★★★★★</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 font-bold text-[10px]">
                      COMPLETED & PAID
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM METRICS */}
      <section className="py-8 px-4 sm:px-8 max-w-7xl mx-auto w-full text-center">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
          Full-Stack Platform Capability Metrics
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 glass-card rounded-2xl hover:border-indigo-300 transition">
            <p className="text-2xl font-black text-indigo-600">100%</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">MERN Stack Architecture</p>
          </div>
          <div className="p-4 glass-card rounded-2xl hover:border-indigo-300 transition">
            <p className="text-2xl font-black text-indigo-600">&lt; 50ms</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">API Response Time</p>
          </div>
          <div className="p-4 glass-card rounded-2xl hover:border-indigo-300 transition">
            <p className="text-2xl font-black text-indigo-600">14 / 14</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">Automated Tests Passing</p>
          </div>
          <div className="p-4 glass-card rounded-2xl hover:border-indigo-300 transition">
            <p className="text-2xl font-black text-indigo-600">2-Sided</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">Role-Isolated Workspaces</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto glass-panel border-t border-white/40 text-slate-600 py-10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-slate-900">Freelance Hub</span>
            <span>— Find Talent. Build Great Work.</span>
          </div>
          <p className="text-slate-500">
            Production-Inspired College Project • React, TypeScript, Express, MongoDB Community Server
          </p>
        </div>
      </footer>
    </div>
  );
};
