import React, { useState, useEffect } from 'react';
import { Plus, Search, Phone, MessageSquare, Mail, Calendar, Check, AlertCircle } from 'lucide-react';
import { followupApi } from '../../../api/followupApi';

interface FollowUp {
  id: string;
  customerName: string;
  channel: 'Call' | 'WhatsApp' | 'Email';
  reason: string;
  dueDate: string;
  status: 'Pending' | 'Completed' | 'Overdue';
}

const mockFollowUps: FollowUp[] = [
  { id: 'FOL-001', customerName: 'Tanvi Jha', channel: 'WhatsApp', reason: 'Ask if she liked the bridal lehenga draft sketches sent on Saturday', dueDate: '2026-06-28', status: 'Pending' },
  { id: 'FOL-002', customerName: 'Sonal Verma', channel: 'Call', reason: 'Confirm custom measurements for blouse adjustments', dueDate: '2026-06-27', status: 'Overdue' },
  { id: 'FOL-003', customerName: 'Neha Das', channel: 'Call', reason: 'Inform fabric roll delay and ask if alternate colors work', dueDate: '2026-06-28', status: 'Pending' },
  { id: 'FOL-004', customerName: 'Kriti Sen', channel: 'Email', reason: 'Send quotation breakdown of Gharara set', dueDate: '2026-06-25', status: 'Completed' },
];

const Followups: React.FC = () => {
  const [followups, setFollowups] = useState<FollowUp[]>(mockFollowUps);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Completed' | 'Overdue'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [channel, setChannel] = useState<FollowUp['channel']>('WhatsApp');
  const [reason, setReason] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    const fetchFollowups = async () => {
      try {
        const data = await followupApi.getFollowups();
        const formatted = data.map((item: any) => ({
          id: `FOL-${item.id}`,
          customerName: item.customer_name,
          channel: item.channel,
          reason: item.reason,
          dueDate: new Date(item.due_date).toISOString().split('T')[0],
          status: item.status
        }));
        setFollowups(formatted);
      } catch (err) {
        console.error("Failed to load followups:", err);
      }
    };
    fetchFollowups();
  }, []);

  const filteredFollowUps = followups.filter(fol => {
    const matchesSearch = fol.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          fol.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'All' || fol.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleCreateFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !dueDate || !reason) return;

    try {
      const response = await followupApi.addFollowup({
        customer_name: customerName,
        channel,
        reason,
        due_date: dueDate,
        status: 'Pending'
      });

      const newFol: FollowUp = {
        id: `FOL-${response.followup.id}`,
        customerName: response.followup.customer_name,
        channel: response.followup.channel,
        reason: response.followup.reason,
        dueDate: new Date(response.followup.due_date).toISOString().split('T')[0],
        status: response.followup.status
      };

      setFollowups([newFol, ...followups]);
      setCustomerName('');
      setReason('');
      setDueDate('');
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding followup:", error);
    }
  };

  const handleMarkCompleted = async (id: string) => {
    try {
      await followupApi.updateFollowupStatus(id, 'Completed');
      setFollowups(followups.map(fol => fol.id === id ? { ...fol, status: 'Completed' } : fol));
    } catch (error) {
      console.error("Error updating followup status:", error);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4 p-6 bg-slate-50/50">
      {/* Page Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Follow-ups</h1>
          <p className="text-sm text-slate-500 mt-1">Track customer outreach, feedback queries, and outstanding quotation replies.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Follow-up
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex justify-between items-center py-4 bg-white px-5 rounded-2xl border border-slate-100 shadow-sm gap-4">
        {/* Tabs */}
        <div className="flex space-x-1.5 bg-slate-100 p-1 rounded-xl">
          {(['All', 'Pending', 'Completed', 'Overdue'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === tab 
                  ? 'bg-white text-slate-950 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 w-1/3">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search follow-ups..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-slate-800 placeholder-slate-400 w-full"
          />
        </div>
      </div>

      {/* Follow-ups List */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold">
              <th className="py-4 px-6">Customer</th>
              <th className="py-4 px-6">Follow-up Task</th>
              <th className="py-4 px-6">Channel</th>
              <th className="py-4 px-6">Due Date</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredFollowUps.map((fol) => (
              <tr key={fol.id} className="hover:bg-slate-50/40 transition">
                <td className="py-4 px-6 font-bold text-slate-800">{fol.customerName}</td>
                <td className="py-4 px-6 text-slate-600 font-medium max-w-[320px] truncate">{fol.reason}</td>
                <td className="py-4 px-6">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    {fol.channel === 'WhatsApp' && <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />}
                    {fol.channel === 'Call' && <Phone className="w-3.5 h-3.5 text-blue-500" />}
                    {fol.channel === 'Email' && <Mail className="w-3.5 h-3.5 text-purple-500" />}
                    {fol.channel}
                  </span>
                </td>
                <td className="py-4 px-6 text-slate-600 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {fol.dueDate}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    fol.status === 'Completed' 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                      : fol.status === 'Overdue'
                      ? 'bg-rose-50 text-rose-800 border-rose-100 font-extrabold flex items-center gap-1 w-fit'
                      : 'bg-blue-50 text-blue-800 border-blue-100'
                  }`}>
                    {fol.status === 'Overdue' && <AlertCircle className="w-3 h-3" />}
                    {fol.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  {fol.status !== 'Completed' && (
                    <button 
                      onClick={() => handleMarkCompleted(fol.id)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-450 hover:text-emerald-600 font-bold text-xs flex items-center gap-1 transition"
                    >
                      <Check className="w-3.5 h-3.5" /> Complete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Follow-up Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-lg">Add New Follow-up</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
            <form onSubmit={handleCreateFollowUp} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Customer Name *</label>
                <input 
                  type="text" 
                  value={customerName} 
                  onChange={(e) => setCustomerName(e.target.value)} 
                  required
                  placeholder="e.g. Shalini Roy" 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Due Date *</label>
                  <input 
                    type="date" 
                    value={dueDate} 
                    onChange={(e) => setDueDate(e.target.value)} 
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Outreach Channel</label>
                  <select 
                    value={channel} 
                    onChange={(e) => setChannel(e.target.value as FollowUp['channel'])} 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  >
                    <option>WhatsApp</option>
                    <option>Call</option>
                    <option>Email</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Follow-up Reason *</label>
                <textarea 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)} 
                  required
                  placeholder="What is the context of outreach?" 
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
              </div>
              <button 
                type="submit" 
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition mt-2 shadow-sm"
              >
                Create Follow-up
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Followups;
