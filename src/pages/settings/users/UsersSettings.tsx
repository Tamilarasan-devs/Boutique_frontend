import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Loader2, Shield, Crown } from 'lucide-react';
import { authApi } from '../../../api/authApi';
import { API_BASE_URL } from '../../../constants';
import { fetchWithAuth } from '../../../api/client';
import { TableSkeleton, CardSkeleton } from '@/components/ui/Skeleton';

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
}

const UsersSettings: React.FC = () => {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [selected, setSelected] = useState<StaffUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffUser | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('sales_staff');

  useEffect(() => { 
    fetchUsers(); 
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await authApi.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/settings/roles`);
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
        if (data.length > 0) {
          setRole(data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setSelected(null);
    setName(''); setEmail(''); setPassword(''); setRole('sales_staff');
    setError('');
  };

  const openEditModal = (user: StaffUser) => {
    setModalMode('edit');
    setSelected(user);
    setName(user.name); setEmail(user.email); setPassword(''); setRole(user.role);
    setError('');
  };

  const closeModal = () => { setModalMode(null); setSelected(null); setError(''); };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setIsSaving(true); setError('');
    try {
      const { user: newUser } = await authApi.createUser({ name, email, password, role });
      setUsers([newUser, ...users]);
      closeModal();
    } catch (err: any) {
      setError(err.message || 'Failed to create user.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setIsSaving(true); setError('');
    try {
      const { user: updated } = await authApi.updateUser(selected.id, { name, role });
      setUsers(users.map(u => u.id === updated.id ? { ...u, ...updated } : u));
      closeModal();
    } catch (err: any) {
      setError(err.message || 'Failed to update user.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (user: StaffUser) => {
    try {
      const { user: updated } = await authApi.updateUser(user.id, { is_active: !user.is_active });
      setUsers(users.map(u => u.id === user.id ? { ...u, is_active: updated.is_active } : u));
    } catch (err) {
      console.error('Failed to toggle user status:', err);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await authApi.deleteUser(deleteTarget.id);
      setUsers(users.filter(u => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete user:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F3F8] text-[var(--primary-hex)]">
      <div className="flex flex-col h-full space-y-6 p-6 md:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 pb-5 border-b border-[var(--primary-hex)]/[0.08]">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[var(--primary-hex)] mb-1.5">Settings</p>
            <h1 className="text-3xl font-serif font-semibold text-[var(--primary-hex)]">Staff Users</h1>
            <p className="text-sm text-[var(--primary-hex)]/55 mt-1">Manage staff accounts and their access roles.</p>
          </div>
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-[var(--primary-hex)] hover:bg-[#2a3545] text-[#F4F3F8] rounded-xl text-sm font-semibold flex items-center gap-1.5 transition shadow-md shadow-[var(--primary-hex)]/10 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Staff User
          </button>
        </div>

        {/* Role Legend */}
        <div className="flex flex-wrap gap-2">
          {roles.map(role => (
            <span key={role.id} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${role.color}`}>
              <Shield className="w-3 h-3" />{role.name}
            </span>
          ))}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-[var(--primary-hex)]/[0.06] shadow-sm overflow-hidden">
          {isLoading ? (
          <TableSkeleton />
        ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-[var(--primary-hex)]/40 gap-2">
              <Shield className="w-8 h-8 opacity-40" />
              <p className="text-sm font-medium">No staff users yet</p>
              <p className="text-xs">Add a staff member to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--primary-hex)]/[0.08] bg-[#F4F3F8]/70 text-[var(--primary-hex)]/40 font-semibold text-xs uppercase tracking-wide">
                    <th className="py-4 px-6">Staff Member</th>
                    <th className="py-4 px-6">Role</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Added</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--primary-hex)]/[0.05]">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-[#F4F3F8]/60 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[var(--primary-hex)]/[0.06] border border-[var(--primary-hex)]/[0.08] text-[var(--primary-hex)]/70 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-[var(--primary-hex)]">{u.name}</p>
                            <p className="text-xs text-[var(--primary-hex)]/40">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {(() => {
                          const userRole = roles.find(r => r.id === u.role);
                          return (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${userRole?.color || 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
                              <Shield className="w-3 h-3" />
                              {userRole?.name || u.role}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleToggleActive(u)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 cursor-pointer transition ${u.is_active
                              ? 'bg-[#10B981]/10 text-[#234638] ring-[#10B981]/20 hover:bg-[#F43F5E]/10 hover:text-[#F43F5E] hover:ring-[#F43F5E]/20'
                              : 'bg-[#F43F5E]/10 text-[#F43F5E] ring-[#F43F5E]/20 hover:bg-[#10B981]/10 hover:text-[#234638] hover:ring-[#10B981]/20'
                            }`}
                          title={u.is_active ? 'Click to deactivate' : 'Click to activate'}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-[#10B981]' : 'bg-[#F43F5E]'}`} />
                          {u.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-xs text-[var(--primary-hex)]/40 font-medium">
                        {new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-2 hover:bg-[var(--primary-hex)]/10 rounded-lg text-[var(--primary-hex)]/40 hover:text-[var(--primary-hex)] transition cursor-pointer"
                            title="Edit user"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(u)}
                            className="p-2 hover:bg-[#F43F5E]/10 rounded-lg text-[var(--primary-hex)]/40 hover:text-[#F43F5E] transition cursor-pointer"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-[var(--primary-hex)]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[var(--primary-hex)]/[0.06] shadow-2xl shadow-[var(--primary-hex)]/20 w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 border-b border-[var(--primary-hex)]/[0.08] flex justify-between items-center">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[var(--primary-hex)] mb-1">
                  {modalMode === 'add' ? 'New Staff Member' : 'Edit Access'}
                </p>
                <h3 className="font-serif font-semibold text-[var(--primary-hex)] text-lg">
                  {modalMode === 'add' ? 'Create Staff Account' : 'Update Staff User'}
                </h3>
              </div>
              <button onClick={closeModal} className="p-2 rounded-lg text-[var(--primary-hex)]/35 hover:text-[var(--primary-hex)] hover:bg-[var(--primary-hex)]/[0.05] transition cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={modalMode === 'add' ? handleCreateUser : handleUpdateUser} className="p-6 space-y-4">
              {error && (
                <div className="px-4 py-3 bg-[#F43F5E]/[0.08] border border-[#F43F5E]/20 rounded-xl text-sm text-[#F43F5E]">{error}</div>
              )}
              <div>
                <label className="block text-xs font-bold text-[var(--primary-hex)]/45 uppercase tracking-wider mb-1.5">Full Name *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Ritu Sharma"
                  className="w-full px-4 py-2.5 border border-[var(--primary-hex)]/[0.1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-hex)]/25 text-sm bg-white" />
              </div>
              {modalMode === 'add' && (
                <div>
                  <label className="block text-xs font-bold text-[var(--primary-hex)]/45 uppercase tracking-wider mb-1.5">Email Address *</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="staff@boutique.com"
                    className="w-full px-4 py-2.5 border border-[var(--primary-hex)]/[0.1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-hex)]/25 text-sm bg-white" />
                </div>
              )}
              {modalMode === 'add' && (
                <div>
                  <label className="block text-xs font-bold text-[var(--primary-hex)]/45 uppercase tracking-wider mb-1.5">Temporary Password *</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min. 6 characters"
                    className="w-full px-4 py-2.5 border border-[var(--primary-hex)]/[0.1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-hex)]/25 text-sm bg-white" />
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-[var(--primary-hex)]/45 uppercase tracking-wider mb-1.5">Role *</label>
                <select value={role} onChange={e => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[var(--primary-hex)]/[0.1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-hex)]/25 text-sm bg-white cursor-pointer">
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name} — {r.description}</option>
                  ))}
                </select>
              </div>
              <button type="submit" disabled={isSaving}
                className="w-full py-2.5 bg-[var(--primary-hex)] hover:bg-[#2a3545] disabled:opacity-60 text-[#F4F3F8] rounded-lg text-sm font-semibold transition mt-2 flex items-center justify-center gap-2 cursor-pointer">
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSaving ? 'Saving…' : modalMode === 'add' ? 'Create Account' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-[var(--primary-hex)]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[var(--primary-hex)]/[0.06] shadow-2xl shadow-[var(--primary-hex)]/20 w-full max-w-sm p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F43F5E]/10 border border-[#F43F5E]/15 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-[#F43F5E]" />
            </div>
            <div>
              <h3 className="font-serif font-semibold text-[var(--primary-hex)] text-lg">Delete User?</h3>
              <p className="text-sm text-[var(--primary-hex)]/55 mt-1">
                Remove <span className="font-semibold text-[var(--primary-hex)]">{deleteTarget.name}</span> from your staff roster? They will lose all access immediately.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 bg-[#F4F3F8] hover:bg-[var(--primary-hex)]/[0.04] border border-[var(--primary-hex)]/[0.08] rounded-xl text-sm font-semibold text-[var(--primary-hex)]/80 transition cursor-pointer">
                Cancel
              </button>
              <button onClick={handleDeleteUser} disabled={isDeleting}
                className="flex-1 py-2.5 bg-[#F43F5E] hover:bg-[#7a2e34] disabled:opacity-60 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition cursor-pointer">
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isDeleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersSettings;
