import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Phone, MessageSquare, Mail, Calendar, Check, AlertCircle, X, Edit3, Clock, ChevronRight, FileText, ArrowRight } from 'lucide-react';
import { followupApi, FOLLOWUP_EVENTS_URL } from '../../../api/followupApi';

interface FollowUp {
  id: string;
  customerName: string;
  channel: 'Call' | 'WhatsApp' | 'Email'|"Instagram"|"Facebook";
  reason: string;
  notes?: string;
  dueDate: string;
  status: 'Pending' | 'Completed' | 'Overdue' | 'Rejected';
}

const Followups: React.FC = () => {
  const navigate = useNavigate();
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Completed' | 'Overdue' | 'Rejected'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Create Form states
  const [customerName, setCustomerName] = useState('');
  const [channel, setChannel] = useState<FollowUp['channel']>('WhatsApp');
  const [reason, setReason] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Update Drawer states
  const [selectedFollowup, setSelectedFollowup] = useState<FollowUp | null>(null);
  const [updateNotes, setUpdateNotes] = useState('');
  const [updateDueDate, setUpdateDueDate] = useState('');
  const [updateStatus, setUpdateStatus] = useState<FollowUp['status']>('Pending');
  const [isUpdating, setIsUpdating] = useState(false);

  // Helper to format notes for display
  const renderNotesHistory = (notes?: string) => {
    if (!notes) return <div className="text-sm text-[#16132D]/40 italic">No notes logged yet.</div>;
    
    // Notes are appended in the backend like: [06-Jul-2026]: Customer said yes\n[07-Jul-2026]: Another note
    const lines = notes.split('\n').filter(line => line.trim() !== '');
    return (
      <div className="space-y-3 mt-3">
        {lines.map((line, index) => {
          const match = line.match(/^\[(.*?)\]:\s*(.*)$/);
          if (match) {
            return (
              <div key={index} className="flex flex-col bg-white p-3 rounded-xl border border-[#16132D]/5 shadow-sm relative">
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {match[1]}
                </span>
                <p className="text-sm text-[#16132D]/80 font-medium">{match[2]}</p>
              </div>
            );
          }
          return (
            <div key={index} className="bg-white p-3 rounded-xl border border-[#16132D]/5 shadow-sm">
              <p className="text-sm text-[#16132D]/80 font-medium">{line}</p>
            </div>
          );
        })}
      </div>
    );
  };

  useEffect(() => {
    const fetchFollowups = async () => {
      try {
        const data = await followupApi.getFollowups();
        const formatted = data.map((item: any) => ({
          id: `FOL-${item.id}`,
          customerName: item.customer_name,
          channel: item.channel,
          reason: item.reason,
          notes: item.notes || '',
          dueDate: new Date(item.due_date).toISOString().split('T')[0],
          status: item.status
        }));
        setFollowups(formatted);
      } catch (err) {
        console.error("Failed to load followups:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFollowups();

    // Setup Server-Sent Events for real-time updates
    const token = localStorage.getItem('token');
    if (!token) return;

    const eventSource = new EventSource(`${FOLLOWUP_EVENTS_URL}?token=${token}`);

    eventSource.addEventListener('followup_created', (e) => {
      const item = JSON.parse(e.data);
      const newFol: FollowUp = {
        id: `FOL-${item.id}`,
        customerName: item.customer_name,
        channel: item.channel,
        reason: item.reason,
        notes: item.notes || '',
        dueDate: new Date(item.due_date).toISOString().split('T')[0],
        status: item.status
      };
      setFollowups(prev => [newFol, ...prev.filter(f => f.id !== newFol.id)]);
    });

    eventSource.addEventListener('followup_updated', (e) => {
      const item = JSON.parse(e.data);
      const updatedFol: FollowUp = {
        id: `FOL-${item.id}`,
        customerName: item.customer_name,
        channel: item.channel,
        reason: item.reason,
        notes: item.notes || '',
        dueDate: new Date(item.due_date).toISOString().split('T')[0],
        status: item.status
      };
      setFollowups(prev => prev.map(fol => fol.id === updatedFol.id ? updatedFol : fol));
      
      // Update selected followup in drawer if it's the one being modified
      setSelectedFollowup(prev => (prev?.id === updatedFol.id ? updatedFol : prev));
    });

    return () => {
      eventSource.close();
    };
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
      
      if (response && response.followup) {
        const item = response.followup;
        const newFol: FollowUp = {
          id: `FOL-${item.id}`,
          customerName: item.customer_name,
          channel: item.channel,
          reason: item.reason,
          notes: item.notes || '',
          dueDate: new Date(item.due_date).toISOString().split('T')[0],
          status: item.status
        };
        setFollowups(prev => [newFol, ...prev.filter(f => f.id !== newFol.id)]);
      }

      setCustomerName('');
      setReason('');
      setDueDate('');
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding followup:", error);
    }
  };

  const handleConvert = async (fol: FollowUp, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    // Navigate to Quotations page with the customer's name and followup ID
    navigate('/orders/quotations', { 
      state: { 
        fromLead: true, 
        customerName: fol.customerName,
        followupId: fol.id
      } 
    });
  };

  const handleMarkRejected = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await followupApi.updateFollowupStatus(id, 'Rejected');
      setFollowups(prev => prev.map(fol => fol.id === id ? { ...fol, status: 'Rejected' } : fol));
      if (selectedFollowup?.id === id) {
        setSelectedFollowup(prev => prev ? { ...prev, status: 'Rejected' } : null);
      }
    } catch (error) {
      console.error("Error updating followup status:", error);
    }
  };

  const handleOpenDrawer = (fol: FollowUp) => {
    setSelectedFollowup(fol);
    setUpdateNotes('');
    setUpdateDueDate(fol.dueDate);
    setUpdateStatus(fol.status);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedFollowup(null);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFollowup) return;
    setIsUpdating(true);

    try {
      const response = await followupApi.updateFollowup(selectedFollowup.id, {
        notes: updateNotes,
        due_date: updateDueDate,
        status: updateStatus
      });
      
      if (response && response.followup) {
        const item = response.followup;
        const updatedFol: FollowUp = {
          id: `FOL-${item.id}`,
          customerName: item.customer_name,
          channel: item.channel,
          reason: item.reason,
          notes: item.notes || '',
          dueDate: new Date(item.due_date).toISOString().split('T')[0],
          status: item.status
        };
        setFollowups(prev => prev.map(fol => fol.id === updatedFol.id ? updatedFol : fol));
        setSelectedFollowup(updatedFol);
      }
      
      setUpdateNotes('');
    } catch (error) {
      console.error("Error updating followup:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex h-full bg-[#F4F3F8] relative overflow-hidden">
      <div className={`flex flex-col flex-1 p-8 transition-all duration-300 ease-in-out ${isDrawerOpen ? 'mr-[420px]' : ''}`}>
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-[#16132D] tracking-tight">Follow-ups</h1>
            <p className="text-[#16132D]/60 mt-2 font-medium">Keep your customer communications organized and close more deals.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-[#16132D] hover:bg-[#2A3441] text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" /> New Follow-up
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 bg-white p-2 rounded-2xl shadow-sm border border-[#16132D]/5">
          <div className="flex space-x-1 p-1 bg-[#F4F3F8] rounded-xl overflow-x-auto w-full sm:w-auto">
            {(['All', 'Pending', 'Completed', 'Overdue', 'Rejected'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === tab 
                    ? 'bg-white text-[#16132D] shadow-sm ring-1 ring-[#16132D]/5' 
                    : 'text-[#16132D]/50 hover:text-[#16132D]/80 hover:bg-[#16132D]/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#16132D]/40" />
            <input 
              type="text" 
              placeholder="Search customers or tasks..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[#F4F3F8] border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16132D]/20 text-sm font-medium text-[#16132D] placeholder-[#16132D]/40 transition-shadow"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 bg-white rounded-3xl border border-[#16132D]/5 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
          <div className="overflow-x-auto flex-1">
            {isLoading ? (
              <div className="flex h-full items-center justify-center text-[#16132D]/40 font-medium">Loading...</div>
            ) : filteredFollowUps.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-[#16132D]/40">
                <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-semibold text-lg">No follow-ups found</p>
                <p className="text-sm">You are all caught up!</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                  <tr className="border-b border-[#16132D]/5 text-[#16132D]/60 font-bold uppercase tracking-wider text-xs">
                    <th className="py-4 px-6">Customer</th>
                    <th className="py-4 px-6">Task & Status</th>
                    <th className="py-4 px-6">Channel</th>
                    <th className="py-4 px-6">Due Date</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#16132D]/5">
                  {filteredFollowUps.map((fol) => (
                    <tr 
                      key={fol.id} 
                      onClick={() => handleOpenDrawer(fol)}
                      className="hover:bg-[#F4F3F8]/50 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-6 font-bold text-[#16132D]">{fol.customerName}</td>
                      <td className="py-3.5 px-6 max-w-[300px]">
                        <div className="font-medium text-[#16132D] truncate" title={fol.reason}>{fol.reason}</div>
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1 w-fit ${
                            fol.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' 
                            : fol.status === 'Overdue' ? 'bg-rose-100 text-rose-800'
                            : fol.status === 'Rejected' ? 'bg-slate-200 text-slate-700'
                            : 'bg-blue-100 text-blue-800'
                          }`}>
                            {fol.status === 'Overdue' && <AlertCircle className="w-3 h-3" />}
                            {fol.status}
                          </span>
                          {fol.notes && (
                            <span className="text-[11px] font-bold text-[#16132D]/40 flex items-center gap-1">
                              <Edit3 className="w-3 h-3" /> Has Notes
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-[#16132D]/70">
                          {fol.channel === 'WhatsApp' && <MessageSquare className="w-4 h-4 text-emerald-500" />}
                          {fol.channel === 'Call' && <Phone className="w-4 h-4 text-blue-500" />}
                          {fol.channel === 'Email' && <Mail className="w-4 h-4 text-purple-500" />}
                          {fol.channel}
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-1.5 font-semibold text-[#16132D]/70">
                          <Calendar className="w-4 h-4 text-[#16132D]/40" />
                          {fol.dueDate}
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex justify-end gap-2 items-center">
                          {fol.status !== 'Completed' && fol.status !== 'Rejected' && (
                            <>
                              <button 
                                onClick={(e) => handleConvert(fol, e)}
                                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                                title="Convert to Quotation"
                              >
                                <ArrowRight className="w-3.5 h-3.5" /> Convert
                              </button>
                              <button 
                                onClick={(e) => handleMarkRejected(fol.id, e)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                                title="Reject"
                              >
                                <X className="w-3.5 h-3.5" /> Reject
                              </button>
                            </>
                          )}
                          <ChevronRight className="w-5 h-5 text-[#16132D]/20 group-hover:text-[#16132D]/60 transition-colors ml-2" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Side Drawer for Details & Updating */}
      <div className={`fixed inset-y-0 right-0 w-[420px] bg-white shadow-2xl border-l border-[#16132D]/10 transform transition-transform duration-300 ease-in-out z-40 flex flex-col ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {selectedFollowup && (
          <>
            <div className="flex items-center justify-between px-8 py-6 border-b border-[#16132D]/5 bg-[#F4F3F8]/30">
              <h2 className="text-xl font-extrabold text-[#16132D]">Follow-up Details</h2>
              <button onClick={handleCloseDrawer} className="p-2 hover:bg-[#16132D]/5 rounded-full transition-colors text-[#16132D]/40 hover:text-[#16132D]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-8 space-y-8">
                
                <div className="bg-[#F4F3F8] p-5 rounded-2xl border border-[#16132D]/5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs font-bold text-[#16132D]/40 uppercase tracking-wider mb-1">Customer</p>
                      <p className="text-lg font-bold text-[#16132D]">{selectedFollowup.customerName}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        selectedFollowup.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' 
                        : selectedFollowup.status === 'Overdue' ? 'bg-rose-100 text-rose-800'
                        : selectedFollowup.status === 'Rejected' ? 'bg-slate-200 text-slate-700'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedFollowup.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#16132D]/40 uppercase tracking-wider mb-1">Original Reason</p>
                    <p className="text-sm font-medium text-[#16132D]/80 leading-relaxed">{selectedFollowup.reason}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#16132D] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#16132D]/40" /> Discussion History
                  </h3>
                  <div className="bg-[#F4F3F8]/50 p-4 rounded-2xl border border-[#16132D]/5 max-h-[300px] overflow-y-auto">
                    {renderNotesHistory(selectedFollowup.notes)}
                  </div>
                </div>

                {selectedFollowup.status !== 'Completed' && selectedFollowup.status !== 'Rejected' && (
                  <div className="border-t border-[#16132D]/5 pt-8">
                    <h3 className="text-sm font-bold text-[#16132D] uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-[#16132D]/40" /> Log & Reschedule
                    </h3>
                    <form onSubmit={handleUpdateSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-[#16132D]/60 uppercase tracking-wider mb-2">Add New Note</label>
                        <textarea 
                          value={updateNotes} 
                          onChange={(e) => setUpdateNotes(e.target.value)} 
                          placeholder="E.g. Called customer, they need 2 more days..." 
                          rows={3}
                          className="w-full px-4 py-3 bg-[#F4F3F8] border border-[#16132D]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16132D]/20 text-sm font-medium transition-shadow resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#16132D]/60 uppercase tracking-wider mb-2">Next Follow-up</label>
                          <input 
                            type="date" 
                            value={updateDueDate} 
                            onChange={(e) => setUpdateDueDate(e.target.value)} 
                            required
                            className="w-full px-4 py-3 bg-[#F4F3F8] border border-[#16132D]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16132D]/20 text-sm font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#16132D]/60 uppercase tracking-wider mb-2">Status</label>
                          <select 
                            value={updateStatus} 
                            onChange={(e) => setUpdateStatus(e.target.value as FollowUp['status'])} 
                            className="w-full px-4 py-3 bg-[#F4F3F8] border border-[#16132D]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16132D]/20 text-sm font-medium appearance-none"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                            <option value="Overdue">Overdue</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        disabled={isUpdating}
                        className="w-full py-3.5 mt-4 bg-[#16132D] hover:bg-[#2A3441] text-white rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isUpdating ? 'Saving...' : 'Save Updates'}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {isDrawerOpen && (
        <div className="fixed inset-0 bg-[#16132D]/20 backdrop-blur-sm z-30 transition-opacity" onClick={handleCloseDrawer} />
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#16132D]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-[#16132D]/5 flex justify-between items-center bg-[#F4F3F8]/50">
              <h3 className="font-extrabold text-[#16132D] text-lg">New Follow-up</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[#16132D]/5 rounded-full text-[#16132D]/40 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateFollowUp} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#16132D]/60 uppercase tracking-wider mb-2">Customer Name</label>
                <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required placeholder="E.g. Shalini Roy" className="w-full px-4 py-3 bg-[#F4F3F8] border border-[#16132D]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16132D]/20 text-sm font-medium" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#16132D]/60 uppercase tracking-wider mb-2">Entery Date</label>
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required className="w-full px-4 py-3 bg-[#F4F3F8] border border-[#16132D]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16132D]/20 text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#16132D]/60 uppercase tracking-wider mb-2">Channel</label>
                  <select value={channel} onChange={(e) => setChannel(e.target.value as FollowUp['channel'])} className="w-full px-4 py-3 bg-[#F4F3F8] border border-[#16132D]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16132D]/20 text-sm font-medium appearance-none">
                    <option>WhatsApp</option>
                    <option>Call</option>
                    <option>Email</option>
                    <option>Instagram</option>
                    <option>Facebook</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#16132D]/60 uppercase tracking-wider mb-2">Reason</label>
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} required placeholder="Why are we following up?" rows={3} className="w-full px-4 py-3 bg-[#F4F3F8] border border-[#16132D]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16132D]/20 text-sm font-medium resize-none" />
              </div>
              <button type="submit" className="w-full py-3.5 bg-[#16132D] hover:bg-[#2A3441] text-white rounded-xl text-sm font-bold transition-all shadow-md mt-2">
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
