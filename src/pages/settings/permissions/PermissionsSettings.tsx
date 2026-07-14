import React, { useState, useEffect } from 'react';
import { Save, Shield, CheckCircle2, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../../../constants';
import { fetchWithAuth } from '../../../api/client';
import { toast } from 'react-hot-toast';
import { TableSkeleton, CardSkeleton } from '@/components/ui/Skeleton';

type AccessLevel = 'Full' | 'Read' | 'None';

interface ModulePermission {
  module: string;
  [roleId: string]: AccessLevel | string;
}

interface DynamicRole {
  id: string;
  name: string;
}

const MODULES = [
  'Dashboard', 'CRM', 'Orders', 'Production', 'Measurements', 
  'Inventory', 'Billing', 'Staff Management', 'Marketing', 'Admin Settings'
];

const levelColor: Record<AccessLevel, string> = {
  Full: 'bg-[#10B981]/10 text-[#234638] ring-[#10B981]/20',
  Read: 'bg-[#8338EC]/10 text-[#6200EA] ring-[#8338EC]/20',
  None: 'bg-[#16132D]/[0.06] text-[#16132D]/40 ring-[#16132D]/[0.08]',
};

const PermissionsSettings: React.FC = () => {
  const [roles, setRoles] = useState<DynamicRole[]>([]);
  const [permissions, setPermissions] = useState<ModulePermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/settings/roles`);
      if (!res.ok) throw new Error('Failed to fetch roles');
      const data = await res.json();
      
      const dynamicRoles = data.map((r: any) => ({ id: r.id, name: r.name }));
      setRoles(dynamicRoles);

      const newPermissions: ModulePermission[] = MODULES.map(module => {
        const row: ModulePermission = { module };
        data.forEach((r: any) => {
          row[r.id] = r.permissions?.[module] || 'None';
        });
        return row;
      });
      setPermissions(newPermissions);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const cycle = (current: AccessLevel): AccessLevel => {
    if (current === 'Full') return 'Read';
    if (current === 'Read') return 'None';
    return 'Full';
  };

  const toggle = (index: number, roleId: string) => {
    if (roleId === 'owner') return; // Owner is always Full
    setPermissions(perms => perms.map((p, i) => i === index ? { ...p, [roleId]: cycle(p[roleId] as AccessLevel) } : p));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // We need to update each role individually except owner
      const promises = roles.filter(r => r.id !== 'owner').map(r => {
        // Build the permission object for this role
        const rolePerms: Record<string, AccessLevel> = {};
        permissions.forEach(p => {
          rolePerms[p.module] = p[r.id] as AccessLevel;
        });
        
        return fetchWithAuth(`${API_BASE_URL}/settings/roles/${r.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ permissions: rolePerms })
        }).then(res => {
          if (!res.ok) throw new Error(`Failed for role ${r.id}`);
        });
      });
      
      await Promise.all(promises);
      
      setSaved(true);
      toast.success('Permissions saved successfully');
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save permissions');
    } finally {
      setIsSaving(false);
    }
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
            disabled={isLoading || isSaving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-md self-start sm:self-auto ${
              saved
                ? 'bg-[#10B981] text-white shadow-[#10B981]/20'
                : 'bg-[#16132D] hover:bg-[#2a3545] text-[#F4F3F8] shadow-[#16132D]/10 cursor-pointer'
            } ${(isLoading || isSaving) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>

        {isLoading ? (
          <TableSkeleton />
        ) : (
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
                      <th key={r.id} className="py-4 px-4 text-center min-w-[110px]">{r.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#16132D]/[0.05]">
                  {permissions.map((p, i) => (
                    <tr key={p.module} className="hover:bg-[#F4F3F8]/60 transition">
                      <td className="py-4 px-6 font-semibold text-[#16132D]">{p.module}</td>
                      {roles.map(r => {
                        const level = p[r.id] as AccessLevel;
                        const isOwner = r.id === 'owner';
                        return (
                          <td key={r.id} className="py-4 px-4 text-center">
                            <button
                              onClick={() => toggle(i, r.id)}
                              disabled={isOwner}
                              className={`px-3 py-1 rounded-full text-[10px] font-bold ring-1 transition ${levelColor[level] || levelColor['None']} ${isOwner ? 'cursor-not-allowed opacity-80' : 'hover:opacity-80 active:scale-95 cursor-pointer'}`}
                            >
                              {level || 'None'}
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
        )}
      </div>
    </div>
  );
};

export default PermissionsSettings;
