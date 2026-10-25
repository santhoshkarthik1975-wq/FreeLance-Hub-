import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader.tsx';
import { AppSidebar } from './AppSidebar.tsx';
import { DbStatusBanner } from '../ui/DbStatusBanner.tsx';
import { AmbientGlassBackground } from '../ui/AmbientGlassBackground.tsx';

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen relative flex flex-col text-slate-800 antialiased selection:bg-indigo-500/20 selection:text-indigo-900">
      {/* Dynamic iPhone Liquid Glass Ambient Mesh */}
      <AmbientGlassBackground />

      <DbStatusBanner />
      <AppHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex overflow-hidden">
        <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 md:py-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
