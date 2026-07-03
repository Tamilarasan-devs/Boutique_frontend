import React, { useState, useEffect } from 'react';
import { Search, Calendar as CalendarIcon, Clock, CheckCircle, XCircle, MessageSquare, Plus, X, Trash2, AlertTriangle } from 'lucide-react';
import { trialApi } from '../../../api/trialApi';

interface TrialItem {
  id: string;
  orderId: string;
  customerName: string;
  garment: string;
  date: string;
  time: string;
  tailor: string;
  alterationNotes: string;
  status: 'Scheduled' | 'Passed' | 'Alterations Needed' | 'Missed';
}

const statusStyles: Record<string, string> = {
  'Scheduled': 'bg-[#7A5AA8]/10 text-[#5d4485]',
  'Passed': 'bg-[#2F5D4F]/10 text-[#234638]',
  'Alterations Needed': 'bg-[#C99A3E]/10 text-[#8a6a25]',
  'Missed': 'bg-[#9B3B43]/10 text-[#7a2e34]',
};

const Trial: React.FC = () => {
  const [trials, setTrials] = useState<TrialItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [orderId, setOrderId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [garment, setGarment] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [tailor, setTailor] = useState('');
  const [alterationNotes, setAlterationNotes] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await trialApi.getTrials();
        const formatted = data.map((item: any) => ({
          id: `TRL-${item.id}`,
          orderId: item.order_id || '',
          customerName: item.customer_name,
          garment: item.garment,
          date: new Date(item.date).toISOString().split('T')[0],
          time: item.time,
          tailor: item.tailor || '',
          alterationNotes: item.alteration_notes || '',
          status: item.status,
        }));
        setTrials(formatted);
      } catch (error) {
        console.error('Error loading trials:', error);
      }
    };
    fetchData();
  }, []);

  const filtered = trials.filter(t =>
    t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.garment.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.orderId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !garment || !date || !time) return;

    try {
      const response = await trialApi.addTrial({
        order_id: orderId, customer_name: customerName, garment,
        date, time, tailor, alteration_notes: alterationNotes,
      });
      const t = response.trial;
      setTrials([{
        id: `TRL-${t.id}`, orderId: t.order_id || '', customerName: t.customer_name,
        garment: t.garment, date: new Date(t.date).toISOString().split('T')[0],
        time: t.time, tailor: t.tailor || '', alterationNotes: t.alteration_notes || '', status: t.status,
      }, ...trials]);
      setOrderId(''); setCustomerName(''); setGarment(''); setDate(''); setTime(''); setTailor(''); setAlterationNotes('');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating trial:', error);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await trialApi.updateStatus(id, status);
      setTrials(trials.map(t => t.id === id ? { ...t, status: status as TrialItem['status'] } : t));
    } catch (error) {
      console.error('Error updating trial status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await trialApi.deleteTrial(id);
      setTrials(trials.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting trial:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F1] text-[#1C2430]">
      <div className="flex flex-col h-full space-y-5 p-6 md:p-8 max-w-[1500px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 pb-5 border-b border-[#1C2430]/[0.08]">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#C1652F] mb-1.5">Fittings</p>
            <h1 className="text-3xl md:text-[2rem] font-serif font-semibold tracking-tight text-[#1C2430]">Trial Sessions</h1>
            <p className="text-sm text-[#1C2430]/55 mt-1">Schedule fittings and capture alteration feedback from customers.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2.5 bg-[#1C2430] hover:bg-[#2a3545] text-[#FAF7F1] rounded-xl text-sm font-semibold flex items-center gap-1.5 transition shadow-md shadow-[#1C2430]/10 self-start sm:self-auto">
            <Plus className="w-4 h-4" /> Schedule Trial
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center bg-white border border-[#1C2430]/[0.08] rounded-xl px-4 py-2.5 w-full sm:w-80 shadow-sm focus-within:ring-2 focus-within:ring-[#C1652F]/25 transition">
          <Search className="w-4 h-4 text-[#1C2430]/35 mr-2 flex-shrink-0" />
          <input type="text" placeholder="Search trials..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent border-none outline-none text-sm text-[#1C2430] placeholder-[#1C2430]/35 w-full" />
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(trial => (
            <div key={trial.id} className="bg-white p-5 rounded-2xl border border-[#1C2430]/[0.06] shadow-[0_1px_3px_rgba(28,36,48,0.04)] hover:shadow-[0_8px_18px_rgba(28,36,48,0.08)] hover:-translate-y-0.5 transition-all duration-200 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-[#1C2430]/40 tracking-wider">{trial.orderId || 'NO ORDER'}</span>
                  <h3 className="text-base font-serif font-bold text-[#1C2430] mt-1">{trial.garment}</h3>
                  <p className="text-xs text-[#1C2430]/55 mt-0.5">For {trial.customerName}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${statusStyles[trial.status]}`}>{trial.status}</span>
                  <button onClick={() => handleDelete(trial.id)} className="p-1 text-[#1C2430]/30 hover:text-[#9B3B43] transition">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#1C2430]/55">
                <span className="flex items-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5 text-[#1C2430]/35" /> {trial.date}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#1C2430]/35" /> {trial.time}</span>
                {trial.tailor && <span className="text-[#1C2430]/45">Tailor: <span className="text-[#1C2430]">{trial.tailor}</span></span>}
              </div>

              {trial.alterationNotes && (
                <div className="flex items-start gap-2 bg-[#FAF7F1] p-3 rounded-xl border border-[#1C2430]/[0.04] text-xs text-[#1C2430]/65">
                  <MessageSquare className="w-3.5 h-3.5 text-[#1C2430]/35 mt-0.5 flex-shrink-0" />
                  <p className="leading-relaxed">{trial.alterationNotes}</p>
                </div>
              )}

              {trial.status === 'Scheduled' && (
                <div className="flex gap-2 pt-3 border-t border-[#1C2430]/[0.06]">
                  <button onClick={() => handleUpdateStatus(trial.id, 'Passed')} className="flex-1 py-2 bg-[#2F5D4F]/10 hover:bg-[#2F5D4F]/20 text-[#234638] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition">
                    <CheckCircle className="w-3.5 h-3.5" /> Passed
                  </button>
                  <button onClick={() => handleUpdateStatus(trial.id, 'Alterations Needed')} className="flex-1 py-2 bg-[#C99A3E]/10 hover:bg-[#C99A3E]/20 text-[#8a6a25] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition">
                    <AlertTriangle className="w-3.5 h-3.5" /> Alterations
                  </button>
                  <button onClick={() => handleUpdateStatus(trial.id, 'Missed')} className="flex-1 py-2 bg-[#9B3B43]/10 hover:bg-[#9B3B43]/20 text-[#7a2e34] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition">
                    <XCircle className="w-3.5 h-3.5" /> Missed
                  </button>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-sm font-semibold text-[#1C2430]/35">No trials found.</div>
          )}
        </div>

        {/* Create Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-[#1C2430]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl border border-[#1C2430]/[0.06] shadow-2xl shadow-[#1C2430]/20 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
              <div className="px-6 py-5 border-b border-[#1C2430]/[0.08] flex justify-between items-center shrink-0">
                <h2 className="text-xl font-serif font-bold text-[#1C2430]">Schedule Trial</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-[#1C2430]/[0.03] hover:bg-[#1C2430]/[0.08] text-[#1C2430]/50 hover:text-[#1C2430] rounded-full transition"><X className="w-4 h-4" /></button>
              </div>
              <div className="overflow-y-auto p-6">
                <form id="trialForm" onSubmit={handleCreate} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Order Reference</label>
                      <input type="text" value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="e.g. ORD-2026-002" className="w-full px-4 py-3 border border-[#1C2430]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 text-sm transition" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Tailor</label>
                      <input type="text" value={tailor} onChange={(e) => setTailor(e.target.value)} placeholder="e.g. Madan Lal" className="w-full px-4 py-3 border border-[#1C2430]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 text-sm transition" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Customer Name *</label>
                    <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required placeholder="e.g. Priyanka Sen" className="w-full px-4 py-3 border border-[#1C2430]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 text-sm transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Garment *</label>
                    <input type="text" value={garment} onChange={(e) => setGarment(e.target.value)} required placeholder="e.g. Designer Lehenga Choli" className="w-full px-4 py-3 border border-[#1C2430]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 text-sm transition" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Date *</label>
                      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full px-4 py-3 border border-[#1C2430]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 text-sm transition" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Time *</label>
                      <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required className="w-full px-4 py-3 border border-[#1C2430]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 text-sm transition" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Alteration Notes</label>
                    <textarea value={alterationNotes} onChange={(e) => setAlterationNotes(e.target.value)} placeholder="e.g. Customer wants to check choli fitting..." rows={2} className="w-full px-4 py-3 border border-[#1C2430]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 text-sm resize-none transition" />
                  </div>
                </form>
              </div>
              <div className="px-6 py-5 border-t border-[#1C2430]/[0.08] flex justify-end shrink-0 bg-[#FAF7F1]/50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-[#1C2430]/60 hover:text-[#1C2430] transition mr-3">Cancel</button>
                <button type="submit" form="trialForm" className="px-6 py-2.5 bg-[#1C2430] hover:bg-[#2a3545] text-[#FAF7F1] rounded-xl text-sm font-bold shadow-md shadow-[#1C2430]/10 transition">Schedule Trial</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Trial;
