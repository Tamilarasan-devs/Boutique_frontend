import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Shield, Crown, User as UserIcon } from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  manager: 'Manager',
  sales_staff: 'Sales Staff',
  tailor: 'Tailor',
  receptionist: 'Receptionist',
};

const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const isOwner = user.role === 'owner';

  return (
    <div className="min-h-screen bg-[#F4F3F8] text-[var(--primary-hex)]">
      <div className="max-w-3xl mx-auto px-6 md:px-8 py-8 space-y-6">
        
        {/* Header */}
        <div className="pb-6 border-b border-[var(--primary-hex)]/[0.08]">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[var(--primary-hex)] mb-1.5">My Account</p>
          <h1 className="text-3xl font-serif font-semibold text-[var(--primary-hex)]">User Profile</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-[var(--primary-hex)]/[0.06] shadow-[0_8px_40px_rgba(28,36,48,0.04)] overflow-hidden">
          
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-[var(--primary-hex)] to-[#2a3545] relative">
            <div className="absolute -bottom-12 left-8">
              <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-lg shadow-[var(--primary-hex)]/10">
                <div className="w-full h-full rounded-xl bg-[var(--primary-hex)]/10 border border-[var(--primary-hex)]/20 text-[var(--primary-hex)] flex items-center justify-center font-black text-3xl">
                  {initials}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-16 pb-8 px-8">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[var(--primary-hex)] flex items-center gap-2">
                  {user.name}
                  {isOwner && (
                    <span title="Owner" className="flex">
                      <Crown className="w-5 h-5 text-[var(--primary-hex)]" />
                    </span>
                  )}
                </h2>
                <div className="flex items-center gap-4 mt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ring-1 bg-[var(--primary-hex)]/5 text-[var(--primary-hex)] ring-[var(--primary-hex)]/10">
                    <Shield className="w-3.5 h-3.5 text-[var(--primary-hex)]" />
                    {ROLE_LABELS[user.role] || user.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-[var(--primary-hex)]/[0.06] grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div>
                <p className="text-[10px] font-bold text-[var(--primary-hex)]/40 uppercase tracking-wider mb-2">Email Address</p>
                <div className="flex items-center gap-3 text-sm font-medium text-[var(--primary-hex)]/80">
                  <div className="p-2 rounded-lg bg-[var(--primary-hex)]/5">
                    <Mail className="w-4 h-4 text-[var(--primary-hex)]/60" />
                  </div>
                  {user.email}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[var(--primary-hex)]/40 uppercase tracking-wider mb-2">Account ID</p>
                <div className="flex items-center gap-3 text-sm font-medium text-[var(--primary-hex)]/80">
                  <div className="p-2 rounded-lg bg-[var(--primary-hex)]/5">
                    <UserIcon className="w-4 h-4 text-[var(--primary-hex)]/60" />
                  </div>
                  <span className="font-mono text-xs">{user.id}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
        
        <p className="text-center text-xs text-[var(--primary-hex)]/40 font-medium">
          If you need to change your password or account details, please contact your boutique administrator.
        </p>

      </div>
    </div>
  );
};

export default Profile;
