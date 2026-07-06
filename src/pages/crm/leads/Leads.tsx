import React, { useState, useEffect } from 'react';
import { Plus, Search, Phone, ChevronRight, X, Loader2, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { leadApi, Lead } from '../../../api/leadApi';
import { customerApi } from '../../../api/customerApi';

// ────────────────────────────────────────────────────────────
// Palette (matches Boutique Overview):
// Ink #1C2430 · Parchment #FAF7F1 · Terracotta #C1652F
// Gold #C99A3E · Pine #2F5D4F · Rosewood #9B3B43 · Plum #7A5AA8
// ────────────────────────────────────────────────────────────

const columnStyles: Record<Lead['status'], { dot: string; head: string; chip: string }> = {
  New:       { dot: 'bg-[#7A5AA8]', head: 'text-[#7A5AA8]', chip: 'bg-[#7A5AA8]/10 text-[#5d4485]' },
  Contacted: { dot: 'bg-[#C99A3E]', head: 'text-[#8a6a25]', chip: 'bg-[#C99A3E]/10 text-[#8a6a25]' },
  Qualified: { dot: 'bg-[#C1652F]', head: 'text-[#a3531f]', chip: 'bg-[#C1652F]/10 text-[#a3531f]' },
  Won:       { dot: 'bg-[#2F5D4F]', head: 'text-[#234638]', chip: 'bg-[#2F5D4F]/10 text-[#234638]' },
  Lost:      { dot: 'bg-[#9B3B43]', head: 'text-[#7a2e34]', chip: 'bg-[#9B3B43]/10 text-[#7a2e34]' },
};

const Leads: React.FC = () => {
  const navigate = useNavigate();
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

  const columns: Lead['status'][] = ['New', 'Contacted', 'Qualified', 'Won', 'Lost'];

  useEffect(() => {
    fetchLeads();
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

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    try {
      const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
      const newLeadData = {
        lead_id: `LEAD-${uniqueSuffix}`,
        name,
        phone,
        source,
        requirement,
        status: 'New' as Lead['status'],
        value: value ? `₹${Number(value).toLocaleString('en-IN')}` : '₹0'
      };

      const savedLead = await leadApi.addLead(newLeadData);
      setLeads([savedLead, ...leads]); // Add to top of list
      
      // Reset form
      setName('');
      setPhone('');
      setRequirement('');
      setValue('');
      setSource('WhatsApp');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to add lead', error);
      alert('Error adding lead. Please try again.');
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
    <div className="min-h-screen bg-[#FAF7F1] text-[#1C2430]">
      <div className="flex flex-col h-full space-y-5 p-6 md:p-8 max-w-[1500px] mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 pb-5 border-b border-[#1C2430]/[0.08]">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#C1652F] mb-1.5">
              Pipeline
            </p>
            <h1 className="text-3xl md:text-[2rem] font-serif font-semibold tracking-tight text-[#1C2430]">
              Leads Board
            </h1>
            <p className="text-sm text-[#1C2430]/55 mt-1">
              Track conversations and inquiries from WhatsApp, Instagram, Email, and Phone.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-[#1C2430] hover:bg-[#2a3545] text-[#FAF7F1] rounded-xl text-sm font-semibold flex items-center gap-1.5 transition shadow-md shadow-[#1C2430]/10 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add Lead
          </button>
        </div>

        {/* Search Filter */}
        <div className="flex items-center bg-white border border-[#1C2430]/[0.08] rounded-xl px-4 py-2.5 w-full sm:w-80 shadow-sm focus-within:ring-2 focus-within:ring-[#C1652F]/25 focus-within:border-[#C1652F]/40 transition">
          <Search className="w-4 h-4 text-[#1C2430]/35 mr-2 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search leads, requirements, or sources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-[#1C2430] placeholder-[#1C2430]/35 w-full"
          />
        </div>

        {/* Kanban Board */}
        {isLoading ? (
          <div className="flex items-center justify-center h-[500px]">
            <Loader2 className="w-8 h-8 text-[#1C2430]/40 animate-spin" />
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-start h-full min-h-[550px] overflow-x-auto">
            {columns.map(column => {
              const style = columnStyles[column];
              const columnLeads = filteredLeads.filter(l => l.status === column);
              return (
                <div key={column} className="bg-[#1C2430]/[0.035] p-3.5 rounded-2xl flex flex-col min-h-[500px] min-w-[230px]">
                  <div className="flex justify-between items-center mb-3.5 px-1">
                    <span className="flex items-center gap-2 text-sm font-bold text-[#1C2430]/80">
                      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                      {column}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${style.chip}`}>
                      {columnLeads.length}
                    </span>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {columnLeads.length === 0 && (
                      <div className="text-xs text-[#1C2430]/30 text-center py-8 border border-dashed border-[#1C2430]/10 rounded-xl">
                        No leads
                      </div>
                    )}
                    {columnLeads.map(lead => (
                      <div
                        key={lead.id}
                        className="bg-white p-4 rounded-xl border border-[#1C2430]/[0.06] shadow-[0_1px_3px_rgba(28,36,48,0.04)] space-y-2.5 hover:shadow-[0_8px_18px_rgba(28,36,48,0.08)] hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold tracking-wide text-[#1C2430]/35">{lead.lead_id}</span>
                          <span className={`text-[10px] bg-[#FAF7F1] px-2 py-0.5 rounded-full border font-semibold ${
                            lead.source === 'WhatsApp' ? 'text-green-700 border-green-200 bg-green-50' :
                            lead.source === 'Instagram Direct' ? 'text-pink-700 border-pink-200 bg-pink-50' :
                            lead.source === 'Email' ? 'text-blue-700 border-blue-200 bg-blue-50' :
                            lead.source === 'Phone Call' ? 'text-indigo-700 border-indigo-200 bg-indigo-50' :
                            'text-[#1C2430]/55 border-[#1C2430]/[0.06]'
                          }`}>
                            {lead.source}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-serif font-semibold text-[#1C2430] text-sm">{lead.name}</h4>
                          <p className="text-xs text-[#1C2430]/50 mt-1 flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-[#1C2430]/35" /> {lead.phone}
                          </p>
                        </div>
                        {lead.requirement && (
                          <div className="bg-[#FAF7F1] px-2.5 py-2 rounded-lg text-xs text-[#1C2430]/65 border border-[#1C2430]/[0.05] leading-relaxed">
                            <span className="font-semibold text-[#1C2430]/80">Requirement — </span>
                            {lead.requirement}
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-2 border-t border-[#1C2430]/[0.04]">
                          <span className="text-sm font-serif font-bold text-[#1C2430]">{lead.value}</span>
                          <div className="flex items-center gap-1.5">
                            {column === 'Won' && (
                              <button
                                onClick={() => handleCreateQuotation(lead)}
                                className="px-2 py-1 text-xs font-semibold text-[#7A5AA8] hover:bg-[#7A5AA8]/10 rounded-md transition cursor-pointer flex items-center gap-0.5"
                                title="Create Quotation"
                              >
                                <FileText className="w-3 h-3" /> Quotation
                              </button>
                            )}
                            {column !== 'Lost' && column !== 'Won' && (
                              <>
                                <button
                                  onClick={() => handleMarkLost(lead.id, lead.status)}
                                  className="px-2 py-1 text-xs font-semibold text-[#9B3B43] hover:bg-[#9B3B43]/10 rounded-md transition cursor-pointer"
                                  title="Mark as Lost"
                                >
                                  Lost
                                </button>

                                <button
                                  onClick={() => handleConvertLead(lead)}
                                  className="px-2 py-1 text-xs font-semibold text-[#2F5D4F] hover:bg-[#2F5D4F]/10 rounded-md transition cursor-pointer"
                                  title="Convert to Customer & Create Quotation"
                                >
                                  Convert
                                </button>

                                {column !== 'Qualified' && (
                                  <button
                                    onClick={() => moveStatus(lead.id, lead.status)}
                                    className="px-2 py-1 text-xs font-semibold text-[#C1652F] hover:bg-[#C1652F]/10 rounded-md transition cursor-pointer flex items-center gap-0.5"
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
          <div className="fixed inset-0 bg-[#1C2430]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl border border-[#1C2430]/[0.06] shadow-2xl shadow-[#1C2430]/20 w-full max-w-md overflow-hidden">
              <div className="px-6 py-5 border-b border-[#1C2430]/[0.08] flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#C1652F] mb-1">New Entry</p>
                  <h3 className="font-serif font-semibold text-[#1C2430] text-lg">Add New Lead</h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-[#1C2430]/35 hover:text-[#1C2430] hover:bg-[#1C2430]/[0.05] p-1.5 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleAddLead} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Lead Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Shalini Roy"
                    className="w-full px-4 py-2.5 border border-[#1C2430]/[0.1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 focus:border-[#C1652F]/40 text-sm transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Phone / Email *</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="e.g. +91 98765 43210 or email"
                    className="w-full px-4 py-2.5 border border-[#1C2430]/[0.1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 focus:border-[#C1652F]/40 text-sm transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Requirement Details</label>
                  <textarea
                    value={requirement}
                    onChange={(e) => setRequirement(e.target.value)}
                    placeholder="e.g. Asking about Bridal Lehenga prices"
                    rows={2}
                    className="w-full px-4 py-2.5 border border-[#1C2430]/[0.1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 focus:border-[#C1652F]/40 text-sm resize-none transition"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Est. Value (INR)</label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="25000"
                      className="w-full px-4 py-2.5 border border-[#1C2430]/[0.1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 focus:border-[#C1652F]/40 text-sm transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Lead Source</label>
                    <select
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className="w-full px-4 py-2.5 border border-[#1C2430]/[0.1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 focus:border-[#C1652F]/40 text-sm bg-white transition"
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
                  className="w-full py-2.5 bg-[#1C2430] hover:bg-[#2a3545] text-[#FAF7F1] rounded-lg text-sm font-semibold transition mt-2 shadow-md shadow-[#1C2430]/10"
                >
                  Save Lead
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