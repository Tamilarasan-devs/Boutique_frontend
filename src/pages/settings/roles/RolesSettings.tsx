import React, { useState, useEffect } from 'react';
import { Plus, Shield, Edit2, Trash2, CheckCircle2, Save, X, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../../../constants';
import { useAuth } from '../../../context/AuthContext';
import { fetchWithAuth } from '../../../api/client';
import { TableSkeleton, CardSkeleton } from '@/components/ui/Skeleton';

interface Role {
  id: string;
  name: string;
  description: string;
  users: number;
  color: string;
  is_system?: boolean;
  permissions: Record<string, 'Full' | 'Read' | 'None'>;
}

const AVAILABLE_MODULES = [
  { path: '/', label: 'Dashboard' },
  { path: '/crm/leads', label: 'CRM: Leads' },
  { path: '/crm/customers', label: 'CRM: Customers' },
  { path: '/crm/appointments', label: 'CRM: Appointments' },
  { path: '/crm/followups', label: 'CRM: Follow-ups' },
  { path: '/orders/quotations', label: 'Orders: Quotations' },
  { path: '/orders/list', label: 'Orders: List' },
  { path: '/orders/production', label: 'Orders: Production' },
  { path: '/orders/trial', label: 'Orders: Trial' },
  { path: '/orders/delivery', label: 'Orders: Delivery' },
  { path: '/measurements', label: 'Measurements' },
  { path: '/designs/library', label: 'Designs: Library' },
  { path: '/designs/upload', label: 'Designs: Upload' },
  { path: '/inventory/fabrics', label: 'Inventory: Fabrics' },
  { path: '/inventory/accessories', label: 'Inventory: Accessories' },
  { path: '/inventory/suppliers', label: 'Inventory: Suppliers' },
  { path: '/inventory/purchases', label: 'Inventory: Purchases' },
  { path: '/inventory/stock', label: 'Inventory: Stock' },
  { path: '/billing/invoice', label: 'Billing: Invoice' },
  { path: '/billing/payments', label: 'Billing: Payments' },
  { path: '/staff/employees', label: 'Staff: Employees' },
  { path: '/staff/attendance', label: 'Staff: Attendance' },
  { path: '/marketing/campaigns', label: 'Marketing: Campaigns' },
  { path: '/marketing/whatsapp', label: 'Marketing: WhatsApp' },
  { path: '/marketing/email', label: 'Marketing: Email' },
  { path: '/marketing/loyalty', label: 'Marketing: Loyalty' },
  { path: '/profile', label: 'Profile' }
];

const AVAILABLE_COLORS = [
  'bg-[#8338EC]/10 text-[#6200EA] ring-[#8338EC]/20',
  'bg-[#7A5AA8]/10 text-[#5d4485] ring-[#7A5AA8]/20',
  'bg-[#10B981]/10 text-[#234638] ring-[#10B981]/20',
  'bg-[#7209B7]/10 text-[#a3531f] ring-[#7209B7]/20',
  'bg-blue-50 text-blue-700 ring-blue-200',
  'bg-amber-50 text-amber-700 ring-amber-200',
  'bg-rose-50 text-rose-700 ring-rose-200',
  'bg-emerald-50 text-emerald-700 ring-emerald-200',
];

const MODULE_CATEGORIES = [
  'Dashboard', 'CRM', 'Orders', 'Production', 'Measurements', 'Inventory', 'Billing', 'Staff Management', 'Marketing', 'Admin Settings'
];

const RolesSettings: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    color: AVAILABLE_COLORS[0],
    permissions: MODULE_CATEGORIES.reduce((acc, mod) => ({ ...acc, [mod]: 'None' }), {} as Record<string, string>)
  });

  const { user } = useAuth();

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/settings/roles`);
      if (!res.ok) throw new Error('Failed to fetch roles');
      const loadedRoles: Role[] = await res.json();
      
      setRoles(loadedRoles);
      if (!selectedRole && loadedRoles.length > 0) {
        setSelectedRole(loadedRoles[0]);
      } else if (selectedRole) {
        const updatedSelected = loadedRoles.find(r => r.id === selectedRole.id);
        if (updatedSelected) setSelectedRole(updatedSelected);
      }
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = modalMode === 'edit' && selectedRole 
        ? `${API_BASE_URL}/settings/roles/${selectedRole.id}`
        : `${API_BASE_URL}/settings/roles`;
      
      const method = modalMode === 'edit' ? 'PUT' : 'POST';

      const res = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRole)
      });
      if (!res.ok) throw new Error(`Failed to ${modalMode} role`);
      setIsModalOpen(false);
      fetchRoles();
      setNewRole({
        name: '',
        description: '',
        color: AVAILABLE_COLORS[0],
        permissions: MODULE_CATEGORIES.reduce((acc, mod) => ({ ...acc, [mod]: 'None' }), {} as Record<string, string>)
      });
    } catch (err) {
      console.error(err);
      alert(`Failed to ${modalMode} role`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this custom role?')) return;
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/settings/roles/${roleId}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete role');
      }
      setSelectedRole(null);
      fetchRoles();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to delete role');
    }
  };


  return (
    <div className="min-h-screen bg-[#F4F3F8] text-[#16132D]">
      <div className="flex flex-col h-full space-y-6 p-6 md:p-8 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 pb-5 border-b border-[#16132D]/[0.08]">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#7209B7] mb-1.5">Settings</p>
            <h1 className="text-3xl font-serif font-semibold text-[#16132D]">Roles & Access</h1>
            <p className="text-sm text-[#16132D]/55 mt-1">Review the predefined roles and their allowed permissions.</p>
          </div>
          <button 
            onClick={() => {
              setModalMode('create');
              setNewRole({
                name: '',
                description: '',
                color: AVAILABLE_COLORS[0],
                permissions: MODULE_CATEGORIES.reduce((acc, mod) => ({ ...acc, [mod]: 'None' }), {} as Record<string, string>)
              });
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 bg-[#16132D] hover:bg-[#2a3545] text-[#F4F3F8] rounded-xl text-sm font-semibold flex items-center gap-1.5 transition shadow-md shadow-[#16132D]/10 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> New Custom Role
          </button>
        </div>

        {isLoading ? (
          <CardSkeleton />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Roles list */}
            <div className="space-y-3">
              {roles.map(role => (
                <button
                  key={role.id}
                  onClick={() => {
                    setSelectedRole(role);
                  }}
                  className={`w-full text-left p-4 rounded-2xl border transition hover:shadow-md cursor-pointer ${
                    selectedRole?.id === role.id 
                      ? 'border-[#16132D]/30 ring-2 ring-[#16132D]/10 bg-white shadow-sm shadow-[#16132D]/5' 
                      : 'bg-white border-[#16132D]/[0.08] shadow-[0_1px_3px_rgba(28,36,48,0.04)] hover:border-[#16132D]/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Shield className={`w-4 h-4 ${selectedRole?.id === role.id ? 'text-[#7209B7]' : 'text-[#16132D]/40'}`} />
                      <span className="font-bold text-[#16132D]">{role.name}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ${role.color}`}>
                      {role.users} user{role.users !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-xs text-[#16132D]/60 line-clamp-2 leading-relaxed">{role.description}</p>
                </button>
              ))}
            </div>

            {/* Role detail */}
            {selectedRole && (
              <div className="lg:col-span-2 bg-white rounded-2xl border border-[#16132D]/[0.06] shadow-[0_1px_3px_rgba(28,36,48,0.04)] overflow-hidden">
                <div className="px-6 py-5 border-b border-[#16132D]/[0.07] flex justify-between items-center bg-[#F4F3F8]/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#16132D]/5 rounded-xl">
                      <Shield className="w-5 h-5 text-[#16132D]" />
                    </div>
                    <div>
                      <h2 className="text-lg font-serif font-bold text-[#16132D]">{selectedRole.name}</h2>
                      <p className="text-xs text-[#16132D]/50 font-medium">
                        {selectedRole.is_system ? 'System Role' : 'Custom Role'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedRole.id !== 'owner' && (
                      <button 
                        onClick={() => {
                          setModalMode('edit');
                          setNewRole({
                            name: selectedRole.name,
                            description: selectedRole.description,
                            color: selectedRole.color,
                            permissions: MODULE_CATEGORIES.reduce((acc, mod) => {
                              acc[mod] = selectedRole.permissions[mod] || 'None';
                              return acc;
                            }, {} as Record<string, string>)
                          });
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-[#16132D]/60 hover:text-[#7209B7] hover:bg-[#7209B7]/10 rounded-xl transition flex items-center gap-2"
                        title="Edit Role"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {!selectedRole.is_system && (
                      <button 
                        onClick={() => handleDeleteRole(selectedRole.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                        title="Delete Custom Role"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  <p className="text-sm text-[#16132D]/70 leading-relaxed">{selectedRole.description}</p>
                  
                  <div>
                    <h3 className="text-xs font-bold text-[#16132D]/40 uppercase tracking-wider mb-4">Allowed Modules & Features</h3>
                    
                    {selectedRole.id === 'owner' ? (
                      <div className="flex items-center gap-2 px-4 py-3 bg-[#10B981]/10 rounded-xl border border-[#10B981]/20">
                        <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                        <span className="text-sm font-semibold text-[#234638]">Full System Access (All Modules)</span>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2.5">
                        {Object.entries(selectedRole.permissions).map(([moduleName, access]) => {
                          if (access === 'None') return null;
                          return (
                            <span key={moduleName} className={`px-3 py-1.5 border rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                              access === 'Full' 
                                ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20' 
                                : 'bg-[#8338EC]/10 text-[#8338EC] border-[#8338EC]/20'
                            }`}>
                              <CheckCircle2 className="w-3.5 h-3.5" /> {moduleName} ({access})
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 bg-[#F4F3F8] rounded-xl border border-[#16132D]/[0.06] flex items-start gap-3">
                    <Shield className="w-5 h-5 text-[#7209B7] flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-[#16132D]/60 font-medium leading-relaxed">
                      To edit these permissions, head over to the <a href="/settings/permissions" className="text-[#7209B7] font-semibold hover:underline">Permissions section</a>.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create / Edit Role Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-[#16132D]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-[#16132D]/[0.08] flex justify-between items-center bg-[#F4F3F8]/30">
                <h2 className="text-lg font-serif font-bold text-[#16132D]">{modalMode === 'edit' ? 'Edit Role' : 'Create New Role'}</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-[#16132D]/50 hover:text-[#16132D] hover:bg-[#16132D]/5 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                <form id="roleForm" onSubmit={handleSaveRole} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold tracking-wide text-[#16132D]/60 uppercase mb-1.5">Role Name</label>
                      <input 
                        type="text"
                        required
                        disabled={modalMode === 'edit' && selectedRole?.is_system}
                        value={newRole.name}
                        onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                        className="w-full px-4 py-2.5 bg-[#F4F3F8]/50 border border-[#16132D]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7209B7]/20 focus:border-[#7209B7]/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="e.g. Senior Tailor"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold tracking-wide text-[#16132D]/60 uppercase mb-1.5">Description</label>
                      <textarea 
                        required
                        value={newRole.description}
                        onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                        className="w-full px-4 py-2.5 bg-[#F4F3F8]/50 border border-[#16132D]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7209B7]/20 focus:border-[#7209B7]/30 transition resize-none h-20"
                        placeholder="Briefly describe what this role does..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold tracking-wide text-[#16132D]/60 uppercase mb-2">Color Theme</label>
                      <div className="flex flex-wrap gap-2">
                        {AVAILABLE_COLORS.map(color => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setNewRole({...newRole, color})}
                            className={`w-8 h-8 rounded-full ring-2 ring-offset-2 transition ${color} ${newRole.color === color ? 'ring-offset-[#F4F3F8] shadow-sm scale-110' : 'ring-transparent opacity-60 hover:opacity-100 hover:scale-105'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold tracking-wide text-[#16132D]/60 uppercase mb-3 border-t border-[#16132D]/[0.08] pt-6">Module Permissions</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {MODULE_CATEGORIES.map(mod => (
                        <div key={mod} className="flex flex-col gap-1.5 p-3 rounded-xl border border-[#16132D]/[0.06] bg-[#F4F3F8]/30">
                          <span className="text-sm font-semibold text-[#16132D]">{mod}</span>
                          <div className="flex gap-2">
                            {['Full', 'Read', 'None'].map(level => (
                              <label key={level} className="flex items-center gap-1.5 text-xs text-[#16132D]/70 cursor-pointer">
                                <input 
                                  type="radio" 
                                  name={`perm-${mod}`}
                                  value={level}
                                  checked={newRole.permissions[mod] === level}
                                  onChange={() => setNewRole({
                                    ...newRole,
                                    permissions: { ...newRole.permissions, [mod]: level }
                                  })}
                                  className="w-3.5 h-3.5 text-[#7209B7] focus:ring-[#7209B7]/20"
                                />
                                {level}
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="px-6 py-4 border-t border-[#16132D]/[0.08] bg-[#F4F3F8]/30 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-[#16132D]/60 hover:text-[#16132D] hover:bg-[#16132D]/5 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="roleForm"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#7209B7] hover:bg-[#5a0791] text-white text-sm font-semibold rounded-xl transition shadow-md shadow-[#7209B7]/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {modalMode === 'edit' ? 'Save Changes' : 'Create Role'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RolesSettings;
