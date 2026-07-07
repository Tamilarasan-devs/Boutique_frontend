import React, { useState } from 'react';
import { Plus, Shield, Edit2, Trash2, CheckCircle2 } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string;
  users: number;
  color: string;
  permissions: string[];
}

const defaultRoles: Role[] = [
  {
    id: 'owner', name: 'Owner', description: 'Full system access. Can manage users, settings, and all data.', users: 1, color: 'bg-[#8338EC]/10 text-[#6200EA] ring-[#8338EC]/20',
    permissions: ['All Modules', 'User Management', 'Settings', 'Reports', 'Delete Records', 'Billing'],
  },
  {
    id: 'manager', name: 'Manager', description: 'Manages production, measurements, inventory and orders.', users: 2, color: 'bg-[#7A5AA8]/10 text-[#5d4485] ring-[#7A5AA8]/20',
    permissions: ['CRM', 'Orders', 'Production', 'Inventory', 'Measurements', 'Staff Management'],
  },
  {
    id: 'sales_staff', name: 'Sales Staff', description: 'Handles leads, customers, appointments and follow-ups.', users: 3, color: 'bg-[#10B981]/10 text-[#234638] ring-[#10B981]/20',
    permissions: ['Leads', 'Customers', 'Appointments', 'Followups', 'Orders', 'Billing'],
  },
  {
    id: 'tailor', name: 'Tailor', description: 'Views production orders and measurements.', users: 4, color: 'bg-[#7209B7]/10 text-[#a3531f] ring-[#7209B7]/20',
    permissions: ['Orders', 'Production', 'Measurements', 'Inventory'],
  },
  {
    id: 'receptionist', name: 'Receptionist', description: 'Handles front desk CRM and appointments.', users: 1, color: 'bg-blue-50 text-blue-700 ring-blue-200',
    permissions: ['Leads', 'Customers', 'Appointments', 'Quotations'],
  },
];

const RolesSettings: React.FC = () => {
  const [roles] = useState<Role[]>(defaultRoles);
  const [selectedRole, setSelectedRole] = useState<Role | null>(defaultRoles[0]);

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Roles list */}
          <div className="space-y-3">
            {roles.map(role => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role)}
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
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-[#16132D]/5 rounded-xl text-[#16132D]/40 hover:text-[#16132D] transition cursor-not-allowed opacity-50"><Edit2 className="w-4 h-4" /></button>
                  <button className="p-2 hover:bg-[#F43F5E]/10 rounded-xl text-[#16132D]/40 hover:text-[#F43F5E] transition cursor-not-allowed opacity-50"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <p className="text-sm text-[#16132D]/70 leading-relaxed">{selectedRole.description}</p>
                
                <div>
                  <h3 className="text-xs font-bold text-[#16132D]/40 uppercase tracking-wider mb-3">Allowed Modules & Features</h3>
                  <div className="flex flex-wrap gap-2.5">
                    {selectedRole.permissions.map(p => (
                      <span key={p} className="px-3 py-1.5 bg-[#16132D]/5 text-[#16132D] border border-[#16132D]/10 rounded-lg text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" /> {p}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="p-4 bg-[#F4F3F8] rounded-xl border border-[#16132D]/[0.06] flex items-start gap-3">
                  <Shield className="w-5 h-5 text-[#7209B7] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[#16132D]/60 font-medium leading-relaxed">
                    This role is currently assigned to <span className="font-bold text-[#16132D]">{selectedRole.users} user{selectedRole.users !== 1 ? 's' : ''}</span>. 
                    System roles cannot be edited or deleted. Head over to the <a href="/settings/users" className="text-[#7209B7] font-semibold hover:underline">Users section</a> to reassign roles.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RolesSettings;
