import React, { useState, useEffect } from 'react';
import Pagination from '@/components/ui/Pagination';
import { Search, FileText, Loader2, Calendar } from 'lucide-react';
import { posBillingApi, PosBill } from '../../api/posBillingApi';
import { toast } from 'sonner';

const ProductBillList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [bills, setBills] = useState<PosBill[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Detail Modal
  const [selectedBill, setSelectedBill] = useState<PosBill | null>(null);

  useEffect(() => {
    fetchBills();
  }, [page]);

  const fetchBills = async () => {
    setIsLoading(true);
    try {
      const data = await posBillingApi.getPosBills(page, 20);
      setBills(data.data || []);
      if(data.pagination) setTotalPages(data.pagination.totalPages);
    } catch (err) {
      toast.error('Failed to load product bills');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Basic reload mechanism, can be hooked into an SSE event for pos bills later if needed
    // For now, it will fetch on mount.
  }, []);

  const filteredBills = bills.filter(bill => 
    bill.bill_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 h-full flex flex-col space-y-6 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Product Bill List</h1>
          <p className="text-sm text-slate-500 mt-1">View all bills generated from the POS.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center shadow-sm">
        <Search className="w-5 h-5 text-slate-400 mr-3" />
        <input 
          type="text" 
          placeholder="Search bills by number or customer name..." 
          className="bg-transparent border-none outline-none text-sm w-full font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Bill Number</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-32" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-16" /></td>
                    <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded-full w-20" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p className="text-base font-semibold text-slate-600">No product bills found</p>
                    <p className="text-sm mt-1">Try adjusting your search criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 block">{bill.bill_number}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-700">{bill.customer_name}</div>
                      {bill.customer_phone && (
                        <div className="text-xs text-slate-500 mt-0.5">{bill.customer_phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-slate-500">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(bill.bill_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">₹{parseFloat(bill.total_amount.toString()).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {bill.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedBill(bill)}
                        className="text-blue-600 hover:text-blue-800 font-semibold text-sm transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Detail Modal */}
      {selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-500" />
                {selectedBill.bill_number}
              </h2>
              <button 
                onClick={() => setSelectedBill(null)}
                className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 p-2 rounded-full transition-colors border border-slate-200 shadow-sm"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6 mb-8 bg-slate-50 p-5 rounded-xl border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Customer</p>
                  <p className="font-semibold text-slate-900">{selectedBill.customer_name}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Date</p>
                  <p className="font-semibold text-slate-900">{new Date(selectedBill.bill_date).toLocaleDateString()}</p>
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                Items Purchased
              </h3>
              
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Item</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Qty</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Price</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(() => {
                      try {
                        const items = (typeof selectedBill.items === 'string' ? JSON.parse(selectedBill.items) : selectedBill.items || []);
                        return (items as any[]).map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-3 font-medium text-slate-800">{item.description}</td>
                            <td className="px-4 py-3 text-slate-600">{item.quantity}</td>
                            <td className="px-4 py-3 text-slate-600">₹{parseFloat(item.price.toString()).toFixed(2)}</td>
                            <td className="px-4 py-3 font-semibold text-slate-900 text-right">₹{parseFloat(item.amount.toString()).toFixed(2)}</td>
                          </tr>
                        ));
                      } catch(e) {
                        return (
                          <tr><td colSpan={4} className="px-4 py-3 text-red-500">Error loading items</td></tr>
                        );
                      }
                    })()}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-right font-bold text-slate-600">Grand Total</td>
                      <td className="px-4 py-3 text-right font-black text-blue-600 text-lg">
                        ₹{parseFloat(selectedBill.total_amount.toString()).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setSelectedBill(null)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductBillList;
