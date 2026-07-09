import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Search, Phone, MessageSquare, Mail, Calendar, Check, AlertCircle, X, Edit3, Clock, ChevronRight, FileText, ArrowRight, Trash2, List, Loader2 } from 'lucide-react';
import { followupApi, FOLLOWUP_EVENTS_URL } from '../../../api/followupApi';
import { useConfirm } from '../../../context/ConfirmContext';
import { toast } from 'sonner';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
}
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface FollowUp {
  id: string;
  customerName: string;
  customerPhone?: string;
  channel: 'Call' | 'WhatsApp' | 'Email' | "Instagram" | "Facebook";
  reason: string;
  notes?: string;
  dueDate: string;
  status: 'Pending' | 'Completed' | 'Overdue' | 'Rejected';
}

const Followups: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { confirm } = useConfirm();
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Completed' | 'Overdue' | 'Rejected'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [calendarView, setCalendarView] = useState<any>('month');
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Create Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
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
    const formatDate = (dateString: string) => {
      if (!dateString) return '';
      const d = new Date(dateString);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const fetchFollowups = async () => {
      try {
        const data = await followupApi.getFollowups();
        const formatted = data.map((item: any) => ({
          id: `FOL-${item.id}`,
          customerName: item.customer_name,
          customerPhone: item.customer_phone || '',
          channel: item.channel,
          reason: item.reason,
          notes: item.notes || '',
          dueDate: formatDate(item.due_date),
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
    const token = localStorage.getItem('boutique_token');
    if (!token) return;

    const eventSource = new EventSource(`${FOLLOWUP_EVENTS_URL}?token=${token}`);

    eventSource.addEventListener('followup_created', (e) => {
      const item = JSON.parse(e.data);
      const newFol: FollowUp = {
        id: `FOL-${item.id}`,
        customerName: item.customer_name,
        customerPhone: item.customer_phone || '',
        channel: item.channel,
        reason: item.reason,
        notes: item.notes || '',
        dueDate: formatDate(item.due_date),
        status: item.status
      };
      setFollowups(prev => [newFol, ...prev.filter(f => f.id !== newFol.id)]);
    });

    eventSource.addEventListener('followup_updated', (e) => {
      const item = JSON.parse(e.data);
      const updatedFol: FollowUp = {
        id: `FOL-${item.id}`,
        customerName: item.customer_name,
        customerPhone: item.customer_phone || '',
        channel: item.channel,
        reason: item.reason,
        notes: item.notes || '',
        dueDate: formatDate(item.due_date),
        status: item.status
      };
      setFollowups(prev => prev.map(fol => fol.id === updatedFol.id ? updatedFol : fol));

      // Update selected followup in drawer if it's the one being modified
      // Update selected followup in drawer if it's the one being modified
      setSelectedFollowup(prev => (prev?.id === updatedFol.id ? updatedFol : prev));
    });

    eventSource.addEventListener('followup_deleted', (e) => {
      const { id } = JSON.parse(e.data);
      const folId = `FOL-${id}`;
      setFollowups(prev => prev.filter(f => f.id !== folId));
      setSelectedFollowup(prev => prev?.id === folId ? null : prev);
      if (selectedFollowup?.id === folId) {
        setIsDrawerOpen(false);
      }
    });

    return () => {
      eventSource.close();
    };
  }, []);

  // Handle incoming lead data
  useEffect(() => {
    const state = location.state as any;
    if (state?.fromLead && state.customerName) {
      setCustomerName(state.customerName || '');
      setCustomerPhone(state.customerPhone || '');
      setReason(state.requirement || '');
      if (state.source) {
        if (state.source.includes('WhatsApp')) setChannel('WhatsApp');
        else if (state.source.includes('Insta')) setChannel('Instagram');
        else if (state.source.includes('Email')) setChannel('Email');
        else if (state.source.includes('Phone') || state.source.includes('Call')) setChannel('Call');
      }
      setIsModalOpen(true);
      // Clean up state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const filteredFollowUps = followups.filter(fol => {
    const matchesSearch = fol.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fol.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'All' || fol.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleCreateFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !dueDate || !reason) return;
    setIsSubmitting(true);

    try {
      const response = await followupApi.addFollowup({
        customer_name: customerName,
        customer_phone: customerPhone,
        channel,
        reason,
        due_date: dueDate,
        status: 'Pending'
      });

      if (response && response.followup) {
        const item = response.followup;
        const d = new Date(item.due_date);
        const formattedDate = item.due_date ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : '';
        const newFol: FollowUp = {
          id: `FOL-${item.id}`,
          customerName: item.customer_name,
          customerPhone: item.customer_phone || '',
          channel: item.channel,
          reason: item.reason,
          notes: item.notes || '',
          dueDate: formattedDate,
          status: item.status
        };
        setFollowups(prev => [newFol, ...prev.filter(f => f.id !== newFol.id)]);
      }

      setCustomerName('');
      setCustomerPhone('');
      setReason('');
      setDueDate('');
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding followup:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConvert = async (fol: FollowUp, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    // Navigate to Quotations page with the customer's name and followup ID
    navigate('/orders/quotations', {
      state: {
        fromLead: true,
        customerName: fol.customerName,
        customerPhone: fol.customerPhone || '',
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

  const handleDelete = async (fol: FollowUp, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isConfirmed = await confirm(
      "Are you sure you want to delete this follow-up? This action cannot be undone.",
      { title: "Delete Follow-up", destructive: true }
    );
    if (isConfirmed) {
      try {
        await followupApi.deleteFollowup(fol.id);
        toast.success("Follow-up deleted successfully");
        setFollowups(prev => prev.filter(f => f.id !== fol.id));
        if (selectedFollowup?.id === fol.id) {
          setIsDrawerOpen(false);
          setSelectedFollowup(null);
        }
      } catch (error) {
        console.error("Error deleting followup:", error);
        toast.error("Failed to delete follow-up");
      }
    }
  };

  const handleOpenDrawer = (fol: FollowUp) => {
    navigate(`/crm/followups/${fol.id}`, { state: { fol } });
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
        const d = new Date(item.due_date);
        const formattedDate = item.due_date ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : '';
        const updatedFol: FollowUp = {
          id: `FOL-${item.id}`,
          customerName: item.customer_name,
          customerPhone: item.customer_phone || '',
          channel: item.channel,
          reason: item.reason,
          notes: item.notes || '',
          dueDate: formattedDate,
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

  const calendarEvents = filteredFollowUps.map(fol => {
    // Parse the date and set a default time (10:00 AM - 11:00 AM) so it shows up nicely in Week/Day views
    const startDate = new Date(fol.dueDate);
    startDate.setHours(10, 0, 0, 0);

    const endDate = new Date(fol.dueDate);
    endDate.setHours(11, 0, 0, 0);

    return {
      id: fol.id,
      title: `${fol.customerName} - ${fol.reason}`,
      start: startDate,
      end: endDate,
      allDay: false,
      resource: fol,
    };
  });

  const EventComponent = ({ event }: any) => {
    const fol = event.resource as FollowUp;
    let statusClass = "bg-[#4285F4]/10 text-[#4285F4] border-[#4285F4]/20"; // Pending
    if (fol.status === 'Completed') statusClass = "bg-emerald-100 text-emerald-700 border-emerald-200";
    else if (fol.status === 'Overdue') statusClass = "bg-rose-100 text-rose-700 border-rose-200";
    else if (fol.status === 'Rejected') statusClass = "bg-gray-100 text-gray-600 border-gray-200";

    return (
      <div className={`px-2 py-1 h-full w-full rounded text-xs font-semibold border ${statusClass} overflow-hidden whitespace-nowrap text-ellipsis flex items-center`}>
        {event.title}
      </div>
    );
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
          <div className="flex gap-3">
            <div className="flex bg-white rounded-xl shadow-sm border border-[#16132D]/10 p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#16132D] text-white shadow-sm' : 'text-[#16132D]/60 hover:bg-[#16132D]/5 hover:text-[#16132D]'}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'calendar' ? 'bg-[#16132D] text-white shadow-sm' : 'text-[#16132D]/60 hover:bg-[#16132D]/5 hover:text-[#16132D]'}`}
                title="Calendar View"
              >
                <Calendar className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-[#16132D] hover:bg-[#2A3441] text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" /> New Follow-up
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 bg-white p-2 rounded-2xl shadow-sm border border-[#16132D]/5">
          <div className="flex space-x-1 p-1 bg-[#F4F3F8] rounded-xl overflow-x-auto w-full sm:w-auto">
            {(['All', 'Pending', 'Completed', 'Overdue', 'Rejected'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab
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

        {/* Table / Calendar */}
        <div className="flex-1 bg-white rounded-3xl border border-[#16132D]/5 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
          {viewMode === 'calendar' ? (
            <div className="flex-1 p-6 h-[700px]">
              <style dangerouslySetInnerHTML={{
                __html: `
                .rbc-calendar { font-family: inherit; }
                .rbc-toolbar button { font-weight: 600; border-radius: 8px; border: 1px solid #e2e8f0; color: #475569; }
                .rbc-toolbar button.rbc-active { background-color: #16132D; color: white; border-color: #16132D; }
                .rbc-toolbar button:hover:not(.rbc-active) { background-color: #f1f5f9; }
                .rbc-event { background: transparent; padding: 0; border: none; }
                .rbc-today { background-color: #F4F3F8; }
                .rbc-header { padding: 12px 0; font-weight: 700; color: #16132D; border-bottom: 2px solid #f1f5f9; }
              `}} />
              <BigCalendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                components={{
                  event: EventComponent
                }}
                onSelectEvent={(event: any) => handleOpenDrawer(event.resource)}
                views={['month', 'week', 'day']}
                view={calendarView}
                onView={(view) => setCalendarView(view)}
                date={calendarDate}
                onNavigate={(date) => setCalendarDate(date)}
                popup
              />
            </div>
          ) : (
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
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1 w-fit ${fol.status === 'Completed' ? 'bg-emerald-100 text-emerald-800'
                                : fol.status === 'Overdue' ? 'bg-rose-100 text-rose-800'
                                  : fol.status === 'Rejected' ? 'bg-slate-200 text-slate-700'
                                    : 'bg-blue-100 text-blue-800'
                              }`}>
                              {fol.status === 'Overdue' && <AlertCircle className="w-3 h-3" />}
                              {fol.status}
                            </span>
                            {fol.notes && (() => {
                              const noteCount = fol.notes.split('\n').filter(line => line.trim() !== '').length;
                              return noteCount > 0 ? (
                                <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm ring-1 ring-blue-500/20">
                                  <MessageSquare className="w-3 h-3" /> {noteCount}
                                </span>
                              ) : null;
                            })()}
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
                                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                                  title="Reject Follow-up"
                                >
                                  <X className="w-3.5 h-3.5" /> Reject
                                </button>
                              </>
                            )}

                            <button
                              onClick={(e) => handleDelete(fol, e)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Follow-up"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <ChevronRight className="w-5 h-5 text-[#16132D]/20 group-hover:text-[#16132D]/60 transition-colors ml-2" />

                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

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
              <div>
                <label className="block text-xs font-bold text-[#16132D]/60 uppercase tracking-wider mb-2">Customer Phone (Optional)</label>
                <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="E.g. +91 9876543210" className="w-full px-4 py-3 bg-[#F4F3F8] border border-[#16132D]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16132D]/20 text-sm font-medium" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#16132D]/60 uppercase tracking-wider mb-2">Due Date</label>
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
              <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-[#16132D] hover:bg-[#2A3441] disabled:opacity-60 text-white rounded-xl text-sm font-bold transition-all shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer">
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting ? 'Creating...' : 'Create Follow-up'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Followups;
