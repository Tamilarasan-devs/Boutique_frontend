import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter, Phone, Calendar, MoreVertical, Trash2, ShieldCheck, HelpCircle, FileText, Upload, ChevronRight, X, Loader2, Edit } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { leadApi, Lead } from '../../../api/leadApi';
import { customerApi } from '../../../api/customerApi';

// ────────────────────────────────────────────────────────────
// Palette (matches Boutique Overview):
// Ink #16132D · Parchment #F4F3F8 · Terracotta #7209B7
// Gold #8338EC · Pine #10B981 · Rosewood #F43F5E · Plum #7A5AA8
// ────────────────────────────────────────────────────────────

const columnStyles: Record<Lead['status'], { dot: string; head: string; chip: string }> = {
  New:       { dot: 'bg-[#7A5AA8]', head: 'text-[#7A5AA8]', chip: 'bg-[#7A5AA8]/10 text-[#5d4485]' },
  Contacted: { dot: 'bg-[#8338EC]', head: 'text-[#6200EA]', chip: 'bg-[#8338EC]/10 text-[#6200EA]' },
  Qualified: { dot: 'bg-[#7209B7]', head: 'text-[#a3531f]', chip: 'bg-[#7209B7]/10 text-[#a3531f]' },
  Won:       { dot: 'bg-[#10B981]', head: 'text-[#234638]', chip: 'bg-[#10B981]/10 text-[#234638]' },
  Lost:      { dot: 'bg-[#F43F5E]', head: 'text-[#7a2e34]', chip: 'bg-[#F43F5E]/10 text-[#7a2e34]' },
};

const Leads: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

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

    try {
      const formattedValue = value ? `₹${Number(value).toLocaleString('en-IN')}` : '₹0';

      if (editingLeadId) {
        const updatedLead = await leadApi.updateLead(editingLeadId, {
          name, phone, source, requirement, value: formattedValue
        });
        setLeads(leads.map(l => l.id === editingLeadId ? updatedLead : l));
      } else {
        const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
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

  const handleConvertLead = async (lead: Lead) => {
    const confirmConvert = window.confirm(`Convert "${lead.name}" to an active customer and create a quotation?`);
    if (!confirmConvert) return;

    // Optimistic UI update to Won status
    setLeads(leads.map(l => l.id === lead.id ? { ...l, status: 'Won' as Lead['status'] } : l));

    try {
      // 1. Update lead status to Won in database
      await leadApi.updateLeadStatus(lead.id, 'Won');

      // 2. Add customer to database
      await customerApi.addCustomer({
        name: lead.name,
        phone: lead.phone,
        email: '',
        address: ''
      });

      // 3. Navigate to Quotations page with lead data pre-filled
      navigate('/orders/quotations', {
        state: {
          fromLead: true,
          customerName: lead.name,
          items: lead.requirement || '',
          totalAmount: lead.value ? lead.value.replace(/[₹,]/g, '') : '',
        }
      });
    } catch (error) {
      console.error('Failed to convert lead', error);
      // Revert status on failure
      setLeads(leads.map(l => l.id === lead.id ? { ...l, status: lead.status } : l));
      alert('Failed to convert lead to customer.');
    }
  };

  const handleCreateQuotation = (lead: Lead) => {
    navigate('/orders/quotations', {
      state: {
        fromLead: true,
        customerName: lead.name,
        items: lead.requirement || '',
        totalAmount: lead.value ? lead.value.replace(/[₹,]/g, '') : '',
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F4F3F8] text-[#16132D]">
      <div className="flex flex-col h-full space-y-6 md:space-y-8 p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto">

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-5 pb-8 border-b border-[#16132D]/[0.05]">
          <div>
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#7209B7] mb-2">
              Pipeline
            </p>
            <h1 className="text-3xl font-serif font-bold text-[#16132D] tracking-tight">
              Leads Board
            </h1>
            <p className="text-[13px] font-medium text-[#16132D]/60 mt-1.5 max-w-xl leading-relaxed">
              Track conversations and inquiries from WhatsApp, Instagram, Email, and Phone to seamlessly convert prospects into clients.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto mt-4 lg:mt-0">
            {/* Search Filter */}
            <div className="relative group w-full sm:w-[320px]">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-[#16132D]/30 group-focus-within:text-[#7209B7] transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search leads, requirements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-[#16132D]/10 rounded-xl text-[13px] font-semibold text-[#16132D] placeholder-[#16132D]/30 focus:outline-none focus:ring-4 focus:ring-[#7209B7]/10 focus:border-[#7209B7] transition-all hover:border-[#16132D]/20 shadow-sm shadow-[#16132D]/[0.02]"
              />
            </div>

            <button
              onClick={openAddModal}
              className="px-6 py-3 bg-gradient-to-br from-[#16132D] to-[#2D2854] hover:from-[#2D2854] hover:to-[#16132D] text-white rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#16132D]/20 hover:shadow-[#16132D]/30 hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap group"
            >
              <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" /> Add Lead
            </button>
          </div>
        </div>

        {/* Kanban Board */}
        {isLoading ? (
          <div className="flex items-center justify-center h-[500px]">
            <Loader2 className="w-8 h-8 text-[#16132D]/40 animate-spin" />
          </div>
        ) : (
          <div className="flex-1 flex gap-5 overflow-x-auto pb-6 h-full min-h-[600px] snap-x snap-mandatory">
            {columns.map(column => {
              const style = columnStyles[column];
              const columnLeads = filteredLeads.filter(l => l.status === column);
              return (
                <div key={column} className="bg-[#F8F8FB]/50 border border-[#16132D]/[0.03] p-4 md:p-5 rounded-[20px] flex flex-col min-w-[300px] sm:min-w-[340px] max-w-[360px] shrink-0 snap-start h-full">
                  <div className="flex justify-between items-center mb-5 px-1">
                    <span className="flex items-center gap-2.5 text-[15px] font-bold text-[#16132D] tracking-tight">
                      <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                      {column}
                    </span>
                    <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold tracking-wide ${style.chip}`}>
                      {columnLeads.length}
                    </span>
                  </div>

                  <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                    {columnLeads.length === 0 && (
                      <div className="text-xs text-[#16132D]/40 text-center py-10 border-2 border-dashed border-[#16132D]/10 rounded-xl bg-white/50 font-medium">
                        No leads here
                      </div>
                    )}
                    {columnLeads.map(lead => (
                      <div
                        key={lead.id}
                        className="bg-white p-5 rounded-2xl border border-[#16132D]/[0.05] shadow-[0_2px_10px_-4px_rgba(22,19,45,0.05)] hover:shadow-[0_8px_24px_-8px_rgba(22,19,45,0.08)] hover:border-[#16132D]/[0.1] hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-4 group"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold tracking-widest text-[#16132D]/35 uppercase">{lead.lead_id}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] px-2.5 py-1 rounded-full border font-bold tracking-wide ${
                              lead.source === 'WhatsApp' ? 'text-[#10B981] border-[#10B981]/20 bg-[#10B981]/5' :
                              lead.source === 'Instagram Direct' ? 'text-[#F43F5E] border-[#F43F5E]/20 bg-[#F43F5E]/5' :
                              lead.source === 'Email' ? 'text-[#3B82F6] border-[#3B82F6]/20 bg-[#3B82F6]/5' :
                              lead.source === 'Phone Call' ? 'text-[#8B5CF6] border-[#8B5CF6]/20 bg-[#8B5CF6]/5' :
                              'text-[#16132D]/60 border-[#16132D]/[0.08] bg-[#F8F8FB]'
                            }`}>
                              {lead.source}
                            </span>
                            <button onClick={() => openEditModal(lead)} className="text-[#16132D]/30 hover:text-[#7209B7] transition p-1 hover:bg-[#7209B7]/10 rounded-lg" title="Edit Lead">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-serif font-bold text-[#16132D] text-[17px] group-hover:text-[#7209B7] transition-colors tracking-tight">{lead.name}</h4>
                          <p className="text-[12px] font-semibold text-[#16132D]/50 mt-1.5 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-[#16132D]/35" /> {lead.phone}
                          </p>
                        </div>

                        {lead.requirement && (
                          <div className="bg-[#F8F8FB] px-3.5 py-3 rounded-xl text-[12px] text-[#16132D]/70 border border-[#16132D]/[0.03] leading-relaxed shadow-inner">
                            <span className="font-bold text-[#16132D]/40 block mb-1 uppercase tracking-widest text-[9px]">Requirement</span>
                            <span className="line-clamp-2 font-medium" title={lead.requirement}>{lead.requirement}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center pt-4 border-t border-[#16132D]/[0.04] mt-auto">
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
                                    className="px-2.5 py-1.5 text-[11px] font-bold text-[#7209B7] bg-[#7209B7]/10 rounded-md cursor-pointer flex items-center gap-1"
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
        )}

        {/* Add Lead Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-[#16132D]/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl border border-[#16132D]/[0.05] shadow-[0_24px_64px_-16px_rgba(22,19,45,0.2)] w-full max-w-md overflow-hidden scale-in-center">
              <div className="px-7 py-6 border-b border-[#16132D]/[0.05] flex justify-between items-start bg-gradient-to-b from-white to-[#F8F8FB]/50">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#7209B7] mb-1.5">{editingLeadId ? 'Edit Entry' : 'New Entry'}</p>
                  <h3 className="font-serif font-bold text-[#16132D] text-xl tracking-tight">{editingLeadId ? 'Edit Lead' : 'Add New Lead'}</h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-[#16132D]/40 hover:text-[#F43F5E] hover:bg-[#F43F5E]/10 p-2 rounded-xl transition-colors"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
              <form onSubmit={handleSaveLead} className="p-7 space-y-5">
                <div>
                  <label className="block text-[11px] font-bold text-[#16132D]/60 uppercase tracking-widest mb-2">Lead Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Shalini Roy"
                    className="w-full px-4 py-3 bg-white border border-[#16132D]/10 rounded-xl text-[13px] font-semibold text-[#16132D] placeholder-[#16132D]/30 focus:outline-none focus:ring-4 focus:ring-[#7209B7]/10 focus:border-[#7209B7] transition-all hover:border-[#16132D]/20 shadow-sm shadow-[#16132D]/[0.02]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#16132D]/60 uppercase tracking-widest mb-2">Phone / Email *</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="e.g. +91 98765 43210 or email"
                    className="w-full px-4 py-3 bg-white border border-[#16132D]/10 rounded-xl text-[13px] font-semibold text-[#16132D] placeholder-[#16132D]/30 focus:outline-none focus:ring-4 focus:ring-[#7209B7]/10 focus:border-[#7209B7] transition-all hover:border-[#16132D]/20 shadow-sm shadow-[#16132D]/[0.02]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#16132D]/60 uppercase tracking-widest mb-2">Requirement Details</label>
                  <textarea
                    value={requirement}
                    onChange={(e) => setRequirement(e.target.value)}
                    placeholder="e.g. Asking about Bridal Lehenga prices"
                    rows={2}
                    className="w-full px-4 py-3 bg-white border border-[#16132D]/10 rounded-xl text-[13px] font-semibold text-[#16132D] placeholder-[#16132D]/30 focus:outline-none focus:ring-4 focus:ring-[#7209B7]/10 focus:border-[#7209B7] transition-all hover:border-[#16132D]/20 shadow-sm shadow-[#16132D]/[0.02] resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#16132D]/60 uppercase tracking-widest mb-2">Est. Value (INR)</label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="25000"
                      className="w-full px-4 py-3 bg-white border border-[#16132D]/10 rounded-xl text-[13px] font-semibold text-[#16132D] placeholder-[#16132D]/30 focus:outline-none focus:ring-4 focus:ring-[#7209B7]/10 focus:border-[#7209B7] transition-all hover:border-[#16132D]/20 shadow-sm shadow-[#16132D]/[0.02]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#16132D]/60 uppercase tracking-widest mb-2">Lead Source</label>
                    <select
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-[#16132D]/10 rounded-xl text-[13px] font-semibold text-[#16132D] focus:outline-none focus:ring-4 focus:ring-[#7209B7]/10 focus:border-[#7209B7] transition-all hover:border-[#16132D]/20 shadow-sm shadow-[#16132D]/[0.02] cursor-pointer"
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
                  className="w-full py-3.5 mt-2 bg-gradient-to-br from-[#16132D] to-[#2D2854] hover:from-[#2D2854] hover:to-[#16132D] text-white rounded-xl text-[13px] font-bold shadow-lg shadow-[#16132D]/20 hover:shadow-[#16132D]/30 hover:-translate-y-0.5 transition-all duration-300"
                >
                  {editingLeadId ? 'Update Lead' : 'Save Lead'}
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