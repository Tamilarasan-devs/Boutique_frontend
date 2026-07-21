import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, Trash2, X, ArrowRight, Loader2, LayoutGrid, List, Eye, Upload } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { quotationApi } from '../../../api/quotationApi';
import { orderApi } from '../../../api/orderApi';
import { followupApi } from '../../../api/followupApi';
import { customerApi } from '../../../api/customerApi';
import { leadApi } from '../../../api/leadApi';
import { useConfirm } from '../../../context';
import { TableSkeleton, CardSkeleton } from '../../../components/ui/Skeleton';
import Pagination from '../../../components/ui/Pagination';

interface Quotation {
  id: string; // database ID
  displayId: string; // UI display ID
  commonId?: string;
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
  imageUrl?: string;
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
  const [customers, setCustomers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'table' | 'card'>(() => {
    return (localStorage.getItem('quotationsViewMode') as 'table' | 'card') || 'table';
  });

  useEffect(() => {
    localStorage.setItem('quotationsViewMode', viewMode);
  }, [viewMode]);

  // Advance Payment Modal
  const [advanceModalOpen, setAdvanceModalOpen] = useState(false);
  const [selectedForConversion, setSelectedForConversion] = useState<string | null>(null);
  const [advanceAmount, setAdvanceAmount] = useState<number | ''>('');

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [items, setItems] = useState('');
  const [totalAmount, setTotalAmount] = useState<number | ''>('');
  const [validUntil, setValidUntil] = useState('');
  const [terms, setTerms] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [followupId, setFollowupId] = useState<string | null>(null);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [commonId, setCommonId] = useState<string | null>(null);

  // If navigated from a converted lead, auto-open the modal with pre-filled data
  useEffect(() => {
    const state = location.state as any;
    if (state?.fromLead) {
      setCustomerName(state.customerName || '');
      setCustomerPhone(state.customerPhone || '');
      setCustomerEmail(state.customerEmail || '');
      setItems(state.items || '');
      setFollowupId(state.followupId || null);
      setLeadId(state.leadId || null);
      setCommonId(state.commonId || null);
      const numericValue = parseFloat(String(state.totalAmount).replace(/[^0-9.]/g, ''));
      setTotalAmount(isNaN(numericValue) ? '' : numericValue);
      setIsModalOpen(true);
      // Clear the state so refreshing the page doesn't re-open the modal
      navigate(location.pathname, { replace: true, state: {} });
    }

    if (state?.convertQuotationId) {
      handleConvertToOrder(state.convertQuotationId);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await quotationApi.getQuotations(page, 20);
        const formatted = (data.data || data).map((item: any) => ({
          id: item.id.toString(),
          displayId: item.display_id || `QOT-${item.id}`,
          commonId: item.common_id,
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
          imageUrl: item.image_url,
        }));
        setQuotations(formatted);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
        }
      } catch (error) {
        console.error('Error loading quotations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [page]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await customerApi.getCustomers().catch(() => []);
        setCustomers(data);
      } catch (err) {
        console.error('Error loading customers:', err);
      }
    };
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
    setIsSubmitting(true);

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

      let uploadedImageUrl = '';
      if (imageFile) {
        try {
          const uploadRes = await quotationApi.uploadImage(imageFile);
          uploadedImageUrl = uploadRes.image_url;
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
        }
      }

      const response = await quotationApi.addQuotation({
        customer_name: customerName,
        customer_phone: customerPhone || '',
        customer_email: customerEmail || '',
        items, 
        total_amount: totalAmount,
        discount: 0, 
        valid_until: validUntil, 
        terms,
        image_url: uploadedImageUrl || undefined,
        lead_id: leadId || undefined,
        common_id: commonId || undefined
      });
      const q = response.quotation;
      const newQuotation: Quotation = {
        id: q.id.toString(), displayId: q.display_id || `QOT-${q.id}`, commonId: q.common_id, customerName: q.customer_name, customerPhone: q.customer_phone, customerEmail: q.customer_email, items: q.items,
        totalAmount: parseFloat(q.total_amount) || 0, discount: parseFloat(q.discount) || 0,
        date: new Date(q.date).toISOString().split('T')[0], validUntil: new Date(q.valid_until).toISOString().split('T')[0],
        terms: q.terms || '', status: q.status, imageUrl: q.image_url
      };
      setQuotations([newQuotation, ...quotations]);
      setCustomerName(''); setCustomerPhone(''); setCustomerEmail(''); setItems(''); setTotalAmount(''); setValidUntil(''); setTerms(''); setImageFile(null); setImagePreview(null); setCommonId(null);
      setIsModalOpen(false);

      if (followupId) {
        try {
          await followupApi.updateFollowupStatus(followupId, 'Completed');
        } catch (err) {
          console.error('Failed to complete followup:', err);
        }
        setFollowupId(null);
      }

      if (leadId) {
        try {
          await leadApi.updateLeadStatus(leadId, 'Won');
        } catch (err) {
          console.error('Failed to complete lead conversion:', err);
        }
        setLeadId(null);
      }
    } catch (error) {
      console.error('Error creating quotation:', error);
    } finally {
      setIsSubmitting(false);
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

  const handleConvertToOrder = (id: string) => {
    setSelectedForConversion(id);
    setAdvanceAmount('');
    setAdvanceModalOpen(true);
  };

  const proceedWithConversion = () => {
    if (!selectedForConversion) return;
    const q = quotations.find(q => q.id === selectedForConversion);
    if (!q) return;
    
    setAdvanceModalOpen(false);
    
    navigate('/measurements', { 
      state: { 
        openNewModal: true,
        customerName: q.customerName,
        garment: q.items,
        returnTo: '/orders/list',
        cancelReturnTo: '/orders/quotations',
        actionOnSuccess: {
          type: 'convertQuotation',
          quotationId: selectedForConversion,
          advanceAmount: advanceAmount || 0
        }
      } 
    });
  };

  return (
    <div className="flex h-full bg-[#F4F3F8] text-[#16132D] relative overflow-hidden">
      <div className="flex flex-col flex-1 space-y-5 p-6 md:p-8 max-w-[1500px] mx-auto w-full">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 pb-5 border-b border-[#16132D]/[0.08] shrink-0">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#7209B7] mb-1.5">Estimates</p>
            <h1 className="text-3xl md:text-[2rem] font-serif font-semibold tracking-tight text-[#16132D]">Quotations</h1>
            <p className="text-sm text-[#16132D]/55 mt-1">Create and manage price estimates for bespoke garment orders.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2.5 bg-[#16132D] hover:bg-[#2a3545] text-[#F4F3F8] rounded-xl text-sm font-semibold flex items-center gap-1.5 transition shadow-md shadow-[#16132D]/10 self-start sm:self-auto">
            <Plus className="w-4 h-4" /> New Quotation
          </button>
        </div>

        {/* Filters & View Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
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
          
          {/* View Toggle */}
          <div className="flex bg-[#16132D]/[0.05] p-1 rounded-xl self-end sm:self-auto mt-2 sm:mt-0">
            <button 
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg flex items-center justify-center transition-all ${viewMode === 'table' ? 'bg-white text-[#16132D] shadow-sm' : 'text-[#16132D]/50 hover:text-[#16132D]'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-lg flex items-center justify-center transition-all ${viewMode === 'card' ? 'bg-white text-[#16132D] shadow-sm' : 'text-[#16132D]/50 hover:text-[#16132D]'}`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'table' ? (
          <div className="bg-white rounded-2xl border border-[#16132D]/[0.06] shadow-[0_1px_3px_rgba(28,36,48,0.04)] overflow-hidden flex flex-col min-h-[400px] flex-1">
            <div className="overflow-x-auto flex-1">
              {isLoading ? (
                <TableSkeleton />
              ) : (
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
                        <div className="flex flex-col">
                          <span className="font-serif font-bold text-[#16132D]">{q.displayId}</span>
                          {q.commonId && <span className="text-[10px] text-[#7209B7] tracking-widest font-bold uppercase mt-0.5">{q.commonId}</span>}
                        </div>
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
                        <button onClick={() => navigate('/orders/quotations/details', { state: { quotation: q } })} className="p-1.5 rounded-lg text-[#16132D]/45 hover:text-[#7209B7] hover:bg-[#7209B7]/10 transition" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
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
              )}
            </div>
            {totalPages > 0 && (
              <div className="mt-auto border-t border-[#16132D]/[0.06] bg-white p-2 shrink-0">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={(p) => setPage(p)}
                />
              </div>
            )}
          </div>
        ) : isLoading ? (
          <CardSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(q => (
              <div key={q.id} className="bg-white p-5 rounded-2xl border border-[#16132D]/[0.06] shadow-[0_1px_3px_rgba(28,36,48,0.04)] hover:shadow-md transition flex flex-col h-full">
                <div className="flex justify-between items-start mb-4 gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#16132D]/[0.03] flex items-center justify-center">
                      <FileText className="w-4 h-4 text-[#16132D]/60" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-serif font-bold text-[#16132D] text-lg leading-tight">{q.displayId}</span>
                      {q.commonId && <span className="text-[10px] text-[#7209B7] tracking-widest mt-0.5 font-bold uppercase">{q.commonId}</span>}
                    </div>
                  </div>
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
                </div>

                <div className="mb-4">
                  <h3 className="font-bold text-[#16132D] text-[15px] truncate">{q.customerName}</h3>
                  {(q.customerPhone || q.customerEmail) && (
                    <p className="text-xs text-[#16132D]/60 mt-1 truncate">
                      {q.customerPhone} {q.customerPhone && q.customerEmail && '•'} {q.customerEmail}
                    </p>
                  )}
                </div>

                <div className="mb-4 flex-1">
                  <p className="text-xs text-[#16132D]/50 font-bold uppercase tracking-wider mb-1">Items</p>
                  <p className="text-sm text-[#16132D]/70 line-clamp-2">{q.items}</p>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs text-[#16132D]/50 font-bold uppercase tracking-wider">Valid Until</p>
                    <p className="text-sm font-semibold text-[#16132D]/80">{q.validUntil}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-auto pt-4 border-t border-[#16132D]/[0.04] gap-3">
                  <div className="flex flex-col">
                     <span className="text-xs text-[#16132D]/50 font-bold uppercase tracking-wider mb-0.5">Amount</span>
                     <div className="flex items-center gap-2">
                        <span className="font-bold text-[#16132D] text-lg">₹{q.totalAmount.toLocaleString('en-IN')}</span>
                        {q.discount > 0 && <span className="text-[10px] text-[#10B981] font-semibold bg-[#10B981]/10 px-1.5 py-0.5 rounded">{q.discount}% off</span>}
                     </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {q.status !== 'Rejected' && q.status !== 'Accepted' && (
                      <button
                        onClick={() => handleConvertToOrder(q.id)}
                        className="p-1.5 rounded-lg text-[#10B981] hover:bg-[#10B981]/10 transition"
                        title="Convert to Order"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                    {q.status === 'Accepted' && (
                      <span className="p-1.5 text-xs font-bold text-[#10B981] flex items-center gap-1" title="Converted">
                        ✓
                      </span>
                    )}
                    <button onClick={() => navigate('/orders/quotations/details', { state: { quotation: q } })} className="p-1.5 rounded-lg text-[#16132D]/45 hover:text-[#7209B7] hover:bg-[#7209B7]/10 transition" title="View Details">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(q.id)} className="p-1.5 rounded-lg text-[#16132D]/35 hover:text-[#F43F5E] hover:bg-[#F43F5E]/10 transition" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full py-12 text-center text-sm font-semibold text-[#16132D]/35 bg-white rounded-2xl border border-[#16132D]/[0.06]">
                No quotations found.
              </div>
            )}
            {totalPages > 0 && (
              <div className="col-span-full mt-2 bg-white rounded-2xl shadow-[0_1px_3px_rgba(28,36,48,0.04)] border border-[#16132D]/[0.06] overflow-hidden">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={(p) => setPage(p)}
                />
              </div>
            )}
          </div>
        )}

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
                  <div>
                    <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Total Amount (₹) *</label>
                    <input type="number" value={totalAmount} onChange={(e) => setTotalAmount(Number(e.target.value))} required placeholder="65000" className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 focus:border-[#7209B7]/40 text-sm transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Valid Until *</label>
                    <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} required className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 focus:border-[#7209B7]/40 text-sm transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Terms & Conditions</label>
                    <textarea value={terms} onChange={(e) => setTerms(e.target.value)} placeholder="e.g. 50% advance required. Balance on delivery." rows={2} className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 focus:border-[#7209B7]/40 text-sm transition resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Reference Image</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center justify-center px-4 py-2 border border-[#16132D]/[0.1] rounded-xl cursor-pointer hover:bg-[#16132D]/[0.02] transition">
                        <Upload className="w-4 h-4 mr-2 text-[#16132D]/60" />
                        <span className="text-sm font-semibold text-[#16132D]/80">Choose File</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setImageFile(e.target.files[0]);
                            setImagePreview(URL.createObjectURL(e.target.files[0]));
                          }
                        }} />
                      </label>
                      {imagePreview && (
                        <div className="relative">
                          <img src={imagePreview} alt="Preview" className="h-12 w-12 object-cover rounded-lg border border-[#16132D]/10" />
                          <button type="button" onClick={() => {setImageFile(null); setImagePreview(null);}} className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5"><X className="w-3 h-3" /></button>
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </div>
              <div className="px-6 py-5 border-t border-[#16132D]/[0.08] flex justify-end shrink-0 bg-[#F4F3F8]/50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-[#16132D]/60 hover:text-[#16132D] transition mr-3">Cancel</button>
                <button type="submit" form="quotationForm" disabled={isSubmitting} className="px-6 py-2.5 bg-[#16132D] hover:bg-[#2a3545] disabled:opacity-60 text-[#F4F3F8] rounded-xl text-sm font-bold shadow-md shadow-[#16132D]/10 transition flex items-center justify-center gap-2 cursor-pointer">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Saving...' : 'Save Quotation'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Advance Payment Modal */}
        {advanceModalOpen && (
          <div className="fixed inset-0 bg-[#16132D]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl border border-[#16132D]/[0.06] shadow-2xl shadow-[#16132D]/20 w-full max-w-sm overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-[#16132D]/[0.08] flex justify-between items-center">
                <h2 className="text-xl font-serif font-bold text-[#16132D]">Convert to Order</h2>
                <button onClick={() => setAdvanceModalOpen(false)} className="p-2 bg-[#16132D]/[0.03] hover:bg-[#16132D]/[0.08] text-[#16132D]/50 hover:text-[#16132D] rounded-full transition"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-6">
                <p className="text-sm text-[#16132D]/60 mb-4">You are about to convert this quotation to an Order. Enter the advance amount collected (if any), then add customer measurements to proceed.</p>
                <div>
                  <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Advance Amount (₹)</label>
                  <input type="number" value={advanceAmount} onChange={(e) => setAdvanceAmount(Number(e.target.value))} placeholder="0" className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 focus:border-[#7209B7]/40 text-sm transition" />
                </div>
              </div>
              <div className="px-6 py-5 border-t border-[#16132D]/[0.08] flex justify-end bg-[#F4F3F8]/50">
                <button onClick={() => setAdvanceModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-[#16132D]/60 hover:text-[#16132D] transition mr-3">Cancel</button>
                <button onClick={proceedWithConversion} className="px-6 py-2.5 bg-[#10B981] hover:bg-[#0da070] text-white rounded-xl text-sm font-bold shadow-md shadow-[#10B981]/20 transition flex items-center gap-1.5">Proceed <ArrowRight className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        )}

      </div>



    </div>
  );
};

export default Quotations;
