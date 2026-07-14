import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar as CalendarIcon, ArrowRight, Trash2, User, Phone, Mail, FileSignature } from 'lucide-react';
import { quotationApi } from '../../../api/quotationApi';
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
  imageUrl?: string;
}

const statusStyles: Record<string, string> = {
  'Draft': 'bg-[#16132D]/[0.05] text-[#16132D]/70',
  'Sent': 'bg-[#7A5AA8]/10 text-[#5d4485]',
  'Accepted': 'bg-[#10B981]/10 text-[#234638]',
  'Rejected': 'bg-[#F43F5E]/10 text-[#7a2e34]',
  'Invoiced': 'bg-purple-50 text-purple-700 border-purple-200/50',
};

const QuotationDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const [quotation, setQuotation] = useState<Quotation | null>(null);

  useEffect(() => {
    if (location.state && location.state.quotation) {
      setQuotation(location.state.quotation);
    } else {
      navigate('/orders/quotations');
    }
  }, [location, navigate]);

  if (!quotation) return null;

  const handleUpdateStatus = async (nextStatus: string) => {
    try {
      await quotationApi.updateStatus(quotation.id, nextStatus);
      setQuotation({ ...quotation, status: nextStatus as Quotation['status'] });
    } catch (error) {
      console.error("Error updating quotation status:", error);
    }
  };

  const handleDelete = async () => {
    const isConfirmed = await confirm(`Are you sure you want to delete quotation ${quotation.id}?`, {
      title: 'Delete Quotation',
      confirmText: 'Delete'
    });
    if (!isConfirmed) return;
    
    try {
      await quotationApi.deleteQuotation(quotation.id);
      navigate('/orders/quotations');
    } catch (error) {
      console.error("Error deleting quotation:", error);
    }
  };

  const handleConvertToOrder = () => {
    // Navigate to the list page with the quotation conversion intent in state
    navigate('/orders/quotations', {
       state: {
          convertQuotationId: quotation.id
       }
    });
  };

  return (
    <div className="min-h-screen bg-[#F4F3F8] text-[#16132D] p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/orders/quotations')}
              className="p-2 bg-white rounded-full text-[#16132D]/50 hover:text-[#16132D] hover:bg-[#16132D]/5 transition border border-[#16132D]/[0.08]"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#7209B7] mb-1">
                Quotation details
              </p>
              <h1 className="text-2xl font-serif font-bold text-[#16132D] flex items-center gap-3">
                {quotation.id} 
                <span className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full ${statusStyles[quotation.status]}`}>
                   {quotation.status}
                </span>
              </h1>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleDelete}
              className="px-4 py-2 bg-white text-[#F43F5E] hover:bg-[#F43F5E]/5 border border-[#F43F5E]/20 rounded-xl font-bold flex items-center gap-2 transition"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl border border-[#16132D]/[0.06] shadow-[0_1px_3px_rgba(28,36,48,0.04)] overflow-hidden">
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column: Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-serif font-bold border-b border-[#16132D]/[0.06] pb-3 text-[#16132D]">Overview</h3>
              
              <div className="space-y-6">
                {/* Customer Info Card */}
                <div className="bg-[#F4F3F8]/50 border border-[#16132D]/[0.08] rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold tracking-wider uppercase text-[#16132D]/40">Client Details</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#7209B7]/10 flex items-center justify-center text-[#7209B7] shrink-0 border border-[#7209B7]/20">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[#16132D] text-lg truncate">{quotation.customerName}</div>
                      {quotation.customerPhone && (
                        <div className="text-sm font-medium text-[#16132D]/60 flex items-center gap-1.5 mt-1">
                          <Phone className="w-3.5 h-3.5" /> {quotation.customerPhone}
                        </div>
                      )}
                      {quotation.customerEmail && (
                        <div className="text-sm font-medium text-[#16132D]/60 flex items-center gap-1.5 mt-1">
                          <Mail className="w-3.5 h-3.5" /> <span className="truncate">{quotation.customerEmail}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-5 pt-2">
                  <div>
                    <span className="text-xs font-bold tracking-wider uppercase text-[#16132D]/40 block mb-2">PROPOSED ITEMS</span>
                    <div className="bg-white border border-[#16132D]/[0.06] rounded-xl p-4 shadow-sm">
                       <p className="text-[#16132D]/80 whitespace-pre-wrap leading-relaxed text-[15px]">{quotation.items}</p>
                    </div>
                  </div>
                  
                  {quotation.imageUrl && (
                     <div>
                       <span className="text-xs font-bold tracking-wider uppercase text-[#16132D]/40 block mb-2">REFERENCE IMAGE</span>
                       <div className="bg-white border border-[#16132D]/[0.06] rounded-xl p-2 shadow-sm inline-block">
                          <img src={quotation.imageUrl} alt="Reference" className="max-w-full rounded-lg max-h-64 object-contain" />
                       </div>
                     </div>
                  )}
                  
                  {quotation.terms && (
                     <div>
                       <span className="text-xs font-bold tracking-wider uppercase text-[#16132D]/40 block mb-2 flex items-center gap-1.5">
                          <FileSignature className="w-3.5 h-3.5" /> Terms & Conditions
                       </span>
                       <div className="bg-[#16132D]/[0.02] border border-[#16132D]/[0.04] rounded-xl p-4">
                          <p className="text-[#16132D]/70 whitespace-pre-wrap leading-relaxed text-sm">{quotation.terms}</p>
                       </div>
                     </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Financials & Action */}
            <div className="space-y-6">
              <h3 className="text-lg font-serif font-bold border-b border-[#16132D]/[0.06] pb-3 text-[#16132D]">Financials & Timeline</h3>
              
              <div className="bg-[#F4F3F8] p-5 rounded-xl border border-[#16132D]/[0.04] space-y-4">
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[#16132D]/[0.06]">
                   <div>
                     <span className="text-[10px] font-bold uppercase tracking-wider text-[#16132D]/40 block mb-1">Creation Date</span>
                     <div className="flex items-center gap-1.5 text-sm font-medium text-[#16132D]/80">
                        <CalendarIcon className="w-3.5 h-3.5" /> {quotation.date}
                     </div>
                   </div>
                   <div>
                     <span className="text-[10px] font-bold uppercase tracking-wider text-[#16132D]/40 block mb-1">Valid Until</span>
                     <div className="flex items-center gap-1.5 text-sm font-bold text-[#16132D]">
                        <CalendarIcon className="w-3.5 h-3.5 text-[#7209B7]" /> {quotation.validUntil}
                     </div>
                   </div>
                </div>

                <div className="space-y-3 pt-1">
                   {quotation.discount > 0 && (
                     <div className="flex justify-between items-center text-sm">
                       <span className="text-[#16132D]/60 font-semibold">Discount</span>
                       <span className="text-[#10B981] font-bold px-2 py-0.5 bg-[#10B981]/10 rounded">- {quotation.discount}%</span>
                     </div>
                   )}
                   <div className="flex justify-between items-center">
                     <span className="text-[#16132D]/80 font-bold uppercase tracking-wider text-[11px]">Total Estimate</span>
                     <span className="text-[#16132D] font-bold text-2xl tracking-tight">₹{quotation.totalAmount.toLocaleString('en-IN')}</span>
                   </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <label className="block text-xs font-bold tracking-wider uppercase text-[#16132D]/40 mb-1">Update Status</label>
                <select 
                  value={quotation.status} 
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 focus:border-[#7209B7]/40 text-sm font-medium bg-white transition cursor-pointer"
                >
                  <option>Draft</option>
                  <option>Sent</option>
                  <option>Accepted</option>
                  <option>Rejected</option>
                  <option>Invoiced</option>
                </select>
              </div>

              {quotation.status !== 'Rejected' && quotation.status !== 'Accepted' && (
                <div className="pt-4 border-t border-[#16132D]/[0.06]">
                  <button
                    onClick={handleConvertToOrder}
                    className="w-full py-3.5 bg-[#10B981] hover:bg-[#0da070] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition shadow-md shadow-[#10B981]/20"
                  >
                    Convert to Order <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-center text-[11px] text-[#16132D]/40 mt-3">
                    Converting will prompt for advance payment and measurements.
                  </p>
                </div>
              )}
              
              {quotation.status === 'Accepted' && (
                 <div className="pt-4 border-t border-[#16132D]/[0.06]">
                    <div className="w-full py-3.5 bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                       ✓ Converted to Order
                    </div>
                 </div>
              )}

            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationDetails;
