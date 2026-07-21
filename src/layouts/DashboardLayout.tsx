import React, { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import clsx from 'clsx';
import Sidebar from '../components/layout/Sidebar';
import BottomBar from '../components/layout/BottomBar';
import Header from '../components/layout/Header';
import { useUIStore } from '../store';

const DashboardLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { navMode } = useUIStore();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900 print:h-auto print:overflow-visible print:bg-white">
      <div className="print:hidden">
        <Sidebar 
          mobileOpen={mobileSidebarOpen} 
          onMobileClose={() => setMobileSidebarOpen(false)} 
        />
      </div>
      
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 relative w-full print:h-auto print:overflow-visible print:bg-white">
        <div className="print:hidden">
          <Header sidebarOpen={mobileSidebarOpen} setSidebarOpen={setMobileSidebarOpen} />
        </div>

        {/* Content */}
        <main className={clsx(
          "flex-1 overflow-x-hidden overflow-y-auto pb-6 print:overflow-visible print:pb-0",
          navMode === 'bottom' && "md:pb-24"
        )}>
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
      <div className="print:hidden">
        <BottomBar />
      </div>
    </div>
  );
};

export default DashboardLayout;
