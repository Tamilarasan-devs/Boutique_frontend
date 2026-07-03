import React, { useState } from 'react';
import { MessageSquare, Send, Plus, User } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  message: string;
  category: string;
}

const mockTemplates: Template[] = [
  { id: '1', name: 'Order Ready Notification', category: 'Transactional', message: 'Hi {{name}}, your order {{orderId}} is ready for pickup! Please visit us at your convenience. 🎉' },
  { id: '2', name: 'Trial Reminder', category: 'Reminder', message: 'Dear {{name}}, your trial appointment is scheduled for {{date}} at {{time}}. Please confirm your attendance. 👗' },
  { id: '3', name: 'Festival Offer', category: 'Promotional', message: 'Hello {{name}}! Eid Mubarak 🌙 Enjoy 15% off your next order. Use code EID15. Valid till {{date}}.' },
];

const Whatsapp: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [recipient, setRecipient] = useState('');

  return (
    <div className="flex flex-col h-full space-y-5 p-6 bg-slate-50/50">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">WhatsApp Templates</h1>
          <p className="text-sm text-slate-500 mt-1">Manage message templates for order updates, reminders, and promotions.</p>
        </div>
        <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 transition shadow-sm">
          <Plus className="w-4 h-4" /> New Template
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Templates List */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Templates</h2>
          {mockTemplates.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTemplate(t)}
              className={`w-full text-left bg-white p-5 rounded-2xl border shadow-sm space-y-2 hover:shadow-md transition ${selectedTemplate?.id === t.id ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-slate-100'}`}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800">{t.name}</h3>
                <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded">{t.category}</span>
              </div>
              <p className="text-sm text-slate-500 line-clamp-2">{t.message}</p>
            </button>
          ))}
        </div>

        {/* Preview & Send */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Preview & Send</h2>
          {selectedTemplate ? (
            <>
              {/* WhatsApp Chat Mockup */}
              <div className="bg-[#e5ddd5] rounded-xl p-4 min-h-[150px] flex items-end">
                <div className="bg-white rounded-2xl rounded-bl-sm p-3.5 max-w-[85%] shadow-sm">
                  <p className="text-sm text-slate-700">{selectedTemplate.message}</p>
                  <p className="text-[10px] text-slate-400 text-right mt-1">12:30 PM ✓✓</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Recipient Phone</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold flex items-center gap-1.5 transition">
                    <Send className="w-4 h-4" /> Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2">
              <MessageSquare className="w-10 h-10" />
              <p className="text-sm font-semibold">Select a template to preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Whatsapp;
