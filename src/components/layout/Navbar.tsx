import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Bell,
  Moon,
  Sun,
  Globe,
  Plus,
  ChevronDown,
  User,
  LogOut,
  Settings,
  HelpCircle,
} from 'lucide-react';
import clsx from 'clsx';

export interface NavbarProps {
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({ className }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header
      className={clsx(
        'h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10 border-b border-slate-200 shrink-0',
        className
      )}
    >
      {/* Search */}
      <div className="flex-1 flex items-center max-w-xl">
        <div className="flex items-center bg-slate-100/80 px-3 py-2 rounded-lg w-full border border-slate-200 transition-all focus-within:bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            id="global-search"
            type="text"
            placeholder="Search everywhere… (Cmd+K)"
            className="bg-transparent border-none focus:outline-none text-sm w-full text-slate-700 placeholder-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center space-x-1 ml-4">
        {/* Quick Add */}
        <button
          id="quick-add-btn"
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/30 mr-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Quick Add</span>
        </button>

        {/* Language */}
        <button
          id="language-btn"
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors hidden md:block"
        >
          <Globe className="w-5 h-5" />
        </button>

        {/* Theme Toggle */}
        <button
          id="theme-toggle-btn"
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors hidden md:block"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Help */}
        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors hidden md:block">
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            id="notifications-btn"
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
                <span className="text-xs text-blue-600 font-medium cursor-pointer hover:underline">Mark all read</span>
              </div>
              {[
                { title: 'New lead added', desc: 'Priya Sharma has been added as a new lead', time: '2 min ago', unread: true },
                { title: 'Order #1045 ready', desc: "Production completed for Anita's order", time: '1 hr ago', unread: true },
                { title: 'Payment received', desc: '₹12,500 received from Meera Joshi', time: '3 hr ago', unread: false },
              ].map((n, i) => (
                <div
                  key={i}
                  className={clsx(
                    'flex gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-b-0',
                    n.unread && 'bg-blue-50/50'
                  )}
                >
                  <div className={clsx('w-2 h-2 rounded-full mt-2 shrink-0', n.unread ? 'bg-blue-600' : 'bg-transparent')} />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{n.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.desc}</p>
                    <p className="text-xs text-slate-400 mt-1">{n.time}</p>
                  </div>
                </div>
              ))}
              <div className="px-4 py-2 border-t border-slate-100">
                <button className="w-full text-center text-xs text-blue-600 hover:underline font-medium py-1">View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-8 border-r border-slate-200 mx-1" />

        {/* Profile Menu */}
        <div className="relative">
          <button
            id="profile-menu-btn"
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              AD
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-slate-700 leading-tight">Admin User</p>
              <p className="text-xs text-slate-400">Superadmin</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                <p className="text-sm font-semibold text-slate-800">Admin User</p>
                <p className="text-xs text-slate-500">admin@boutiquecrm.com</p>
              </div>
              <div className="py-1">
                {[
                  { icon: <User className="w-4 h-4" />, label: 'My Profile', path: '/profile' },
                  { icon: <Settings className="w-4 h-4" />, label: 'Settings', path: '/settings' },
                  { icon: <HelpCircle className="w-4 h-4" />, label: 'Support', path: '#' },
                ].map(item => (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <span className="text-slate-400">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="py-1 border-t border-slate-100">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
