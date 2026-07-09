import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MessageSquare, Mail, MoreVertical, User, Calendar, CheckCircle2, Plus, ArrowRight } from 'lucide-react';
import { followupApi } from '../../../api/followupApi';
import { toast } from 'sonner';

interface FollowUp {
  id: string;
  customerName: string;
  customerPhone?: string;
  channel: 'Call' | 'WhatsApp' | 'Email' | 'Instagram' | 'Facebook';
  reason: string;
  notes?: string;
  dueDate: string;
  status: 'Pending' | 'Completed' | 'Overdue' | 'Rejected';
  googleEventId?: string;
}

const FollowupDetails: React.FC = () => {
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [followup, setFollowup] = useState<FollowUp | null>(location.state?.fol || null);
  const [isLoading, setIsLoading] = useState(!location.state?.fol);
  const [newNote, setNewNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!followup && id) {
      const fetchFollowup = async () => {
        try {
          const data = await followupApi.getFollowups();
          const item = data.find((f: any) => `FOL-${f.id}` === id);
          if (item) {
            setFollowup({
              id: `FOL-${item.id}`,
              customerName: item.customer_name,
              customerPhone: item.customer_phone || '',
              channel: item.channel,
              reason: item.reason,
              notes: item.notes || '',
              dueDate: item.due_date,
              status: item.status,
              googleEventId: item.google_event_id
            });
          } else {
            toast.error('Follow-up not found');
            navigate('/crm/followups');
          }
        } catch (error) {
          console.error(error);
          toast.error('Failed to load follow-up details');
        } finally {
          setIsLoading(false);
        }
      };
      fetchFollowup();
    }
  }, [id, followup, navigate]);

  const handleAddNote = async () => {
    if (!followup || !newNote.trim()) return;
    setIsUpdating(true);
    try {
      const response = await followupApi.updateFollowup(followup.id, {
        notes: newNote,
        due_date: followup.dueDate,
        status: followup.status
      });

      if (response && response.followup) {
        setFollowup(prev => prev ? { ...prev, notes: response.followup.notes } : null);
        setNewNote('');
        toast.success('Note added successfully');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to add note');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = async (newStatus: FollowUp['status']) => {
    if (!followup) return;
    try {
      setFollowup(prev => prev ? { ...prev, status: newStatus } : null);
      await followupApi.updateFollowupStatus(followup.id, newStatus);
      toast.success(`Task marked as ${newStatus}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F7F6] flex items-center justify-center">
        <p className="font-medium text-[#224D3F]/40">Loading details...</p>
      </div>
    );
  }

  if (!followup) return null;

  const notesList = followup.notes ? followup.notes.split('\n').filter(line => line.trim() !== '') : [];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#F4F7F6] text-slate-800 pb-10">
      {/* Top Header Section */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between mx-auto max-w-7xl">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/crm/followups')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#5D3F6A] text-white flex items-center justify-center font-bold shadow-sm">
                {getInitials(followup.customerName)}
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">{followup.reason}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Due: {new Date(followup.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-[#2E6B4F] hover:bg-[#23533D] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors">
              Send Message
            </button>
            <button className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-lg transition-colors border border-red-200">
              Edit
            </button>
            <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Task Details and Notes */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Main Task Box */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-slate-800">Task Overview</h3>
            </div>
            <div className="p-5 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <p className="text-[13px] font-semibold text-slate-500 uppercase tracking-wider">Subject:</p>
                <p className="text-[15px] font-medium text-slate-800">{followup.reason}</p>
              </div>
              <button 
                onClick={() => handleStatusChange(followup.status === 'Completed' ? 'Pending' : 'Completed')}
                className={`px-4 py-1.5 text-xs font-bold rounded border transition-colors ${
                  followup.status === 'Completed' 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-white text-red-500 border-red-200 hover:bg-red-50'
                }`}
              >
                {followup.status === 'Completed' ? 'Reopen Task' : 'Close Task'}
              </button>
            </div>
          </div>

          {/* Notes Box */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-[500px]">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
              <h3 className="text-[13px] font-bold text-slate-800">Discussion Notes</h3>
              <div className="px-3 py-1 bg-[#2E6B4F] text-white text-[11px] font-bold rounded flex items-center gap-1 cursor-pointer hover:bg-[#23533D] transition-colors">
                Sort <ArrowRight className="w-3 h-3 rotate-90" />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 bg-slate-50/30">
              {notesList.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm font-medium">No notes added yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notesList.map((line, index) => {
                    const match = line.match(/^\[(.*?)\]:\s*(.*)$/);
                    if (match) {
                      return (
                        <div key={index} className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 border border-white shadow-sm">
                            <User className="w-4 h-4 text-slate-500" />
                          </div>
                          <div className="flex-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-[13px] font-bold text-slate-800">User</span>
                              <span className="text-[11px] font-semibold text-slate-400">{match[1]}</span>
                            </div>
                            <p className="text-[14px] text-slate-600 leading-relaxed whitespace-pre-wrap">{match[2]}</p>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={index} className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 border border-white shadow-sm">
                          <User className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="flex-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <p className="text-[14px] text-slate-600 leading-relaxed whitespace-pre-wrap">{line}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Add Note Input */}
            <div className="p-5 border-t border-slate-200 bg-white rounded-b-xl shrink-0">
              <div className="relative">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  className="w-full pl-4 pr-32 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E6B4F]/20 focus:border-[#2E6B4F]/30 text-[14px] font-medium resize-none transition-all shadow-inner"
                  rows={2}
                />
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || isUpdating}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-[#2E6B4F] hover:bg-[#23533D] disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center gap-1"
                >
                  {isUpdating ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Client Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-semibold text-slate-800">Leads</h3>
            </div>
            
            <div className="p-5">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-[#EAF0EF] text-[#2E6B4F] flex items-center justify-center font-bold text-xl shadow-sm mb-3">
                  <User className="w-8 h-8 opacity-50" />
                </div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  {followup.customerName}
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase tracking-wide border border-blue-100">Lead</span>
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Phone</p>
                    <p className="text-sm font-medium text-slate-700 truncate">{followup.customerPhone || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                  {followup.channel === 'WhatsApp' ? <MessageSquare className="w-4 h-4 text-emerald-500 shrink-0" /> : <Mail className="w-4 h-4 text-slate-400 shrink-0" />}
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Preferred Channel</p>
                    <p className="text-sm font-medium text-slate-700 truncate">{followup.channel}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-800">Task Status</h3>
            </div>
            <div className="p-4">
              <select
                value={followup.status}
                onChange={(e) => handleStatusChange(e.target.value as FollowUp['status'])}
                className={`w-full text-sm font-semibold px-4 py-2.5 rounded-lg border outline-none cursor-pointer appearance-none shadow-sm ${
                  followup.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : followup.status === 'Overdue' ? 'bg-red-50 text-red-700 border-red-200'
                  : followup.status === 'Rejected' ? 'bg-slate-100 text-slate-700 border-slate-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Overdue">Overdue</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowupDetails;
