import React, { Suspense } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Building2, Settings, Users, Shield, Receipt, Globe,
  ChevronLeft, Scissors, Crown, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

const navItems = [
  { to: '/settings/company', icon: Building2, label: 'Boutique Profile' },
  { to: '/settings/users', icon: Users, label: 'Staff & Users' },
  { to: '/settings/roles', icon: Shield, label: 'Roles & Access' },
  { to: '/settings/taxes', icon: Receipt, label: 'Taxes & GST' },
  { to: '/settings/permissions', icon: Globe, label: 'Permissions' },
];

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner', manager: 'Manager', sales_staff: 'Sales Staff',
  tailor: 'Tailor', receptionist: 'Receptionist',
};

const SettingsLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { companySettings } = useSettings();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#FAF7F1] flex">

      {/* Settings Sidebar */}
      <aside className="w-72 flex-shrink-0 bg-white border-r border-[#1C2430]/[0.07] flex flex-col h-screen sticky top-0">
        {/* Logo + back */}
        <div className="px-6 py-5 border-b border-[#1C2430]/[0.07]">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-[#1C2430] rounded-xl flex items-center justify-center flex-shrink-0">
              <Scissors className="w-4 h-4 text-[#C1652F]" />
            </div>
            <span className="text-base font-serif font-bold text-[#1C2430] tracking-tight truncate">
              {companySettings?.name || 'Boutique CRM'}
            </span>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-xs font-semibold text-[#1C2430]/50 hover:text-[#C1652F] transition cursor-pointer group"
          >
            <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to Dashboard
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <p className="text-[10px] font-bold text-[#1C2430]/35 uppercase tracking-[0.18em] px-3 mb-3">Settings</p>
          <nav className="space-y-0.5">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition group ${
                    isActive
                      ? 'bg-[#1C2430] text-[#FAF7F1] shadow-sm shadow-[#1C2430]/10'
                      : 'text-[#1C2430]/65 hover:bg-[#1C2430]/[0.05] hover:text-[#1C2430]'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-[#1C2430]/[0.07] space-y-2">
          {user && (
            <div className="flex items-center gap-3 px-3 py-2 bg-[#FAF7F1] rounded-xl border border-[#1C2430]/[0.06]">
              <div className="w-9 h-9 rounded-xl bg-[#C1652F]/10 border border-[#C1652F]/15 text-[#C1652F] flex items-center justify-center font-bold text-xs flex-shrink-0">
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#1C2430] truncate">{user.name}</p>
                <p className="text-[10px] text-[#1C2430]/40 font-semibold flex items-center gap-1">
                  {user.role === 'owner' && <Crown className="w-2.5 h-2.5 text-[#C99A3E]" />}
                  {ROLE_LABELS[user.role] || user.role}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#1C2430]/60 hover:bg-[#9B3B43]/[0.06] hover:text-[#9B3B43] transition cursor-pointer group"
          >
            <LogOut className="w-4 h-4 group-hover:text-[#9B3B43]" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <Suspense fallback={
          <div className="flex flex-1 items-center justify-center h-64">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#C1652F]" />
          </div>
        }>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};

export default SettingsLayout;
