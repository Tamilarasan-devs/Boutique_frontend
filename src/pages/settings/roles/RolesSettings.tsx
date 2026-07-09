import React, { useState, useEffect } from 'react';
import { Plus, Shield, Edit2, Trash2, CheckCircle2, Save, X, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../../../constants';
import { useAuth } from '../../../context/AuthContext';
import { fetchWithAuth } from '../../../api/client';

interface Role {
  id: string;
  name: string;
  description: string;
  users: number;
  color: string;
  permissions: Record<string, 'Full' | 'Read' | 'None'>;
}

const roleMetadata: Record<string, { name: string, description: string, color: string, users: number }> = {
  owner: { name: 'Owner', description: 'Full system access. Can manage users, settings, and all data.', users: 1, color: 'bg-[#8338EC]/10 text-[#6200EA] ring-[#8338EC]/20' },
  manager: { name: 'Manager', description: 'Manages production, measurements, inventory and orders.', users: 2, color: 'bg-[#7A5AA8]/10 text-[#5d4485] ring-[#7A5AA8]/20' },
  sales_staff: { name: 'Sales Staff', description: 'Handles leads, customers, appointments and follow-ups.', users: 3, color: 'bg-[#10B981]/10 text-[#234638] ring-[#10B981]/20' },
  tailor: { name: 'Tailor', description: 'Views production orders and measurements.', users: 4, color: 'bg-[#7209B7]/10 text-[#a3531f] ring-[#7209B7]/20' },
  receptionist: { name: 'Receptionist', description: 'Handles front desk CRM and appointments.', users: 1, color: 'bg-blue-50 text-blue-700 ring-blue-200' },
};

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

const RolesSettings: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/settings/roles`);
      if (!res.ok) throw new Error('Failed to fetch roles');
      const permissionsMap = await res.json();
      
      const loadedRoles: Role[] = Object.keys(roleMetadata).map(id => ({
        id,
        ...roleMetadata[id],
        permissions: permissionsMap[id] || {}
      }));
      
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


  return (
    <div className="min-h-screen bg-[#F4F3F8] text-[#16132D]">
      <div className="flex flex-col h-full space-y-6 p-6 md:p-8 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 pb-5 border-b border-[#16132D]/[0.08]">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#7209B7] mb-1.5">Settings</p>
            <h1 className="text-3xl font-serif font-semibold text-[#16132D]">Roles & Access</h1>
            <p className="text-sm text-[#16132D]/55 mt-1">Review the predefined roles and their allowed permissions.</p>
          </div>
          <button className="px-4 py-2.5 bg-[#16132D] hover:bg-[#2a3545] text-[#F4F3F8] rounded-xl text-sm font-semibold flex items-center gap-1.5 transition shadow-md shadow-[#16132D]/10 self-start sm:self-auto cursor-not-allowed opacity-70" title="Custom roles coming soon">
            <Plus className="w-4 h-4" /> New Custom Role
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#7209B7]" />
          </div>
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
                      <p className="text-xs text-[#16132D]/50 font-medium">System Role</p>
                    </div>
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
      </div>
    </div>
  );
};

export default RolesSettings;
