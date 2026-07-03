import React, { useState } from 'react';
import { Plus, Search, Users, Megaphone, CheckCircle2, Clock } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  channel: 'WhatsApp' | 'Email' | 'SMS';
  audience: number;
  status: 'Draft' | 'Running' | 'Completed' | 'Paused';
  date: string;
  openRate?: number;
}

const mockCampaigns: Campaign[] = [
  { id: 'CMP-001', name: 'Summer Collection Launch', channel: 'WhatsApp', audience: 320, status: 'Completed', date: '2026-06-15', openRate: 68 },
  { id: 'CMP-002', name: 'Eid Mubarak Promo Offer', channel: 'SMS', audience: 540, status: 'Completed', date: '2026-06-10', openRate: 45 },
  { id: 'CMP-003', name: 'Bridal Season Newsletter', channel: 'Email', audience: 210, status: 'Running', date: '2026-06-25', openRate: 38 },
  { id: 'CMP-004', name: 'Loyalty Reward Reminder', channel: 'WhatsApp', audience: 180, status: 'Draft', date: '2026-06-28' },
];

const channelColor: Record<Campaign['channel'], string> = {
  WhatsApp: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Email: 'bg-blue-50 text-blue-700 border-blue-100',
  SMS: 'bg-amber-50 text-amber-700 border-amber-100',
};

const Campaigns: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const filtered = mockCampaigns.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full space-y-5 p-6 bg-slate-50/50">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Campaigns</h1>
          <p className="text-sm text-slate-500 mt-1">Create and monitor WhatsApp, Email, and SMS marketing campaigns.</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 transition shadow-sm">
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-xl"><Megaphone className="w-5 h-5 text-blue-600" /></div>
          <div><span className="text-xs font-bold text-slate-400 uppercase block">Total Campaigns</span><span className="text-lg font-black text-slate-900">{mockCampaigns.length}</span></div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-xl"><CheckCircle2 className="w-5 h-5 text-emerald-600" /></div>
          <div><span className="text-xs font-bold text-slate-400 uppercase block">Completed</span><span className="text-lg font-black text-slate-900">{mockCampaigns.filter(c => c.status === 'Completed').length}</span></div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-purple-50 rounded-xl"><Users className="w-5 h-5 text-purple-600" /></div>
          <div><span className="text-xs font-bold text-slate-400 uppercase block">Total Reach</span><span className="text-lg font-black text-slate-900">{mockCampaigns.reduce((s, c) => s + c.audience, 0)}</span></div>
        </div>
      </div>

      <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-2.5 w-1/3 shadow-sm">
        <Search className="w-4 h-4 text-slate-400 mr-2" />
        <input type="text" placeholder="Search campaigns..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent border-none outline-none text-sm text-slate-800 placeholder-slate-400 w-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map(c => (
          <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-slate-800">{c.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{c.date}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                c.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                c.status === 'Running' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                c.status === 'Paused' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                'bg-slate-50 text-slate-600 border-slate-200'
              }`}>{c.status}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${channelColor[c.channel]}`}>{c.channel}</span>
              <span className="text-xs text-slate-500 font-semibold flex items-center gap-1"><Users className="w-3 h-3" /> {c.audience} recipients</span>
            </div>
            {c.openRate !== undefined && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-500">
                  <span>Open Rate</span><span className="font-bold text-slate-800">{c.openRate}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${c.openRate}%` }} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Campaigns;
