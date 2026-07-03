import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, Trash2, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { quotationApi } from '../../../api/quotationApi';
import { orderApi } from '../../../api/orderApi';

interface Quotation {
  id: string;
  customerName: string;
  items: string;
  totalAmount: number;
  discount: number;
  date: string;
  validUntil: string;
  terms: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
}

const statusStyles: Record<string, string> = {
  'Draft': 'bg-[#1C2430]/[0.05] text-[#1C2430]/70',
  'Sent': 'bg-[#7A5AA8]/10 text-[#5d4485]',
  'Accepted': 'bg-[#2F5D4F]/10 text-[#234638]',
  'Rejected': 'bg-[#9B3B43]/10 text-[#7a2e34]',
};

const Quotations: React.FC = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [items, setItems] = useState('');
  const [totalAmount, setTotalAmount] = useState<number | ''>('');
  const [discount, setDiscount] = useState<number | ''>('');
  const [validUntil, setValidUntil] = useState('');
  const [terms, setTerms] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await quotationApi.getQuotations();
        const formatted = data.map((item: any) => ({
          id: `QOT-${item.id}`,
          customerName: item.customer_name,
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
    fetchData();
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
      const response = await quotationApi.addQuotation({
        customer_name: customerName, items, total_amount: totalAmount,
        discount: discount || 0, valid_until: validUntil, terms,
      });
      const q = response.quotation;
      setQuotations([{
        id: `QOT-${q.id}`, customerName: q.customer_name, items: q.items,
        totalAmount: parseFloat(q.total_amount), discount: parseFloat(q.discount),
        date: new Date(q.date).toISOString().split('T')[0],
        validUntil: new Date(q.valid_until).toISOString().split('T')[0],
        terms: q.terms || '', status: q.status,
      }, ...quotations]);
      setCustomerName(''); setItems(''); setTotalAmount(''); setDiscount(''); setValidUntil(''); setTerms('');
      setIsModalOpen(false);
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
    if (!window.confirm('Convert this quotation to an Order? The quotation will be marked Accepted.')) return;
    try {
      await orderApi.convertFromQuotation(id);
      // Mark accepted locally
      setQuotations(quotations.map(q => q.id === id ? { ...q, status: 'Accepted' } : q));
      navigate('/orders/list');
    } catch (error) {
      console.error('Error converting quotation:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F1] text-[#1C2430]">
      <div className="flex flex-col h-full space-y-5 p-6 md:p-8 max-w-[1500px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 pb-5 border-b border-[#1C2430]/[0.08]">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#C1652F] mb-1.5">Estimates</p>
            <h1 className="text-3xl md:text-[2rem] font-serif font-semibold tracking-tight text-[#1C2430]">Quotations</h1>
            <p className="text-sm text-[#1C2430]/55 mt-1">Create and manage price estimates for bespoke garment orders.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2.5 bg-[#1C2430] hover:bg-[#2a3545] text-[#FAF7F1] rounded-xl text-sm font-semibold flex items-center gap-1.5 transition shadow-md shadow-[#1C2430]/10 self-start sm:self-auto">
            <Plus className="w-4 h-4" /> New Quotation
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center bg-white border border-[#1C2430]/[0.08] rounded-xl px-4 py-2.5 w-full sm:w-80 shadow-sm focus-within:ring-2 focus-within:ring-[#C1652F]/25 transition">
            <Search className="w-4 h-4 text-[#1C2430]/35 mr-2 flex-shrink-0" />
            <input type="text" placeholder="Search quotations..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent border-none outline-none text-sm text-[#1C2430] placeholder-[#1C2430]/35 w-full" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 border border-[#1C2430]/[0.08] rounded-xl bg-white text-sm font-semibold text-[#1C2430]/70 focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 transition cursor-pointer">
            <option value="All">All Statuses</option>
            <option>Draft</option>
            <option>Sent</option>
            <option>Accepted</option>
            <option>Rejected</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#1C2430]/[0.06] shadow-[0_1px_3px_rgba(28,36,48,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#1C2430]/75">
              <thead>
                <tr className="border-b border-[#1C2430]/[0.06] bg-[#1C2430]/[0.02] text-[#1C2430]/55 font-semibold text-xs tracking-wider uppercase">
                  <th className="py-4 px-6">Quotation</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Items</th>
                  <th className="py-4 px-6 text-right">Amount</th>
                  <th className="py-4 px-6">Valid Until</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C2430]/[0.04]">
                {filtered.map(q => (
                  <tr key={q.id} className="hover:bg-[#1C2430]/[0.02] transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#1C2430]/35" />
                        <span className="font-serif font-bold text-[#1C2430]">{q.id}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-[#1C2430]">{q.customerName}</td>
                    <td className="py-4 px-6 text-[#1C2430]/65 max-w-[200px] truncate">{q.items}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="font-bold text-[#1C2430]">₹{q.totalAmount.toLocaleString('en-IN')}</div>
                      {q.discount > 0 && <div className="text-[10px] text-[#2F5D4F] font-semibold">{q.discount}% off</div>}
                    </td>
                    <td className="py-4 px-6 text-[#1C2430]/55 font-medium">{q.validUntil}</td>
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
                            className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 bg-[#2F5D4F]/10 text-[#2F5D4F] hover:bg-[#2F5D4F]/20 transition"
                            title="Convert to Order"
                          >
                            Convert to Order <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {q.status === 'Accepted' && (
                          <span className="px-3 py-1.5 text-xs font-bold text-[#2F5D4F] flex items-center gap-1">
                            ✓ Converted
                          </span>
                        )}
                        <button onClick={() => handleDelete(q.id)} className="p-1.5 rounded-lg text-[#1C2430]/35 hover:text-[#9B3B43] hover:bg-[#9B3B43]/10 transition" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="py-12 text-center text-sm font-semibold text-[#1C2430]/35">No quotations found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-[#1C2430]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl border border-[#1C2430]/[0.06] shadow-2xl shadow-[#1C2430]/20 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
              <div className="px-6 py-5 border-b border-[#1C2430]/[0.08] flex justify-between items-center shrink-0">
                <h2 className="text-xl font-serif font-bold text-[#1C2430]">New Quotation</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-[#1C2430]/[0.03] hover:bg-[#1C2430]/[0.08] text-[#1C2430]/50 hover:text-[#1C2430] rounded-full transition"><X className="w-4 h-4" /></button>
              </div>
              <div className="overflow-y-auto p-6">
                <form id="quotationForm" onSubmit={handleCreate} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Customer Name *</label>
                    <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required placeholder="e.g. Tanvi Jha" className="w-full px-4 py-3 border border-[#1C2430]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 focus:border-[#C1652F]/40 text-sm transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Items Description *</label>
                    <textarea value={items} onChange={(e) => setItems(e.target.value)} required placeholder="e.g. Bridal Lehenga + Dupatta + Blouse" rows={2} className="w-full px-4 py-3 border border-[#1C2430]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 focus:border-[#C1652F]/40 text-sm transition resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Total Amount (₹) *</label>
                      <input type="number" value={totalAmount} onChange={(e) => setTotalAmount(Number(e.target.value))} required placeholder="65000" className="w-full px-4 py-3 border border-[#1C2430]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 focus:border-[#C1652F]/40 text-sm transition" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Discount (%)</label>
                      <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} placeholder="0" className="w-full px-4 py-3 border border-[#1C2430]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 focus:border-[#C1652F]/40 text-sm transition" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Valid Until *</label>
                    <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} required className="w-full px-4 py-3 border border-[#1C2430]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 focus:border-[#C1652F]/40 text-sm transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Terms & Conditions</label>
                    <textarea value={terms} onChange={(e) => setTerms(e.target.value)} placeholder="e.g. 50% advance required. Balance on delivery." rows={2} className="w-full px-4 py-3 border border-[#1C2430]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 focus:border-[#C1652F]/40 text-sm transition resize-none" />
                  </div>
                </form>
              </div>
              <div className="px-6 py-5 border-t border-[#1C2430]/[0.08] flex justify-end shrink-0 bg-[#FAF7F1]/50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-[#1C2430]/60 hover:text-[#1C2430] transition mr-3">Cancel</button>
                <button type="submit" form="quotationForm" className="px-6 py-2.5 bg-[#1C2430] hover:bg-[#2a3545] text-[#FAF7F1] rounded-xl text-sm font-bold shadow-md shadow-[#1C2430]/10 transition">Save Quotation</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Quotations;
