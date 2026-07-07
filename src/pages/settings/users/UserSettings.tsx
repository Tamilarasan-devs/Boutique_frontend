import React, { useState } from 'react';
import { Plus, Search, Mail, Phone, Shield, Edit2, Trash2 } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: 'Active' | 'Inactive';
  joinDate: string;
  avatar: string;
}

const mockUsers: User[] = [
  { id: 'USR-001', name: 'Nivi Sharma', email: 'nivi@creativeboutique.in', phone: '+91 98765 43210', role: 'Admin', status: 'Active', joinDate: '2024-01-01', avatar: 'NS' },
  { id: 'USR-002', name: 'Ramesh Singh', email: 'ramesh@creativeboutique.in', phone: '+91 97654 32109', role: 'Tailor Manager', status: 'Active', joinDate: '2024-03-12', avatar: 'RS' },
  { id: 'USR-003', name: 'Priya Menon', email: 'priya@creativeboutique.in', phone: '+91 96543 21098', role: 'CRM Executive', status: 'Active', joinDate: '2024-06-01', avatar: 'PM' },
  { id: 'USR-004', name: 'Arun Das', email: 'arun@creativeboutique.in', phone: '+91 95432 10987', role: 'Billing Staff', status: 'Inactive', joinDate: '2023-11-20', avatar: 'AD' },
];

const avatarColors = ['bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700', 'bg-purple-100 text-purple-700', 'bg-amber-100 text-amber-700'];

const UserSettings: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStatus = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u));
  };

  return (
    <div className="flex flex-col h-full space-y-6 p-6 bg-slate-50/50">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Users</h1>
          <p className="text-sm text-slate-500 mt-1">Manage system users, assign roles, and control account access.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 transition shadow-sm">
          <Plus className="w-4 h-4" /> Invite User
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
          <span className="text-2xl font-black text-slate-900">{users.length}</span>
          <p className="text-xs font-bold text-slate-400 mt-0.5">Total Users</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
          <span className="text-2xl font-black text-emerald-600">{users.filter(u => u.status === 'Active').length}</span>
          <p className="text-xs font-bold text-slate-400 mt-0.5">Active</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
          <span className="text-2xl font-black text-rose-500">{users.filter(u => u.status === 'Inactive').length}</span>
          <p className="text-xs font-bold text-slate-400 mt-0.5">Inactive</p>
        </div>
      </div>

      <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-2.5 w-1/3 shadow-sm">
        <Search className="w-4 h-4 text-slate-400 mr-2" />
        <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent border-none outline-none text-sm text-slate-800 placeholder-slate-400 w-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((u, i) => (
          <div key={u.id} className={`bg-white p-5 rounded-2xl border shadow-sm space-y-4 hover:shadow-md transition ${u.status === 'Inactive' ? 'opacity-60 border-slate-100' : 'border-slate-100'}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm ${avatarColors[i % avatarColors.length]}`}>
                  {u.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{u.name}</h3>
                  <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded font-bold">
                    {u.role}
                  </span>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${u.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {u.status}
              </span>
            </div>
            <div className="space-y-1.5 text-xs font-medium text-slate-500">
              <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {u.email}</p>
              <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {u.phone}</p>
              <p className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-slate-400" /> Joined {u.joinDate}</p>
            </div>
            <div className="flex gap-2 pt-3 border-t border-slate-100">
              <button className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition border border-slate-100">
                <Edit2 className="w-3 h-3" /> Edit
              </button>
              <button onClick={() => toggleStatus(u.id)} className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition border ${u.status === 'Active' ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-100' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-100'}`}>
                {u.status === 'Active' ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Invite New User</h3>
            <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label><input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email</label><input type="email" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Role</label>
              <select className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm">
                <option>Admin</option>
                <option>Tailor Manager</option>
                <option>CRM Executive</option>
                <option>Billing Staff</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition">Cancel</button>
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-sm">Send Invite</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSettings;
