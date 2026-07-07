import React, { Suspense, useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { subscriptionApi, SubscriptionStatus } from '../api/subscriptionApi';

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkSub = async () => {
      try {
        const status = await subscriptionApi.getSubscriptionStatus();
        setSubscription(status);
      } catch (e) {
        console.error(e);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkSub();
  }, [location.pathname]);

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
          {checkingAuth ? (
            <div className="h-full flex items-center justify-center text-slate-500">Checking subscription status...</div>
          ) : (subscription?.status !== 'active' && subscription?.status !== 'trialing') && location.pathname !== '/billing/pricing' ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Subscription Required</h2>
              <p className="text-slate-500 mb-6 max-w-md">Your CRM subscription is currently inactive. Please subscribe to a Pro plan to continue managing your boutique.</p>
              <a href="/billing/pricing" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition">
                View Pricing Plans
              </a>
            </div>
          ) : (
            <>
              {subscription?.status === 'trialing' && (
                <div className="bg-[#7209B7] px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm">
                  You are currently on a 15-Day Free Trial. <a href="/billing/pricing" className="underline text-purple-200 hover:text-white ml-1 font-bold">Upgrade to Pro</a> to ensure uninterrupted access.
                </div>
              )}
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
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
