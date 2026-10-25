import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Bell,
  LogOut,
  User as UserIcon,
  Layers,
  ChevronDown,
  Menu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { formatDateTime } from '../../utils/formatters.ts';

interface AppHeaderProps {
  onToggleSidebar?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onToggleSidebar }) => {
  const { user, role, logout, switchDemoAccount } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSwitchDemo = async (targetRole: 'FREELANCER' | 'COMPANY') => {
    await switchDemoAccount(targetRole);
    if (targetRole === 'COMPANY') {
      navigate('/company');
    } else {
      navigate('/freelancer');
    }
  };

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-white/60 px-4 sm:px-6 py-2.5 backdrop-blur-2xl shadow-xs transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-white/60 transition focus:outline-hidden"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                Freelance Hub
              </span>
              <span className="hidden sm:block text-[11px] font-medium text-slate-500 leading-none">
                Find Talent. Build Great Work.
              </span>
            </div>
          </Link>

          {/* Current Workspace Pill */}
          {role && (
            <div className="hidden lg:flex items-center gap-1.5 ml-4 px-2.5 py-1 rounded-full glass-panel-subtle text-indigo-700 text-xs font-semibold shadow-xs">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>{role === 'COMPANY' ? 'Company Workspace' : 'Freelancer Workspace'}</span>
            </div>
          )}
        </div>

        {/* Right: Demo Quick Switcher, Notification popover, User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Demo Role Switcher for Evaluators */}
          <div className="flex items-center rounded-full glass-panel-subtle p-1 text-xs font-medium border border-white/70">
            <button
              onClick={() => handleSwitchDemo('FREELANCER')}
              className={`px-3 py-1 rounded-full transition ${
                role === 'FREELANCER'
                  ? 'bg-white text-indigo-600 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Switch demo view to Freelancer"
            >
              Freelancer View
            </button>
            <button
              onClick={() => handleSwitchDemo('COMPANY')}
              className={`px-3 py-1 rounded-full transition ${
                role === 'COMPANY'
                  ? 'bg-white text-indigo-600 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Switch demo view to Company"
            >
              Company View
            </button>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifs(!showNotifs);
                setShowUserMenu(false);
              }}
              className="relative p-2 rounded-xl glass-panel-subtle hover:bg-white/80 text-slate-700 transition focus:outline-hidden"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-panel border border-white/80 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between p-3.5 border-b border-white/50 bg-white/40">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-100/80 text-indigo-700 text-xs font-semibold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllAsRead()}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-white/40">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.slice(0, 8).map((n) => (
                      <div
                        key={n._id}
                        onClick={() => {
                          markAsRead(n._id);
                          setShowNotifs(false);
                          if (role === 'FREELANCER') {
                            navigate('/freelancer/notifications');
                          } else {
                            navigate('/company/notifications');
                          }
                        }}
                        className={`p-3.5 hover:bg-white/60 transition cursor-pointer text-left ${
                          !n.isRead ? 'bg-indigo-50/50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-bold text-slate-900 leading-snug">{n.title}</p>
                          {!n.isRead && <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1"></span>}
                        </div>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                          {formatDateTime(n.createdAt)}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 border-t border-white/50 bg-white/40 text-center">
                  <Link
                    to={role === 'FREELANCER' ? '/freelancer/notifications' : '/company/notifications'}
                    onClick={() => setShowNotifs(false)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    View All Notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifs(false);
              }}
              className="flex items-center gap-2 p-1.5 rounded-full glass-panel-subtle hover:bg-white/80 transition focus:outline-hidden"
              aria-label="User menu"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden md:block text-left pr-1">
                <p className="text-xs font-bold text-slate-900 leading-none">{user?.name || 'Account'}</p>
                <p className="text-[10px] text-slate-500 leading-none mt-1 capitalize">{role?.toLowerCase()}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 pr-0.5" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel border border-white/80 shadow-2xl z-50 overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2">
                <div className="px-3.5 py-2.5 border-b border-white/50">
                  <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 font-mono truncate">{user?.email}</p>
                </div>

                <Link
                  to={role === 'FREELANCER' ? '/freelancer/profile' : '/company/profile'}
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-white/60 transition"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  {role === 'FREELANCER' ? 'My Profile' : 'Company Profile'}
                </Link>

                <div className="border-t border-white/50 my-1"></div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50/60 transition"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
