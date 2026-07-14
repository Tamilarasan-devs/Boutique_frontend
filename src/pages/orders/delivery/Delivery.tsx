import React, { useState, useEffect } from 'react';
import { Search, Truck, Phone, CheckCircle, PackageCheck, Trash2, Eye, LayoutGrid, List, FileText, X } from 'lucide-react';
import { deliveryApi } from '../../../api/deliveryApi';
import { useToast, useConfirm } from '../../../context';
import { TableSkeleton, CardSkeleton } from '../../../components/ui/Skeleton';

interface DeliveryItem {
  id: string | number; // Database ID
  displayId: string; // UI display ID
  order_id: string;
  customer_name: string;
  phone: string;
  garment: string;
  ready_date: string;
  status: 'Ready for Pickup' | 'Out for Delivery' | 'Delivered';
}

const Delivery: React.FC = () => {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [viewMode, setViewMode] = useState<'table' | 'card'>(() => {
    return (localStorage.getItem('deliveryViewMode') as 'table' | 'card') || 'table';
  });
  const [viewingDelivery, setViewingDelivery] = useState<DeliveryItem | null>(null);

  useEffect(() => {
    localStorage.setItem('deliveryViewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const data = await deliveryApi.getDeliveries();
      const formatted = data.map((item: any) => ({
        ...item,
        displayId: item.display_id || `DEL-${item.id}`,
      }));
      setDeliveries(formatted);
    } catch (err) {
      toast('Failed to load deliveries', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = deliveries.filter(d => 
    (d.customer_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (d.order_id?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const updateStatus = async (id: string | number, status: string) => {
    try {
      await deliveryApi.updateStatus(String(id), status);
      toast('Delivery status updated', 'success');
      fetchDeliveries(); // Refresh the list
    } catch (err) {
      toast('Failed to update status', 'error');
    }
  };

  const handleDelete = async (id: string | number) => {
    const isConfirmed = await confirm('Are you sure you want to delete this delivery record?', {
      title: 'Delete Delivery',
      confirmText: 'Delete',
      destructive: true
    });
    
    if (isConfirmed) {
      try {
        await deliveryApi.deleteDelivery(id);
        toast('Delivery record deleted', 'success');
        fetchDeliveries();
      } catch (err) {
        toast('Failed to delete delivery', 'error');
      }
    }
  };

  return (
    <div className="flex flex-col h-full space-y-5 p-6 bg-[#F4F3F8]">
      <div className="pb-5 border-b border-[#16132D]/[0.08]">
        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#7209B7] mb-1.5">Dispatch</p>
        <h1 className="text-3xl md:text-[2rem] font-serif font-bold tracking-tight text-[#16132D] flex items-center gap-2">
          <Truck className="w-8 h-8 text-[#7209B7]" />
          Delivery Management
        </h1>
        <p className="text-sm font-medium text-[#16132D]/60 mt-2">Track pickup readiness and dispatch status for completed garments.</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center bg-white border border-[#16132D]/[0.1] rounded-xl px-4 py-3 w-full sm:w-1/2 shadow-sm focus-within:ring-2 focus-within:ring-[#7209B7]/25 focus-within:border-[#7209B7]/40 transition-all">
          <Search className="w-5 h-5 text-[#16132D]/40 mr-2" />
          <input type="text" placeholder="Search deliveries by customer or order..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent border-none outline-none text-sm font-medium text-[#16132D] placeholder-[#16132D]/40 w-full" />
        </div>
        <div className="flex items-center bg-[#16132D]/[0.03] p-1 rounded-xl self-start sm:self-auto border border-[#16132D]/[0.06]">
          <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg flex items-center gap-2 transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-[#16132D] font-bold' : 'text-[#16132D]/50 hover:text-[#16132D] font-medium'}`}>
            <List className="w-4 h-4" /> <span className="text-sm hidden sm:inline">Table</span>
          </button>
          <button onClick={() => setViewMode('card')} className={`p-2 rounded-lg flex items-center gap-2 transition-all ${viewMode === 'card' ? 'bg-white shadow-sm text-[#16132D] font-bold' : 'text-[#16132D]/50 hover:text-[#16132D] font-medium'}`}>
            <LayoutGrid className="w-4 h-4" /> <span className="text-sm hidden sm:inline">Cards</span>
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="flex-1 bg-white rounded-2xl border border-[#16132D]/[0.06] shadow-[0_1px_3px_rgba(28,36,48,0.04)] overflow-hidden">
          <table className="w-full text-left text-sm text-[#16132D]">
            <thead>
              <tr className="border-b border-[#16132D]/[0.06] bg-[#F4F3F8]/50 text-[#16132D]/60 font-bold uppercase tracking-wider text-xs">
                <th className="py-4 px-6">Order</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Garment</th>
                <th className="py-4 px-6">Ready Date</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#16132D]/[0.04]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-0">
                    <TableSkeleton rows={3} />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#16132D]/50 font-medium">
                    No deliveries match your search.
                  </td>
                </tr>
              ) : (
                filtered.map(d => (
                  <tr key={d.id} className="hover:bg-[#F4F3F8]/50 transition-colors group">
                    <td className="py-4 px-6 font-bold text-[#16132D]">{d.order_id || 'N/A'}</td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-[#16132D] text-base">{d.customer_name}</div>
                      <div className="text-xs text-[#16132D]/60 font-medium flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" /> {d.phone || 'N/A'}</div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-[#16132D]/80">{d.garment}</td>
                    <td className="py-4 px-6 text-[#16132D]/70 font-semibold">{d.displayId}</td>
                    <td className="py-4 px-6 text-[#16132D]/70 font-medium">
                      {d.ready_date ? new Date(d.ready_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        d.status === 'Delivered' ? 'bg-[#10B981]/10 text-[#10B981]' :
                        d.status === 'Out for Delivery' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' :
                        'bg-[#7209B7]/10 text-[#7209B7]'
                      }`}>{d.status}</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {d.status === 'Ready for Pickup' && (
                          <button onClick={() => updateStatus(d.id, 'Out for Delivery')} className="px-3 py-1.5 bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 text-[#F59E0B] text-xs font-bold rounded-lg transition flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Dispatch</button>
                        )}
                        {d.status === 'Out for Delivery' && (
                          <button onClick={() => updateStatus(d.id, 'Delivered')} className="px-3 py-1.5 bg-[#10B981]/10 hover:bg-[#10B981]/20 text-[#10B981] text-xs font-bold rounded-lg transition flex items-center gap-1"><PackageCheck className="w-3.5 h-3.5" /> Delivered</button>
                        )}
                        {d.status === 'Delivered' && (
                          <span className="px-3 py-1.5 text-xs text-[#10B981] font-bold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Done</span>
                        )}
                        
                        <div className="w-px h-6 bg-[#16132D]/10 mx-1"></div>

                        <button onClick={() => setViewingDelivery(d)} className="p-1.5 text-[#16132D]/40 hover:text-[#7209B7] hover:bg-[#7209B7]/10 rounded-lg transition" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(d.id)} className="p-1.5 text-[#16132D]/40 hover:text-[#F43F5E] hover:bg-[#F43F5E]/10 rounded-lg transition" title="Delete Delivery">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {isLoading ? (
            <div className="col-span-full">
              <CardSkeleton />
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-full py-12 text-center text-[#16132D]/50 font-medium bg-white rounded-2xl border border-[#16132D]/[0.06]">
              No deliveries match your search.
            </div>
          ) : (
            filtered.map((d) => (
              <div key={d.id} className="bg-white rounded-2xl p-5 border border-[#16132D]/[0.06] shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-[#16132D]/40 tracking-wider uppercase block mb-1">Order {d.order_id || 'N/A'} • {d.displayId}</span>
                    <h3 className="font-serif font-bold text-xl text-[#16132D]">{d.customer_name}</h3>
                    <div className="text-xs text-[#16132D]/60 font-medium flex items-center gap-1 mt-1"><Phone className="w-3 h-3" /> {d.phone || 'N/A'}</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    d.status === 'Delivered' ? 'bg-[#10B981]/10 text-[#10B981]' :
                    d.status === 'Out for Delivery' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' :
                    'bg-[#7209B7]/10 text-[#7209B7]'
                  }`}>{d.status}</span>
                </div>
                
                <div className="bg-[#F4F3F8] p-3 rounded-xl border border-[#16132D]/[0.04] grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#16132D]/40">Garment</span>
                    <p className="text-sm font-bold text-[#16132D]">{d.garment}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#16132D]/40">Ready Date</span>
                    <p className="text-sm font-semibold text-[#16132D]/80">{d.ready_date ? new Date(d.ready_date).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#16132D]/[0.06] flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <button onClick={() => setViewingDelivery(d)} className="p-2 text-[#16132D]/40 hover:text-[#7209B7] hover:bg-[#7209B7]/10 rounded-lg transition" title="View Details">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(d.id)} className="p-2 text-[#16132D]/40 hover:text-[#F43F5E] hover:bg-[#F43F5E]/10 rounded-lg transition" title="Delete Delivery">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div>
                    {d.status === 'Ready for Pickup' && (
                      <button onClick={() => updateStatus(d.id, 'Out for Delivery')} className="px-4 py-2 bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 text-[#F59E0B] text-xs font-bold rounded-xl transition flex items-center gap-1.5"><Truck className="w-4 h-4" /> Dispatch</button>
                    )}
                    {d.status === 'Out for Delivery' && (
                      <button onClick={() => updateStatus(d.id, 'Delivered')} className="px-4 py-2 bg-[#10B981]/10 hover:bg-[#10B981]/20 text-[#10B981] text-xs font-bold rounded-xl transition flex items-center gap-1.5"><PackageCheck className="w-4 h-4" /> Delivered</button>
                    )}
                    {d.status === 'Delivered' && (
                      <span className="px-4 py-2 text-xs text-[#10B981] font-bold flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Done</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* View Details Modal */}
      {viewingDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#16132D]/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in border border-[#16132D]/[0.06]">
            <div className="px-6 py-5 border-b border-[#16132D]/[0.08] flex justify-between items-center bg-[#F4F3F8]/30">
              <h3 className="text-xl font-bold font-serif text-[#16132D] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#7209B7]" />
                Delivery Details
              </h3>
              <button 
                onClick={() => setViewingDelivery(null)}
                className="p-2 bg-[#16132D]/[0.03] hover:bg-[#16132D]/[0.08] text-[#16132D]/50 hover:text-[#16132D] rounded-full transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                   <span className="text-xs font-bold tracking-[0.18em] uppercase text-[#7209B7] mb-1 block">ORDER REF</span>
                   <span className="font-serif font-bold text-2xl text-[#16132D]">{viewingDelivery.order_id || 'N/A'}</span>
                </div>
                <div className="text-right">
                   <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      viewingDelivery.status === 'Delivered' ? 'bg-[#10B981]/10 text-[#10B981]' :
                      viewingDelivery.status === 'Out for Delivery' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' :
                      'bg-[#7209B7]/10 text-[#7209B7]'
                   }`}>
                      {viewingDelivery.status}
                   </span>
                </div>
              </div>

              <div className="bg-[#F4F3F8] p-5 rounded-2xl border border-[#16132D]/[0.04] space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-[#16132D]/40 uppercase tracking-wider mb-1">Customer</p>
                  <p className="text-lg font-bold text-[#16132D]">{viewingDelivery.customer_name}</p>
                  <p className="text-sm font-medium text-[#16132D]/60 flex items-center gap-1.5 mt-1">
                    <Phone className="w-3.5 h-3.5" /> {viewingDelivery.phone || 'N/A'}
                  </p>
                </div>
                <div className="h-px bg-[#16132D]/[0.06] w-full my-2"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-[#16132D]/40 uppercase tracking-wider mb-1">Garment</p>
                    <p className="text-sm font-semibold text-[#16132D]">{viewingDelivery.garment}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#16132D]/40 uppercase tracking-wider block mb-1">ID</span>
                    <p className="text-sm font-semibold text-[#16132D]">{viewingDelivery.displayId}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#16132D]/40 uppercase tracking-wider mb-1">Ready Date</p>
                    <p className="text-sm font-semibold text-[#16132D]">
                      {viewingDelivery.ready_date ? new Date(viewingDelivery.ready_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-5 border-t border-[#16132D]/[0.08] bg-[#F4F3F8]/50 flex justify-end gap-3">
              <button 
                onClick={() => setViewingDelivery(null)}
                className="px-6 py-2.5 bg-[#16132D] text-white rounded-xl text-sm font-bold shadow-md shadow-[#16132D]/10 hover:bg-[#2a3545] transition-all"
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

export default Delivery;

