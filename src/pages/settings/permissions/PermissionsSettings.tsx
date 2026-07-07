import React, { useState } from 'react';
import { Save, Shield, CheckCircle2 } from 'lucide-react';

type AccessLevel = 'Full' | 'Read' | 'None';

interface ModulePermission {
  module: string;
  owner: AccessLevel;
  manager: AccessLevel;
  salesStaff: AccessLevel;
  tailor: AccessLevel;
  receptionist: AccessLevel;
}

const defaultPermissions: ModulePermission[] = [
  { module: 'Dashboard', owner: 'Full', manager: 'Full', salesStaff: 'Read', tailor: 'Read', receptionist: 'Read' },
  { module: 'CRM', owner: 'Full', manager: 'Full', salesStaff: 'Full', tailor: 'None', receptionist: 'Full' },
  { module: 'Orders', owner: 'Full', manager: 'Full', salesStaff: 'Full', tailor: 'Read', receptionist: 'Read' },
  { module: 'Production', owner: 'Full', manager: 'Full', salesStaff: 'None', tailor: 'Full', receptionist: 'None' },
  { module: 'Measurements', owner: 'Full', manager: 'Full', salesStaff: 'Read', tailor: 'Full', receptionist: 'None' },
  { module: 'Inventory', owner: 'Full', manager: 'Full', salesStaff: 'None', tailor: 'Read', receptionist: 'None' },
  { module: 'Billing', owner: 'Full', manager: 'Full', salesStaff: 'Full', tailor: 'None', receptionist: 'Read' },
  { module: 'Staff Management', owner: 'Full', manager: 'Full', salesStaff: 'None', tailor: 'None', receptionist: 'None' },
  { module: 'Marketing', owner: 'Full', manager: 'Full', salesStaff: 'Full', tailor: 'None', receptionist: 'None' },
  { module: 'Admin Settings', owner: 'Full', manager: 'None', salesStaff: 'None', tailor: 'None', receptionist: 'None' },
];

type RoleKey = 'owner' | 'manager' | 'salesStaff' | 'tailor' | 'receptionist';

const roles: { key: RoleKey; label: string }[] = [
  { key: 'owner', label: 'Owner' },
  { key: 'manager', label: 'Manager' },
  { key: 'salesStaff', label: 'Sales Staff' },
  { key: 'tailor', label: 'Tailor' },
  { key: 'receptionist', label: 'Receptionist' },
];

const levelColor: Record<AccessLevel, string> = {
  Full: 'bg-[#10B981]/10 text-[#234638] ring-[#10B981]/20',
  Read: 'bg-[#8338EC]/10 text-[#6200EA] ring-[#8338EC]/20',
  None: 'bg-[#16132D]/[0.06] text-[#16132D]/40 ring-[#16132D]/[0.08]',
};

const PermissionsSettings: React.FC = () => {
  const [permissions, setPermissions] = useState<ModulePermission[]>(defaultPermissions);
  const [saved, setSaved] = useState(false);

  const cycle = (current: AccessLevel): AccessLevel => {
    if (current === 'Full') return 'Read';
    if (current === 'Read') return 'None';
    return 'Full';
  };

  const toggle = (index: number, role: RoleKey) => {
    if (role === 'owner') return; // Owner is always Full
    setPermissions(perms => perms.map((p, i) => i === index ? { ...p, [role]: cycle(p[role]) } : p));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F4F3F8] text-[#16132D]">
      <div className="flex flex-col h-full space-y-6 p-6 md:p-8 max-w-5xl mx-auto">
        
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 pb-5 border-b border-[#16132D]/[0.08]">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#7209B7] mb-1.5">Settings</p>
            <h1 className="text-3xl font-serif font-semibold text-[#16132D]">Permissions</h1>
            <p className="text-sm text-[#16132D]/55 mt-1">Control module-level access for each role. Click a cell to toggle Full → Read → None.</p>
          </div>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-md self-start sm:self-auto cursor-pointer ${
              saved
                ? 'bg-[#10B981] text-white shadow-[#10B981]/20'
                : 'bg-[#16132D] hover:bg-[#2a3545] text-[#F4F3F8] shadow-[#16132D]/10'
            }`}
          >
            {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-[#16132D]/[0.06] shadow-[0_1px_3px_rgba(28,36,48,0.04)] overflow-hidden">
          {/* Legend */}
          <div className="px-5 py-3 border-b border-[#16132D]/[0.07] bg-[#F4F3F8]/30 flex flex-wrap items-center gap-3">
            <Shield className="w-4 h-4 text-[#16132D]/40" />
            <span className="text-xs font-bold text-[#16132D]/50 uppercase tracking-wider">Access Legend:</span>
            {(['Full', 'Read', 'None'] as AccessLevel[]).map(l => (
              <span key={l} className={`text-[10px] font-bold px-2.5 py-1 rounded-full ring-1 ${levelColor[l]}`}>{l}</span>
            ))}
            <span className="text-xs text-[#16132D]/40 ml-1 italic">(Click to toggle)</span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#16132D]/[0.08] bg-[#F4F3F8]/70 text-[#16132D]/40 font-semibold text-xs uppercase tracking-wide">
                  <th className="py-4 px-6 min-w-[160px]">Module</th>
                  {roles.map(r => (
                    <th key={r.key} className="py-4 px-4 text-center min-w-[110px]">{r.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#16132D]/[0.05]">
                {permissions.map((p, i) => (
                  <tr key={p.module} className="hover:bg-[#F4F3F8]/60 transition">
                    <td className="py-4 px-6 font-semibold text-[#16132D]">{p.module}</td>
                    {roles.map(r => {
                      const level = p[r.key];
                      const isOwner = r.key === 'owner';
                      return (
                        <td key={r.key} className="py-4 px-4 text-center">
                          <button
                            onClick={() => toggle(i, r.key)}
                            disabled={isOwner}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold ring-1 transition ${levelColor[level]} ${isOwner ? 'cursor-not-allowed opacity-80' : 'hover:opacity-80 active:scale-95 cursor-pointer'}`}
                          >
                            {level}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionsSettings;
