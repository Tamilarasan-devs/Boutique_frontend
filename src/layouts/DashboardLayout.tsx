import React, { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <Sidebar
        collapsed={!sidebarOpen}
        onCollapseToggle={(collapsed) => setSidebarOpen(!collapsed)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 relative">
        <Header sidebarOpen={mobileSidebarOpen} setSidebarOpen={setMobileSidebarOpen} />

        {/* Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3 text-slate-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                  <p className="text-sm font-medium">Loading page…</p>
                </div>
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
