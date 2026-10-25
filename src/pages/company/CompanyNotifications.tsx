import React from 'react';
import { Bell, CheckCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { formatDateTime } from '../../utils/formatters.ts';

export const CompanyNotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (n: any) => {
    markAsRead(n._id);
    if (n.resourceType === 'contract') {
      navigate('/company/jobs');
    } else if (n.resourceType === 'posting') {
      navigate(`/company/postings/${n.resourceId}/applications`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Company Activity & Alerts</h1>
          <p className="text-xs text-slate-500 mt-1">
            Stay updated on newly received candidate proposals, deliverable submissions, and contract completions.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No Notifications</p>
            <p className="mt-1">All applicant submissions and milestone updates will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className={`p-4 hover:bg-slate-50 transition cursor-pointer flex items-start justify-between gap-4 ${
                  !n.isRead ? 'bg-indigo-50/30' : ''
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      !n.isRead
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-slate-900">{n.title}</h3>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {formatDateTime(n.createdAt)}
                    </p>
                  </div>
                </div>

                {n.resourceId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNotificationClick(n);
                    }}
                    className="shrink-0 p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg"
                    title="View Resource"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
