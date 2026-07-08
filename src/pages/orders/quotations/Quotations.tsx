import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, Trash2, X, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { quotationApi } from '../../../api/quotationApi';
import { orderApi } from '../../../api/orderApi';
import { followupApi } from '../../../api/followupApi';
import { customerApi } from '../../../api/customerApi';
import { useConfirm } from '../../../context';

interface Quotation {
  id: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  items: string;
  totalAmount: number;
  discount: number;
  date: string;
  validUntil: string;
  terms: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Invoiced';
}

const statusStyles: Record<string, string> = {
  'Draft': 'bg-[#16132D]/[0.05] text-[#16132D]/70',
  'Sent': 'bg-[#7A5AA8]/10 text-[#5d4485]',
  'Accepted': 'bg-[#10B981]/10 text-[#234638]',
  'Rejected': 'bg-[#F43F5E]/10 text-[#7a2e34]',
  'Invoiced': 'bg-purple-50 text-purple-700 border-purple-200/50',
};

const Quotations: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { confirm } = useConfirm();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [items, setItems] = useState('');
  const [totalAmount, setTotalAmount] = useState<number | ''>('');
  const [discount, setDiscount] = useState<number | ''>('');
  const [validUntil, setValidUntil] = useState('');
  const [terms, setTerms] = useState('');
  
  const [followupId, setFollowupId] = useState<string | null>(null);

  // If navigated from a converted lead, auto-open the modal with pre-filled data
  useEffect(() => {
    const state = location.state as any;
    if (state?.fromLead) {
      setCustomerName(state.customerName || '');
      setItems(state.items || '');
      setFollowupId(state.followupId || null);
      const numericValue = parseFloat(String(state.totalAmount).replace(/[^0-9.]/g, ''));
      setTotalAmount(isNaN(numericValue) ? '' : numericValue);
      setIsModalOpen(true);
      // Clear the state so refreshing the page doesn't re-open the modal
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await quotationApi.getQuotations();
        const formatted = data.map((item: any) => ({
          id: `QOT-${item.id}`,
          customerName: item.customer_name,
          customerPhone: item.customer_phone,
          customerEmail: item.customer_email,
          items: item.items,
          totalAmount: parseFloat(item.total_amount) || 0,
          discount: parseFloat(item.discount) || 0,
          date: new Date(item.date).toISOString().split('T')[0],
          validUntil: new Date(item.valid_until).toISOString().split('T')[0],
          terms: item.terms || '',
          status: item.status,
        }));
        setQuotations(formatted);
      } catch (error) {
        console.error('Error loading quotations:', error);
      }
    };
    const fetchCustomers = async () => {
      try {
        const data = await customerApi.getCustomers().catch(() => []);
        setCustomers(data);
      } catch (err) {
        console.error('Error loading customers:', err);
      }
    };
    fetchData();
    fetchCustomers();
  }, []);

  const filtered = quotations.filter(q => {
    const match = q.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || q.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || q.status === statusFilter;
    return match && matchStatus;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !items || !totalAmount || !validUntil) return;

    try {
      // 1. Create or ensure customer exists
      const existingCustomer = customers.find(c => c.phone === customerPhone && customerPhone !== '');
      if (!existingCustomer) {
        try {
          await customerApi.addCustomer({ 
            name: customerName, 
            phone: customerPhone || 'N/A', 
            email: customerEmail || '',
            address: '' 
          });
        } catch (custError) {
          console.warn('Customer creation skipped/failed:', custError);
        }
      }

      const response = await quotationApi.addQuotation({
        customer_name: customerName,
        customer_phone: customerPhone || '',
        customer_email: customerEmail || '',
        items, 
        total_amount: totalAmount,
        discount: discount || 0, 
        valid_until: validUntil, 
        terms,
      });
      const q = response.quotation;
      setQuotations([{
        id: `QOT-${q.id}`, customerName: q.customer_name, customerPhone: q.customer_phone, customerEmail: q.customer_email, items: q.items,
        totalAmount: parseFloat(q.total_amount), discount: parseFloat(q.discount),
        date: new Date(q.date).toISOString().split('T')[0],
        validUntil: new Date(q.valid_until).toISOString().split('T')[0],
        terms: q.terms || '', status: q.status,
      }, ...quotations]);
      setCustomerName(''); setCustomerPhone(''); setCustomerEmail(''); setItems(''); setTotalAmount(''); setDiscount(''); setValidUntil(''); setTerms('');
      setIsModalOpen(false);

      if (followupId) {
        try {
          await followupApi.updateFollowupStatus(followupId, 'Completed');
        } catch (err) {
          console.error('Failed to complete followup:', err);
        }
        setFollowupId(null);
      }
    } catch (error) {
      console.error('Error creating quotation:', error);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await quotationApi.updateStatus(id, status);
      setQuotations(quotations.map(q => q.id === id ? { ...q, status: status as Quotation['status'] } : q));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await quotationApi.deleteQuotation(id);
      setQuotations(quotations.filter(q => q.id !== id));
    } catch (error) {
      console.error('Error deleting quotation:', error);
    }
  };

  const handleConvertToOrder = async (id: string) => {
    const q = quotations.find(q => q.id === id);
    if (!q) return;
    
    const isConfirmed = await confirm('Convert this quotation to an Order? You will be asked to add measurements first.', {
      title: 'Convert Quotation',
      confirmText: 'Convert to Order'
    });
    if (!isConfirmed) return;
    
    navigate('/measurements', { 
      state: { 
        openNewModal: true,
        customerName: q.customerName,
        garment: q.items,
        returnTo: '/orders/list',
        cancelReturnTo: '/orders/quotations',
        actionOnSuccess: {
          type: 'convertQuotation',
          quotationId: id
        }
      } 
    });
  };

  return (
    <div className="min-h-screen bg-[#F4F3F8] text-[#16132D]">
      <div className="flex flex-col h-full space-y-5 p-6 md:p-8 max-w-[1500px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 pb-5 border-b border-[#16132D]/[0.08]">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#7209B7] mb-1.5">Estimates</p>
            <h1 className="text-3xl md:text-[2rem] font-serif font-semibold tracking-tight text-[#16132D]">Quotations</h1>
            <p className="text-sm text-[#16132D]/55 mt-1">Create and manage price estimates for bespoke garment orders.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2.5 bg-[#16132D] hover:bg-[#2a3545] text-[#F4F3F8] rounded-xl text-sm font-semibold flex items-center gap-1.5 transition shadow-md shadow-[#16132D]/10 self-start sm:self-auto">
            <Plus className="w-4 h-4" /> New Quotation
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center bg-white border border-[#16132D]/[0.08] rounded-xl px-4 py-2.5 w-full sm:w-80 shadow-sm focus-within:ring-2 focus-within:ring-[#7209B7]/25 transition">
            <Search className="w-4 h-4 text-[#16132D]/35 mr-2 flex-shrink-0" />
            <input type="text" placeholder="Search quotations..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent border-none outline-none text-sm text-[#16132D] placeholder-[#16132D]/35 w-full" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 border border-[#16132D]/[0.08] rounded-xl bg-white text-sm font-semibold text-[#16132D]/70 focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 transition cursor-pointer">
            <option value="All">All Statuses</option>
            <option>Draft</option>
            <option>Sent</option>
            <option>Accepted</option>
            <option>Rejected</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#16132D]/[0.06] shadow-[0_1px_3px_rgba(28,36,48,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#16132D]/75">
              <thead>
                <tr className="border-b border-[#16132D]/[0.06] bg-[#16132D]/[0.02] text-[#16132D]/55 font-semibold text-xs tracking-wider uppercase">
                  <th className="py-4 px-6">Quotation</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Items</th>
                  <th className="py-4 px-6 text-right">Amount</th>
                  <th className="py-4 px-6">Valid Until</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#16132D]/[0.04]">
                {filtered.map(q => (
                  <tr key={q.id} className="hover:bg-[#16132D]/[0.02] transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#16132D]/35" />
                        <span className="font-serif font-bold text-[#16132D]">{q.id}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-[#16132D]">{q.customerName}</div>
                      {(q.customerPhone || q.customerEmail) && (
                        <div className="text-xs text-[#16132D]/55 mt-0.5">
                          {q.customerPhone} {q.customerPhone && q.customerEmail && '•'} {q.customerEmail}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-[#16132D]/65 max-w-[200px] truncate">{q.items}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="font-bold text-[#16132D]">₹{q.totalAmount.toLocaleString('en-IN')}</div>
                      {q.discount > 0 && <div className="text-[10px] text-[#10B981] font-semibold">{q.discount}% off</div>}
                    </td>
                    <td className="py-4 px-6 text-[#16132D]/55 font-medium">{q.validUntil}</td>
                    <td className="py-4 px-6">
                      <select
                        value={q.status}
                        onChange={(e) => handleUpdateStatus(q.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border-none cursor-pointer focus:outline-none ${statusStyles[q.status]}`}
                      >
                        <option>Draft</option>
                        <option>Sent</option>
                        <option>Accepted</option>
                        <option>Rejected</option>
                      </select>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {q.status !== 'Rejected' && q.status !== 'Accepted' && (
                          <button
                            onClick={() => handleConvertToOrder(q.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 transition"
                            title="Convert to Order"
                          >
                            Convert to Order <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {q.status === 'Accepted' && (
                          <span className="px-3 py-1.5 text-xs font-bold text-[#10B981] flex items-center gap-1">
                            ✓ Converted
                          </span>
                        )}
                        <button onClick={() => handleDelete(q.id)} className="p-1.5 rounded-lg text-[#16132D]/35 hover:text-[#F43F5E] hover:bg-[#F43F5E]/10 transition" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="py-12 text-center text-sm font-semibold text-[#16132D]/35">No quotations found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-[#16132D]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl border border-[#16132D]/[0.06] shadow-2xl shadow-[#16132D]/20 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
              <div className="px-6 py-5 border-b border-[#16132D]/[0.08] flex justify-between items-center shrink-0">
                <h2 className="text-xl font-serif font-bold text-[#16132D]">New Quotation</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-[#16132D]/[0.03] hover:bg-[#16132D]/[0.08] text-[#16132D]/50 hover:text-[#16132D] rounded-full transition"><X className="w-4 h-4" /></button>
              </div>
              <div className="overflow-y-auto p-6">
                <form id="quotationForm" onSubmit={handleCreate} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Customer Name *</label>
                    <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required placeholder="e.g. Tanvi Jha" className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 focus:border-[#7209B7]/40 text-sm transition" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Phone Number</label>
                      <input 
                        type="text" 
                        value={customerPhone} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomerPhone(val);
                          const existing = customers.find(c => c.phone === val);
                          if (existing) {
                            setCustomerName(existing.name);
                            if (existing.email) setCustomerEmail(existing.email);
                          }
                        }} 
                        placeholder="e.g. +91 98765 43210" 
                        className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 focus:border-[#7209B7]/40 text-sm transition" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Email</label>
                      <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="e.g. tanvi@example.com" className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 focus:border-[#7209B7]/40 text-sm transition" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Items Description *</label>
                    <textarea value={items} onChange={(e) => setItems(e.target.value)} required placeholder="e.g. Bridal Lehenga + Dupatta + Blouse" rows={2} className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 focus:border-[#7209B7]/40 text-sm transition resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Total Amount (₹) *</label>
                      <input type="number" value={totalAmount} onChange={(e) => setTotalAmount(Number(e.target.value))} required placeholder="65000" className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 focus:border-[#7209B7]/40 text-sm transition" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Discount (%)</label>
                      <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} placeholder="0" className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 focus:border-[#7209B7]/40 text-sm transition" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Valid Until *</label>
                    <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} required className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 focus:border-[#7209B7]/40 text-sm transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Terms & Conditions</label>
                    <textarea value={terms} onChange={(e) => setTerms(e.target.value)} placeholder="e.g. 50% advance required. Balance on delivery." rows={2} className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 focus:border-[#7209B7]/40 text-sm transition resize-none" />
                  </div>
                </form>
              </div>
              <div className="px-6 py-5 border-t border-[#16132D]/[0.08] flex justify-end shrink-0 bg-[#F4F3F8]/50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-[#16132D]/60 hover:text-[#16132D] transition mr-3">Cancel</button>
                <button type="submit" form="quotationForm" className="px-6 py-2.5 bg-[#16132D] hover:bg-[#2a3545] text-[#F4F3F8] rounded-xl text-sm font-bold shadow-md shadow-[#16132D]/10 transition">Save Quotation</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Quotations;
