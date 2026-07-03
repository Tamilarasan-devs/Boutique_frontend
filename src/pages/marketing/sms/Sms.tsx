import React, { useState } from 'react';
import { Plus, Send, MessageSquare } from 'lucide-react';

const smsTemplates = [
  { id: '1', name: 'Order Ready', message: 'Hi {{name}}, your order is ready for pickup at Creative Boutique. - Team CB' },
  { id: '2', name: 'Appointment Reminder', message: 'Reminder: Your trial fitting is on {{date}} at {{time}}. Please arrive on time. - Creative Boutique' },
  { id: '3', name: 'Festival Offer', message: '🎉 Special offer! Get 10% off on all new orders this festive season. Call us: 98765XXXXX - Creative Boutique' },
];

const Sms: React.FC = () => {
  const [selected, setSelected] = useState(smsTemplates[0]);
  const [message, setMessage] = useState(smsTemplates[0].message);
  const [phone, setPhone] = useState('');

  const charCount = message.length;
  const smsCount = Math.ceil(charCount / 160);

  return (
    <div className="flex flex-col h-full space-y-5 p-6 bg-slate-50/50">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">SMS Templates</h1>
          <p className="text-sm text-slate-500 mt-1">Create, manage, and dispatch SMS notifications to customers.</p>
        </div>
        <button className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 transition shadow-sm">
          <Plus className="w-4 h-4" /> New Template
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Template List */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Templates</h2>
          {smsTemplates.map(t => (
            <button
              key={t.id}
              onClick={() => { setSelected(t); setMessage(t.message); }}
              className={`w-full text-left p-4 rounded-xl border transition ${selected.id === t.id ? 'border-amber-300 bg-amber-50/60 ring-2 ring-amber-100' : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                <p className="text-sm font-bold text-slate-800">{t.name}</p>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2">{t.message}</p>
            </button>
          ))}
        </div>

        {/* Compose */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Send SMS</h2>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Recipient Phone</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message</label>
              <span className="text-xs text-slate-400 font-semibold">{charCount} chars · {smsCount} SMS</span>
            </div>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
          </div>
          <div className="flex justify-end">
            <button className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-bold flex items-center gap-1.5 transition shadow-sm">
              <Send className="w-4 h-4" /> Send SMS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sms;
