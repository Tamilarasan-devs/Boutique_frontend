import React, { Suspense } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Building2, Settings, Users, Shield, Receipt, Globe,
  ChevronLeft, Scissors, Crown, LogOut, Heart, Palette
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

const navItems = [
  { to: '/settings/company', icon: Building2, label: 'Boutique Profile', desc: 'Business details, logo & branding' },
  { to: '/settings/theme', icon: Palette, label: 'Workspace Theme', desc: 'App colors & visual appearance' },
  { to: '/settings/users', icon: Users, label: 'Staff & Users', desc: 'Manage team members & accounts' },
  { to: '/settings/roles', icon: Shield, label: 'Roles & Access', desc: 'Define custom roles & limits' },
  { to: '/settings/permissions', icon: Globe, label: 'Permissions', desc: 'Global app security controls' },
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
    <div className="min-h-screen bg-[#F4F3F8] flex">

      {/* Settings Sidebar */}
      <aside className="w-[320px] flex-shrink-0 bg-white border-r border-[var(--primary-hex)]/[0.04] flex flex-col h-screen sticky top-0 shadow-[8px_0_32px_-12px_rgba(var(--primary-rgb),0.06)] z-10">
        {/* Logo + back */}
        <div className="px-6 py-6 border-b border-[var(--primary-hex)]/[0.04]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary-hex)] to-[#2D2854] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-[var(--primary-hex)]/20 border border-white/10">
              <Scissors className="w-5 h-5 text-[var(--accent-hex)]" />
            </div>
            <div className="min-w-0">
              <span className="block text-base font-serif font-bold text-[var(--primary-hex)] tracking-tight truncate leading-tight">
                {companySettings?.name || 'Boutique CRM'}
              </span>
              <span className="block text-[10px] font-bold text-[var(--primary-hex)]/40 uppercase tracking-widest mt-0.5">
                Workspace Settings
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F8F8FB] hover:bg-[var(--primary-hex)] text-[var(--primary-hex)]/70 hover:text-white text-[12px] font-bold rounded-xl transition-all duration-300 group border border-[var(--primary-hex)]/[0.04] hover:border-transparent hover:shadow-lg hover:shadow-[var(--primary-hex)]/15"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-6 px-4 scrollbar-hide">
          <p className="text-[10px] font-bold text-[var(--primary-hex)]/40 uppercase tracking-[0.2em] px-2 mb-4">Settings Menu</p>
          <nav className="space-y-2">
            {navItems.map(({ to, icon: Icon, label, desc }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-start gap-3.5 p-3 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-br from-[var(--primary-hex)] to-[#252047] text-white shadow-xl shadow-[var(--primary-hex)]/15 border border-[var(--primary-hex)]'
                      : 'hover:bg-[#F8F8FB] hover:text-[var(--primary-hex)] border border-transparent hover:border-[var(--primary-hex)]/[0.04]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`p-2 rounded-xl transition-colors duration-300 relative z-10 flex-shrink-0 ${
                      isActive 
                        ? 'bg-white/10 text-white backdrop-blur-sm' 
                        : 'bg-white text-[var(--primary-hex)]/50 shadow-sm border border-[var(--primary-hex)]/[0.06] group-hover:text-[var(--accent-hex)] group-hover:border-[var(--accent-hex)]/20 group-hover:shadow-[var(--accent-hex)]/10'
                    }`}>
                      <Icon className="w-[18px] h-[18px]" />
                    </div>
                    <div className="flex-1 min-w-0 py-0.5 relative z-10">
                      <p className={`text-[13.5px] font-bold tracking-tight transition-colors duration-300 ${
                        isActive ? 'text-white' : 'text-[var(--primary-hex)]/80 group-hover:text-[var(--primary-hex)]'
                      }`}>
                        {label}
                      </p>
                      <p className={`text-[11px] font-medium leading-relaxed mt-0.5 transition-colors duration-300 ${
                        isActive ? 'text-white/60' : 'text-[var(--primary-hex)]/40 group-hover:text-[var(--primary-hex)]/60'
                      }`}>
                        {desc}
                      </p>
                    </div>
                    {/* Active state highlight effect */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/[0.04] to-transparent pointer-events-none" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-[var(--primary-hex)]/[0.04] bg-white space-y-2 relative z-10 shadow-[0_-8px_24px_-12px_rgba(var(--primary-rgb),0.03)]">
          {user && (
            <div className="flex items-center gap-3 px-3 py-2.5 bg-[#F8F8FB] rounded-2xl border border-[var(--primary-hex)]/[0.04] hover:border-[var(--primary-hex)]/[0.08] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-hex)]/15 to-[var(--accent-hex)]/5 border border-[var(--accent-hex)]/20 text-[var(--accent-hex)] flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-inner">
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-[var(--primary-hex)] truncate">{user.name}</p>
                <p className="text-[11px] text-[var(--primary-hex)]/50 font-semibold flex items-center gap-1 mt-0.5">
                  {user.role === 'owner' && <Crown className="w-3 h-3 text-[var(--accent-hex)]" />}
                  {ROLE_LABELS[user.role] || user.role}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-[var(--primary-hex)]/60 hover:bg-[#F43F5E] hover:text-white hover:shadow-lg hover:shadow-[#F43F5E]/20 transition-all duration-300 group border border-transparent hover:border-[#F43F5E]/20"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <Suspense fallback={
          <div className="flex flex-1 items-center justify-center h-64">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[var(--accent-hex)]" />
          </div>
        }>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};

export default SettingsLayout;
