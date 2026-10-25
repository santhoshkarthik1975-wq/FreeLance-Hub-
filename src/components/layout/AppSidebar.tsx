import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  Search,
  FileText,
  Clock,
  CheckCircle2,
  User,
  CreditCard,
  Bell,
  LogOut,
  Building,
  Briefcase,
  ChevronDown,
  Layers,
  Archive,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNotifications } from '../../context/NotificationContext.tsx';

interface AppSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ isOpen, onClose }) => {
  const { role, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const isPostingsRoute = location.pathname.startsWith('/company/postings');
  const [postingsOpen, setPostingsOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    if (onClose) onClose();
  };

  const navItemClass = (isActive: boolean) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
      isActive
        ? 'glass-button-primary shadow-sm font-bold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
    }`;

  const subItemClass = (isActive: boolean) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
      isActive
        ? 'bg-indigo-50/80 text-indigo-700 font-bold border border-indigo-200/50'
        : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Container with frosted glass */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 glass-panel border-r border-white/60 flex flex-col transition-transform duration-200 md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Workspace Brand / Header */}
        <div className="p-4 border-b border-white/40">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl glass-panel-subtle">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate">
                {role === 'COMPANY' ? 'Company Portal' : 'Freelancer Portal'}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">Freelance Hub Glass</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {role === 'FREELANCER' && (
            <>
              <NavLink to="/freelancer" end className={({ isActive }) => navItemClass(isActive)} onClick={onClose}>
                <LayoutDashboard className="w-4 h-4" />
                <span>Overview</span>
              </NavLink>

              <NavLink to="/freelancer/analytics" className={({ isActive }) => navItemClass(isActive)} onClick={onClose}>
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </NavLink>

              <NavLink to="/freelancer/projects" className={({ isActive }) => navItemClass(isActive)} onClick={onClose}>
                <Search className="w-4 h-4" />
                <span>Find Projects</span>
              </NavLink>

              <NavLink to="/freelancer/applications" className={({ isActive }) => navItemClass(isActive)} onClick={onClose}>
                <FileText className="w-4 h-4" />
                <span>My Applications</span>
              </NavLink>

              <NavLink to="/freelancer/jobs" className={({ isActive }) => navItemClass(isActive)} onClick={onClose}>
                <Clock className="w-4 h-4" />
                <span>Active Jobs</span>
              </NavLink>

              <NavLink to="/freelancer/completed" className={({ isActive }) => navItemClass(isActive)} onClick={onClose}>
                <CheckCircle2 className="w-4 h-4" />
                <span>Completed Jobs</span>
              </NavLink>

              <NavLink to="/freelancer/profile" className={({ isActive }) => navItemClass(isActive)} onClick={onClose}>
                <User className="w-4 h-4" />
                <span>My Profile</span>
              </NavLink>

              <NavLink to="/freelancer/payments" className={({ isActive }) => navItemClass(isActive)} onClick={onClose}>
                <CreditCard className="w-4 h-4" />
                <span>Earnings & Payments</span>
              </NavLink>

              <NavLink to="/freelancer/notifications" className={({ isActive }) => navItemClass(isActive)} onClick={onClose}>
                <Bell className="w-4 h-4" />
                <span className="flex-1">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </NavLink>
            </>
          )}

          {role === 'COMPANY' && (
            <>
              <NavLink to="/company" end className={({ isActive }) => navItemClass(isActive)} onClick={onClose}>
                <LayoutDashboard className="w-4 h-4" />
                <span>Home</span>
              </NavLink>

              <NavLink to="/company/profile" className={({ isActive }) => navItemClass(isActive)} onClick={onClose}>
                <Building className="w-4 h-4" />
                <span>Company Profile</span>
              </NavLink>

              <NavLink to="/company/analytics" className={({ isActive }) => navItemClass(isActive)} onClick={onClose}>
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </NavLink>

              <NavLink to="/company/jobs" className={({ isActive }) => navItemClass(isActive)} onClick={onClose}>
                <Clock className="w-4 h-4" />
                <span>Active Jobs</span>
              </NavLink>

              <NavLink to="/company/completed" className={({ isActive }) => navItemClass(isActive)} onClick={onClose}>
                <CheckCircle2 className="w-4 h-4" />
                <span>Completed Jobs</span>
              </NavLink>

              {/* Job Postings Expandable Dropdown */}
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={() => setPostingsOpen(!postingsOpen)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isPostingsRoute
                      ? 'bg-white/80 text-indigo-700 font-bold border border-white/60 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-4 h-4 text-slate-500" />
                    <span>Job Postings</span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      postingsOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {postingsOpen && (
                  <div className="pl-6 pr-1 pt-1 pb-1 space-y-1">
                    <NavLink
                      to="/company/postings/active"
                      className={({ isActive }) => subItemClass(isActive)}
                      onClick={onClose}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Active Postings</span>
                    </NavLink>

                    <NavLink
                      to="/company/postings/previous"
                      className={({ isActive }) => subItemClass(isActive)}
                      onClick={onClose}
                    >
                      <Archive className="w-3.5 h-3.5 text-slate-400" />
                      <span>Previous Postings</span>
                    </NavLink>
                  </div>
                )}
              </div>

              <NavLink to="/company/payments" className={({ isActive }) => navItemClass(isActive)} onClick={onClose}>
                <CreditCard className="w-4 h-4" />
                <span>Payments</span>
              </NavLink>

              <NavLink to="/company/notifications" className={({ isActive }) => navItemClass(isActive)} onClick={onClose}>
                <Bell className="w-4 h-4" />
                <span className="flex-1">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </NavLink>
            </>
          )}
        </div>

        {/* Bottom Logout */}
        <div className="p-3 border-t border-white/40">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50/70 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
