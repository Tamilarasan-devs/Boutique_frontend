import { toast } from 'sonner';
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter, Phone, Calendar, MoreVertical, Trash2, ShieldCheck, HelpCircle, FileText, Upload, ChevronRight, X, Loader2, Edit, MessageSquare, LayoutGrid, List } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { leadApi, Lead } from '../../../api/leadApi';
import { customerApi } from '../../../api/customerApi';
import { useConfirm } from '../../../context';
import { TableSkeleton, CardSkeleton } from '@/components/ui/Skeleton';

// ────────────────────────────────────────────────────────────
// Palette (matches Boutique Overview):
// Ink var(--primary-hex) · Parchment #F4F3F8 · Terracotta var(--accent-hex)
// Gold var(--accent-hex) · Pine #10B981 · Rosewood #F43F5E · Plum #7A5AA8
// ────────────────────────────────────────────────────────────

const columnStyles: Record<Lead['status'], { dot: string; head: string; chip: string }> = {
  New:       { dot: 'bg-[#7A5AA8]', head: 'text-[#7A5AA8]', chip: 'bg-[#7A5AA8]/10 text-[#5d4485]' },
  Contacted: { dot: 'bg-[var(--primary-hex)]', head: 'text-[#6200EA]', chip: 'bg-[var(--primary-hex)]/10 text-[#6200EA]' },
  Qualified: { dot: 'bg-[var(--primary-hex)]', head: 'text-[#a3531f]', chip: 'bg-[var(--primary-hex)]/10 text-[#a3531f]' },
  Won:       { dot: 'bg-[#10B981]', head: 'text-[#234638]', chip: 'bg-[#10B981]/10 text-[#234638]' },
  Lost:      { dot: 'bg-[#F43F5E]', head: 'text-[#7a2e34]', chip: 'bg-[#F43F5E]/10 text-[#7a2e34]' },
};

const Leads: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { confirm } = useConfirm();
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [requirement, setRequirement] = useState('');
  const [value, setValue] = useState('');
  const [source, setSource] = useState('WhatsApp'); // Updated default based on user request
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);

  const columns: Lead['status'][] = ['New', 'Contacted', 'Qualified', 'Won', 'Lost'];

  useEffect(() => {
    fetchLeads();
    const state = location.state as any;
    if (state?.openModal) {
      setIsModalOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const data = await leadApi.getLeads();
      setLeads(data);
    } catch (error) {
      console.error('Failed to load leads', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.requirement.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditingLeadId(null);
    setName('');
    setPhone('');
    setRequirement('');
    setValue('');
    setSource('WhatsApp');
    setIsModalOpen(true);
  };

  const openEditModal = (lead: Lead) => {
    setEditingLeadId(lead.id);
    setName(lead.name);
    setPhone(lead.phone);
    setRequirement(lead.requirement);
    setValue(lead.value ? lead.value.replace(/[₹,]/g, '') : '');
    setSource(lead.source);
    setIsModalOpen(true);
  };

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    setIsSubmitting(true);

    try {
      const formattedValue = value ? `₹${Number(value).toLocaleString('en-IN')}` : '₹0';

      if (editingLeadId) {
        // Check for duplicates excluding current lead
        if (leads.some(l => l.phone === phone && l.id !== editingLeadId)) {
          toast.error('A lead with this phone number already exists.');
          return;
        }

        const updatedLead = await leadApi.updateLead(editingLeadId, {
          name, phone, source, requirement, value: formattedValue
        });
        setLeads(leads.map(l => l.id === editingLeadId ? updatedLead : l));
      } else {
        // Check for duplicates
        if (leads.some(l => l.phone === phone)) {
          toast.error('A lead with this phone number already exists.');
          return;
        }

        const uniqueSuffix = Math.floor(Math.random() * 9000) + Date.now().toString().slice(-4);
        const newLeadData = {
          lead_id: `LEAD-${uniqueSuffix}`,
          name,
          phone,
          source,
          requirement,
          status: 'New' as Lead['status'],
          value: formattedValue
        };
        const savedLead = await leadApi.addLead(newLeadData);
        setLeads([savedLead, ...leads]); // Add to top of list
      }
      
      // Reset form
      setName('');
      setPhone('');
      setRequirement('');
      setValue('');
      setSource('WhatsApp');
      setEditingLeadId(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save lead', error);
      alert('Error saving lead. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const moveStatus = async (id: string, currentStatus: Lead['status']) => {
    const currentIndex = columns.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex === columns.length - 1) return;
    const nextStatus = columns[currentIndex + 1];

    // Optimistic UI update
    setLeads(leads.map(lead => lead.id === id ? { ...lead, status: nextStatus } : lead));

    try {
      await leadApi.updateLeadStatus(id, nextStatus);
    } catch (error) {
      console.error('Failed to update status', error);
      // Revert if failed
      setLeads(leads.map(lead => lead.id === id ? { ...lead, status: currentStatus } : lead));
      alert('Failed to update lead status on the server.');
    }
  };

  const handleMarkLost = async (id: string, currentStatus: Lead['status']) => {
    const isConfirmed = await confirm('Are you sure you want to mark this lead as lost? This cannot be undone easily.', {
      title: 'Mark as Lost',
      confirmText: 'Mark Lost',
      destructive: true
    });
    
    if (!isConfirmed) return;

    // Optimistic UI update
    setLeads(leads.map(lead => lead.id === id ? { ...lead, status: 'Lost' as Lead['status'] } : lead));

    try {
      await leadApi.updateLeadStatus(id, 'Lost');
    } catch (error) {
      console.error('Failed to mark lead as lost', error);
      // Revert if failed
      setLeads(leads.map(lead => lead.id === id ? { ...lead, status: currentStatus } : lead));
      alert('Failed to update lead status on the server.');
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string, sourceStatus: Lead['status']) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ id, sourceStatus }));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetStatus: Lead['status']) => {
    e.preventDefault();
    try {
      const data = e.dataTransfer.getData('text/plain');
      if (!data) return;
      const { id, sourceStatus } = JSON.parse(data);
      
      if (id && sourceStatus && sourceStatus !== targetStatus) {
        if (targetStatus === 'Lost') {
          handleMarkLost(id, sourceStatus);
        } else {
          // optimistically update
          setLeads(prev => prev.map(l => l.id === id ? { ...l, status: targetStatus } : l));
          try {
            await leadApi.updateLeadStatus(id, targetStatus);
          } catch (error) {
            console.error('Failed to drop', error);
            setLeads(prev => prev.map(l => l.id === id ? { ...l, status: sourceStatus } : l));
            toast.error('Failed to update lead status on the server.');
          }
        }
      }
    } catch(err) {
      console.error('Drag data parsing error', err);
    }
  };

  const handleConvertLead = async (lead: Lead) => {
    const confirmConvert = await confirm(`Convert "${lead.name}" to an active customer and create a quotation?`, {
      title: 'Convert Lead',
      confirmText: 'Convert & Create Quotation'
    });
    if (!confirmConvert) return;

    // Navigate to Quotations page with lead data pre-filled
    // Status update will be handled there upon successful save
    navigate('/orders/quotations', {
      state: {
        fromLead: true,
        leadId: lead.id,
        commonId: lead.common_id,
        customerName: lead.name,
        customerPhone: lead.phone || '',
        customerEmail: '',
        items: lead.requirement || '',
        totalAmount: lead.value ? lead.value.replace(/[₹,]/g, '') : '',
      }
    });
  };

  const handleCreateQuotation = (lead: Lead) => {
    navigate('/orders/quotations', {
      state: {
        fromLead: true,
        leadId: lead.id,
        commonId: lead.common_id,
        customerName: lead.name,
        customerPhone: lead.phone || '',
        customerEmail: '',
        items: lead.requirement || '',
        totalAmount: lead.value ? lead.value.replace(/[₹,]/g, '') : '',
      }
    });
  };

  const handleAddFollowup = (lead: Lead) => {
    navigate('/crm/followups', {
      state: {
        fromLead: true,
        customerName: lead.name,
        customerPhone: lead.phone,
        requirement: lead.requirement,
        source: lead.source
      }
    });
  };

  const handleDeleteLead = async (id: string) => {
    const isConfirmed = await confirm('Are you sure you want to delete this lead? This action cannot be undone.', {
      title: 'Delete Lead',
      confirmText: 'Delete',
      destructive: true
    });
    
    if (!isConfirmed) return;

    try {
      await leadApi.deleteLead(id);
      setLeads(leads.filter(lead => lead.id !== id));
      toast.success('Lead deleted successfully');
    } catch (error) {
      console.error('Failed to delete lead', error);
      toast.error('Failed to delete lead');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F3F8] text-[var(--primary-hex)]">
      <div className="flex flex-col h-full space-y-6 md:space-y-8 p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto">

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-5 pb-8 border-b border-[var(--primary-hex)]/[0.05]">
          <div>
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--primary-hex)] mb-2">
              Pipeline
            </p>
            <h1 className="text-3xl font-serif font-bold text-[var(--primary-hex)] tracking-tight">
              Leads Board
            </h1>
            <p className="text-[13px] font-medium text-[var(--primary-hex)]/60 mt-1.5 max-w-xl leading-relaxed">
              Track conversations and inquiries from WhatsApp, Instagram, Email, and Phone to seamlessly convert prospects into clients.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto mt-4 lg:mt-0">
            {/* View Toggle */}
            <div className="flex bg-white rounded-xl border border-[var(--primary-hex)]/10 p-1 shadow-sm h-[46px]">
              <button
                onClick={() => setViewMode('board')}
                className={`flex items-center justify-center px-4 rounded-lg transition-all ${
                  viewMode === 'board'
                    ? 'bg-[var(--primary-hex)] text-white shadow-md'
                    : 'text-[var(--primary-hex)]/40 hover:text-[var(--primary-hex)] hover:bg-[var(--primary-hex)]/5'
                }`}
                title="Board View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center justify-center px-4 rounded-lg transition-all ${
                  viewMode === 'table'
                    ? 'bg-[var(--primary-hex)] text-white shadow-md'
                    : 'text-[var(--primary-hex)]/40 hover:text-[var(--primary-hex)] hover:bg-[var(--primary-hex)]/5'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Search Filter */}
            <div className="relative group w-full sm:w-[320px]">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-[var(--primary-hex)]/30 group-focus-within:text-[var(--primary-hex)] transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search leads, requirements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-[var(--primary-hex)]/10 rounded-xl text-[13px] font-semibold text-[var(--primary-hex)] placeholder-[var(--primary-hex)]/30 focus:outline-none focus:ring-4 focus:ring-[var(--primary-hex)]/10 focus:border-[var(--primary-hex)] transition-all hover:border-[var(--primary-hex)]/20 shadow-sm shadow-[var(--primary-hex)]/[0.02]"
              />
            </div>

            <button
              onClick={openAddModal}
              className="px-6 py-3 bg-gradient-to-br from-[var(--primary-hex)] to-[#2D2854] hover:from-[#2D2854] hover:to-[var(--primary-hex)] text-white rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 shadow-lg shadow-[var(--primary-hex)]/20 hover:shadow-[var(--primary-hex)]/30 hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap group"
            >
              <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" /> Add Lead
            </button>
          </div>
        </div>

        {/* Kanban Board */}
        {isLoading ? (
          <TableSkeleton />
        ) : viewMode === 'board' ? (
          <div className="flex-1 flex gap-5 overflow-x-auto pb-6 h-full min-h-[600px] snap-x snap-mandatory">
            {columns.map(column => {
              const style = columnStyles[column];
              const columnLeads = filteredLeads.filter(l => l.status === column);
              
              const columnTotal = columnLeads.reduce((acc, l) => {
                const valStr = l.value || '';
                const num = Number(valStr.replace(/[^\d.-]/g, ''));
                return acc + (isNaN(num) ? 0 : num);
              }, 0);
              const formattedTotal = `₹${columnTotal.toLocaleString('en-IN')}`;

              return (
                <div key={column} 
                     onDragOver={handleDragOver}
                     onDrop={(e) => handleDrop(e, column)}
                     className="bg-[#F8F8FB]/50 border border-[var(--primary-hex)]/[0.03] p-4 md:p-5 rounded-[20px] flex flex-col min-w-[300px] sm:min-w-[340px] max-w-[360px] shrink-0 snap-start h-full">
                  <div className="flex justify-between items-center mb-5 px-1">
                    <span className="flex items-center gap-2.5 text-[15px] font-bold text-[var(--primary-hex)] tracking-tight">
                      <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                      {column}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold tracking-wide ${style.chip}`}>
                        {formattedTotal}
                      </span>
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold tracking-wide ${style.chip}`}>
                        {columnLeads.length} {columnLeads.length === 1 ? 'Lead' : 'Leads'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                    {columnLeads.length === 0 && (
                      <div className="text-xs text-[var(--primary-hex)]/40 text-center py-10 border-2 border-dashed border-[var(--primary-hex)]/10 rounded-xl bg-white/50 font-medium">
                        No leads here
                      </div>
                    )}
                    {columnLeads.map(lead => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id, column)}
                        className="bg-white p-5 rounded-2xl border border-[var(--primary-hex)]/[0.05] shadow-[0_2px_10px_-4px_rgba(var(--primary-rgb),0.05)] hover:shadow-[0_8px_24px_-8px_rgba(var(--primary-rgb),0.08)] hover:border-[var(--primary-hex)]/[0.1] hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-4 group cursor-grab active:cursor-grabbing"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold tracking-widest text-[var(--primary-hex)]/35 uppercase">{lead.lead_id}</span>
                            {lead.common_id && (
                              <span className="text-[9px] font-bold tracking-widest text-[var(--primary-hex)] uppercase mt-0.5" title="Common Order Tracking ID">{lead.common_id}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] px-2.5 py-1 rounded-full border font-bold tracking-wide ${
                              lead.source === 'WhatsApp' ? 'text-[#10B981] border-[#10B981]/20 bg-[#10B981]/5' :
                              lead.source === 'Instagram Direct' ? 'text-[#F43F5E] border-[#F43F5E]/20 bg-[#F43F5E]/5' :
                              lead.source === 'Email' ? 'text-[#3B82F6] border-[#3B82F6]/20 bg-[#3B82F6]/5' :
                              lead.source === 'Phone Call' ? 'text-[#8B5CF6] border-[#8B5CF6]/20 bg-[#8B5CF6]/5' :
                              'text-[var(--primary-hex)]/60 border-[var(--primary-hex)]/[0.08] bg-[#F8F8FB]'
                            }`}>
                              {lead.source}
                            </span>
                            {column !== 'Lost' && column !== 'Won' && (
                              <button
                                onClick={() => handleAddFollowup(lead)}
                                className="text-[#3B82F6] hover:text-white transition p-1.5 hover:bg-[#3B82F6] bg-[#3B82F6]/10 rounded-lg flex items-center gap-1"
                                title="Add Follow up"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button onClick={() => openEditModal(lead)} className="text-[var(--primary-hex)]/30 hover:text-[var(--primary-hex)] transition p-1.5 hover:bg-[var(--primary-hex)]/10 rounded-lg" title="Edit Lead">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDeleteLead(lead.id)} className="text-[var(--primary-hex)]/30 hover:text-red-500 transition p-1.5 hover:bg-red-500/10 rounded-lg" title="Delete Lead">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-serif font-bold text-[var(--primary-hex)] text-[17px] group-hover:text-[var(--primary-hex)] transition-colors tracking-tight">{lead.name}</h4>
                          <p className="text-[12px] font-semibold text-[var(--primary-hex)]/50 mt-1.5 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-[var(--primary-hex)]/35" /> {lead.phone}
                          </p>
                        </div>

                        {lead.requirement && (
                          <div className="bg-[#F8F8FB] px-3.5 py-3 rounded-xl text-[12px] text-[var(--primary-hex)]/70 border border-[var(--primary-hex)]/[0.03] leading-relaxed shadow-inner">
                            <span className="font-bold text-[var(--primary-hex)]/40 block mb-1 uppercase tracking-widest text-[9px]">Requirement</span>
                            <span className="line-clamp-2 font-medium" title={lead.requirement}>{lead.requirement}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center pt-4 border-t border-[var(--primary-hex)]/[0.04] mt-auto">
                          <span className="text-[14px] font-bold text-[#10B981]">{lead.value}</span>
                          <div className="flex items-center gap-2">
                            {column === 'Won' && (
                              <button
                                onClick={() => handleCreateQuotation(lead)}
                                className="px-3 py-1.5 text-[11px] font-bold text-[#7A5AA8] bg-[#7A5AA8]/10 rounded-md cursor-pointer flex items-center gap-1.5"
                                title="Create Quotation"
                              >
                                <FileText className="w-3.5 h-3.5" /> Quotation
                              </button>
                            )}
                            {column !== 'Lost' && column !== 'Won' && (
                              <>
                                <button
                                  onClick={() => handleMarkLost(lead.id, lead.status)}
                                  className="px-2.5 py-1.5 text-[11px] font-bold text-[#F43F5E] bg-[#F43F5E]/10 rounded-md cursor-pointer"
                                  title="Mark as Lost"
                                >
                                  Lost
                                </button>

                                <button
                                  onClick={() => handleConvertLead(lead)}
                                  className="px-2.5 py-1.5 text-[11px] font-bold text-[#10B981] bg-[#10B981]/10 rounded-md cursor-pointer"
                                  title="Convert to Customer & Create Quotation"
                                >
                                  Convert
                                </button>

                                {column !== 'Qualified' && (
                                  <button
                                    onClick={() => moveStatus(lead.id, lead.status)}
                                    className="px-2.5 py-1.5 text-[11px] font-bold text-[var(--primary-hex)] bg-[var(--primary-hex)]/10 rounded-md cursor-pointer flex items-center gap-1"
                                    title="Move to next stage"
                                  >
                                    Next <ChevronRight className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[var(--primary-hex)]/[0.05] shadow-[0_2px_10px_-4px_rgba(var(--primary-rgb),0.05)] overflow-hidden flex-1 flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#F8F8FB] border-b border-[var(--primary-hex)]/[0.05] sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 font-bold text-[var(--primary-hex)]/60 uppercase tracking-wider text-[11px]">ID</th>
                    <th className="px-6 py-4 font-bold text-[var(--primary-hex)]/60 uppercase tracking-wider text-[11px]">Name</th>
                    <th className="px-6 py-4 font-bold text-[var(--primary-hex)]/60 uppercase tracking-wider text-[11px]">Phone</th>
                    <th className="px-6 py-4 font-bold text-[var(--primary-hex)]/60 uppercase tracking-wider text-[11px]">Requirement</th>
                    <th className="px-6 py-4 font-bold text-[var(--primary-hex)]/60 uppercase tracking-wider text-[11px]">Source</th>
                    <th className="px-6 py-4 font-bold text-[var(--primary-hex)]/60 uppercase tracking-wider text-[11px]">Value</th>
                    <th className="px-6 py-4 font-bold text-[var(--primary-hex)]/60 uppercase tracking-wider text-[11px]">Status</th>
                    <th className="px-6 py-4 font-bold text-[var(--primary-hex)]/60 uppercase tracking-wider text-[11px] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--primary-hex)]/[0.03]">
                  {filteredLeads.map(lead => (
                    <tr key={lead.id} className="hover:bg-[#F8F8FB]/50 transition-colors group">
                      <td className="px-6 py-4 text-[12px] font-bold text-[var(--primary-hex)]/40">
                        {lead.lead_id}
                        {lead.common_id && <div className="text-[10px] text-[var(--primary-hex)] mt-0.5">{lead.common_id}</div>}
                      </td>
                      <td className="px-6 py-4 font-bold text-[var(--primary-hex)] text-[14px]">{lead.name}</td>
                      <td className="px-6 py-4 text-[var(--primary-hex)]/70 font-medium">{lead.phone}</td>
                      <td className="px-6 py-4">
                        <div className="max-w-[200px] truncate text-[var(--primary-hex)]/60 text-[13px]" title={lead.requirement}>
                          {lead.requirement || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[11px] px-2.5 py-1 rounded-full border font-bold tracking-wide ${
                          lead.source === 'WhatsApp' ? 'text-[#10B981] border-[#10B981]/20 bg-[#10B981]/5' :
                          lead.source === 'Instagram Direct' ? 'text-[#F43F5E] border-[#F43F5E]/20 bg-[#F43F5E]/5' :
                          lead.source === 'Email' ? 'text-[#3B82F6] border-[#3B82F6]/20 bg-[#3B82F6]/5' :
                          lead.source === 'Phone Call' ? 'text-[#8B5CF6] border-[#8B5CF6]/20 bg-[#8B5CF6]/5' :
                          'text-[var(--primary-hex)]/60 border-[var(--primary-hex)]/[0.08] bg-[#F8F8FB]'
                        }`}>
                          {lead.source}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-[#10B981]">{lead.value}</td>
                      <td className="px-6 py-4">
                        <select
                          value={lead.status}
                          onChange={async (e) => {
                            const newStatus = e.target.value as Lead['status'];
                            if (newStatus === 'Lost') {
                              handleMarkLost(lead.id, lead.status);
                            } else {
                              setLeads(leads.map(l => l.id === lead.id ? { ...l, status: newStatus } : l));
                              try {
                                await leadApi.updateLeadStatus(lead.id, newStatus);
                              } catch (error) {
                                setLeads(leads.map(l => l.id === lead.id ? { ...l, status: lead.status } : l));
                                toast.error('Failed to update lead status on the server.');
                              }
                            }
                          }}
                          className={`text-[12px] font-bold px-3 py-1.5 rounded-lg border focus:ring-2 focus:ring-[var(--primary-hex)]/20 outline-none cursor-pointer appearance-none ${columnStyles[lead.status].chip}`}
                        >
                          {columns.map(col => (
                            <option key={col} value={col}>{col}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {lead.status === 'Won' && (
                            <button onClick={() => handleCreateQuotation(lead)} className="p-1.5 text-[#7A5AA8] hover:bg-[#7A5AA8]/10 rounded-lg transition-colors" title="Create Quotation">
                              <FileText className="w-4 h-4" />
                            </button>
                          )}
                          {lead.status !== 'Lost' && lead.status !== 'Won' && (
                            <button onClick={() => handleAddFollowup(lead)} className="p-1.5 text-[#3B82F6] hover:bg-[#3B82F6]/10 rounded-lg transition-colors" title="Add Follow up">
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => openEditModal(lead)} className="p-1.5 text-[var(--primary-hex)]/40 hover:text-[var(--primary-hex)] hover:bg-[var(--primary-hex)]/10 rounded-lg transition-colors" title="Edit Lead">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteLead(lead.id)} className="p-1.5 text-[var(--primary-hex)]/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete Lead">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredLeads.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-[var(--primary-hex)]/40 font-medium text-[13px]">
                        No leads found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Lead Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-[var(--primary-hex)]/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl border border-[var(--primary-hex)]/[0.05] shadow-[0_24px_64px_-16px_rgba(var(--primary-rgb),0.2)] w-full max-w-md overflow-hidden scale-in-center">
              <div className="px-7 py-6 border-b border-[var(--primary-hex)]/[0.05] flex justify-between items-start bg-gradient-to-b from-white to-[#F8F8FB]/50">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--primary-hex)] mb-1.5">{editingLeadId ? 'Edit Entry' : 'New Entry'}</p>
                  <h3 className="font-serif font-bold text-[var(--primary-hex)] text-xl tracking-tight">{editingLeadId ? 'Edit Lead' : 'Add New Lead'}</h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-[var(--primary-hex)]/40 hover:text-[#F43F5E] hover:bg-[#F43F5E]/10 p-2 rounded-xl transition-colors"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
              <form onSubmit={handleSaveLead} className="p-7 space-y-5">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--primary-hex)]/60 uppercase tracking-widest mb-2">Lead Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Shalini Roy"
                    className="w-full px-4 py-3 bg-white border border-[var(--primary-hex)]/10 rounded-xl text-[13px] font-semibold text-[var(--primary-hex)] placeholder-[var(--primary-hex)]/30 focus:outline-none focus:ring-4 focus:ring-[var(--primary-hex)]/10 focus:border-[var(--primary-hex)] transition-all hover:border-[var(--primary-hex)]/20 shadow-sm shadow-[var(--primary-hex)]/[0.02]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[var(--primary-hex)]/60 uppercase tracking-widest mb-2">Phone / Email *</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="e.g. +91 98765 43210 or email"
                    className="w-full px-4 py-3 bg-white border border-[var(--primary-hex)]/10 rounded-xl text-[13px] font-semibold text-[var(--primary-hex)] placeholder-[var(--primary-hex)]/30 focus:outline-none focus:ring-4 focus:ring-[var(--primary-hex)]/10 focus:border-[var(--primary-hex)] transition-all hover:border-[var(--primary-hex)]/20 shadow-sm shadow-[var(--primary-hex)]/[0.02]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[var(--primary-hex)]/60 uppercase tracking-widest mb-2">Requirement Details</label>
                  <textarea
                    value={requirement}
                    onChange={(e) => setRequirement(e.target.value)}
                    placeholder="e.g. Asking about Bridal Lehenga prices"
                    rows={2}
                    className="w-full px-4 py-3 bg-white border border-[var(--primary-hex)]/10 rounded-xl text-[13px] font-semibold text-[var(--primary-hex)] placeholder-[var(--primary-hex)]/30 focus:outline-none focus:ring-4 focus:ring-[var(--primary-hex)]/10 focus:border-[var(--primary-hex)] transition-all hover:border-[var(--primary-hex)]/20 shadow-sm shadow-[var(--primary-hex)]/[0.02] resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--primary-hex)]/60 uppercase tracking-widest mb-2">Est. Value (INR)</label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="25000"
                      className="w-full px-4 py-3 bg-white border border-[var(--primary-hex)]/10 rounded-xl text-[13px] font-semibold text-[var(--primary-hex)] placeholder-[var(--primary-hex)]/30 focus:outline-none focus:ring-4 focus:ring-[var(--primary-hex)]/10 focus:border-[var(--primary-hex)] transition-all hover:border-[var(--primary-hex)]/20 shadow-sm shadow-[var(--primary-hex)]/[0.02]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--primary-hex)]/60 uppercase tracking-widest mb-2">Lead Source</label>
                    <select
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-[var(--primary-hex)]/10 rounded-xl text-[13px] font-semibold text-[var(--primary-hex)] focus:outline-none focus:ring-4 focus:ring-[var(--primary-hex)]/10 focus:border-[var(--primary-hex)] transition-all hover:border-[var(--primary-hex)]/20 shadow-sm shadow-[var(--primary-hex)]/[0.02] cursor-pointer"
                    >
                      <option>WhatsApp</option>
                      <option>Instagram Direct</option>
                      <option>Email</option>
                      <option>Phone Call</option>
                      <option>Walk-in</option>
                      <option>Referral</option>
                      <option>Google Search</option>
                      <option>Facebook Ad</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 mt-2 bg-gradient-to-br from-[var(--primary-hex)] to-[#2D2854] hover:from-[#2D2854] hover:to-[var(--primary-hex)] text-white rounded-xl text-[13px] font-bold shadow-lg shadow-[var(--primary-hex)]/20 hover:shadow-[var(--primary-hex)]/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Saving...' : editingLeadId ? 'Update Lead' : 'Save Lead'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leads;