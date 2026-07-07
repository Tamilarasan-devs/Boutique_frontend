import React, { useState } from 'react';
import { Star, Gift, Plus, Search, TrendingUp } from 'lucide-react';

interface LoyaltyMember {
  id: string;
  name: string;
  phone: string;
  points: number;
  tier: 'New' | 'Regular' | 'Silver' | 'Gold';
  totalSpend: number;
  joinDate: string;
}

const mockMembers: LoyaltyMember[] = [
  { id: 'LYL-001', name: 'Priyanka Sen', phone: '+91 98123 45678', points: 850, tier: 'Gold', totalSpend: 85000, joinDate: '2024-03-15' },
  { id: 'LYL-002', name: 'Anjali Sharma', phone: '+91 98765 43210', points: 620, tier: 'Gold', totalSpend: 62000, joinDate: '2024-06-20' },
  { id: 'LYL-003', name: 'Sanjana Roy', phone: '+91 95551 12233', points: 480, tier: 'Silver', totalSpend: 48000, joinDate: '2025-01-10' },
  { id: 'LYL-004', name: 'Rohan Mehra', phone: '+91 94444 88888', points: 350, tier: 'Silver', totalSpend: 35000, joinDate: '2025-04-08' },
  { id: 'LYL-005', name: 'Meera Nair', phone: '+91 92222 33334', points: 124, tier: 'Regular', totalSpend: 12400, joinDate: '2026-02-22' },
];

const tierConfig: Record<LoyaltyMember['tier'], { color: string; pointsForNext: number; next: string }> = {
  Gold: { color: 'bg-amber-50 text-amber-700 border-amber-100', pointsForNext: 0, next: 'Max Tier' },
  Silver: { color: 'bg-slate-100 text-slate-600 border-slate-200', pointsForNext: 500, next: 'Gold at 500 pts' },
  Regular: { color: 'bg-blue-50 text-blue-700 border-blue-100', pointsForNext: 300, next: 'Silver at 300 pts' },
  New: { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', pointsForNext: 100, next: 'Regular at 100 pts' },
};

const Loyalty: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const filtered = mockMembers.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.phone.includes(searchTerm));
  const totalPoints = mockMembers.reduce((s, m) => s + m.points, 0);

  return (
    <div className="flex flex-col h-full space-y-5 p-6 bg-slate-50/50">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Loyalty Programme</h1>
          <p className="text-sm text-slate-500 mt-1">Manage customer reward points, loyalty tiers, and redeem offers.</p>
        </div>
        <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 transition shadow-sm">
          <Plus className="w-4 h-4" /> Add Member
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div><span className="text-xs font-bold text-slate-400 uppercase">Total Members</span><h3 className="text-2xl font-black text-slate-900 mt-1">{mockMembers.length}</h3></div>
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100"><Star className="w-6 h-6 text-blue-600" /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div><span className="text-xs font-bold text-slate-400 uppercase">Total Points Issued</span><h3 className="text-2xl font-black text-amber-600 mt-1">{totalPoints.toLocaleString()}</h3></div>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-100"><Gift className="w-6 h-6 text-amber-500" /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div><span className="text-xs font-bold text-slate-400 uppercase">Gold Members</span><h3 className="text-2xl font-black text-slate-900 mt-1">{mockMembers.filter(m => m.tier === 'Gold').length}</h3></div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100"><TrendingUp className="w-6 h-6 text-emerald-600" /></div>
        </div>
      </div>

      <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-2.5 w-1/3 shadow-sm">
        <Search className="w-4 h-4 text-slate-400 mr-2" />
        <input type="text" placeholder="Search members..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent border-none outline-none text-sm text-slate-800 placeholder-slate-400 w-full" />
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold">
              <th className="py-4 px-6">Member</th>
              <th className="py-4 px-6 text-center">Points</th>
              <th className="py-4 px-6">Tier</th>
              <th className="py-4 px-6 text-right">Total Spend</th>
              <th className="py-4 px-6">Progress</th>
              <th className="py-4 px-6">Member Since</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(m => {
              const cfg = tierConfig[m.tier];
              const pct = m.tier === 'Gold' ? 100 : Math.min(100, Math.round((m.points / cfg.pointsForNext) * 100));
              return (
                <tr key={m.id} className="hover:bg-slate-50/40 transition">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                        {m.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{m.name}</div>
                        <div className="text-xs text-slate-400">{m.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-lg font-black text-amber-600">{m.points}</span>
                    <span className="text-xs text-slate-400 ml-1">pts</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>{m.tier}</span>
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-slate-900">₹{m.totalSpend.toLocaleString('en-IN')}</td>
                  <td className="py-4 px-6 w-40">
                    <div className="space-y-1">
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold">{m.tier === 'Gold' ? '🏆 Top Tier' : cfg.next}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-500">{m.joinDate}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Loyalty;
