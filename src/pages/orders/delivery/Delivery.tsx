import React, { useState, useEffect } from 'react';
import { Search, Truck, Phone, CheckCircle, PackageCheck } from 'lucide-react';
import { deliveryApi } from '../../../api/deliveryApi';
import { useToast } from '../../../context';

interface DeliveryItem {
  id: string | number;
  order_id: string;
  customer_name: string;
  phone: string;
  garment: string;
  ready_date: string;
  status: 'Ready for Pickup' | 'Out for Delivery' | 'Delivered';
}

const Delivery: React.FC = () => {
  const { toast } = useToast();
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const data = await deliveryApi.getDeliveries();
      setDeliveries(data);
    } catch (err) {
      toast('Failed to load deliveries', 'error');
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

  return (
    <div className="flex flex-col h-full space-y-5 p-6 bg-slate-50/50">
      <div className="pb-5 border-b border-slate-200">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Truck className="w-7 h-7 text-blue-600" />
          Delivery Management
        </h1>
        <p className="text-base font-medium text-slate-600 mt-2">Track pickup readiness and dispatch status for completed garments.</p>
      </div>

      <div className="flex items-center bg-white border border-slate-300 rounded-xl px-4 py-3 w-1/2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition-all">
        <Search className="w-5 h-5 text-slate-400 mr-2" />
        <input type="text" placeholder="Search deliveries by customer or order..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent border-none outline-none text-base font-medium text-slate-800 placeholder-slate-400 w-full" />
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-base text-slate-700">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-sm">
              <th className="py-4 px-6">Order</th>
              <th className="py-4 px-6">Customer</th>
              <th className="py-4 px-6">Garment</th>
              <th className="py-4 px-6">Ready Date</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-600 text-base font-medium">
                  No deliveries match your search.
                </td>
              </tr>
            ) : (
              filtered.map(d => (
                <tr key={d.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="py-4 px-6 font-bold text-slate-900">{d.order_id || 'N/A'}</td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-slate-900">{d.customer_name}</div>
                    <div className="text-sm text-slate-500 font-medium flex items-center gap-1.5 mt-0.5"><Phone className="w-3.5 h-3.5" /> {d.phone || 'N/A'}</div>
                  </td>
                  <td className="py-4 px-6 font-semibold text-slate-800">{d.garment}</td>
                  <td className="py-4 px-6 text-slate-700 font-medium">
                    {d.ready_date ? new Date(d.ready_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                      d.status === 'Delivered' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                      d.status === 'Out for Delivery' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                      'bg-blue-50 text-blue-800 border-blue-200'
                    }`}>{d.status}</span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    {d.status === 'Ready for Pickup' && (
                      <button onClick={() => updateStatus(d.id, 'Out for Delivery')} className="px-4 py-2 bg-amber-50 hover:bg-amber-100 hover:shadow-sm text-amber-800 text-sm font-bold rounded-xl transition flex items-center gap-1.5 inline-flex"><Truck className="w-4 h-4" /> Dispatch</button>
                    )}
                    {d.status === 'Out for Delivery' && (
                      <button onClick={() => updateStatus(d.id, 'Delivered')} className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 hover:shadow-sm text-emerald-800 text-sm font-bold rounded-xl transition flex items-center gap-1.5 inline-flex"><PackageCheck className="w-4 h-4" /> Mark Delivered</button>
                    )}
                    {d.status === 'Delivered' && (
                      <span className="text-sm text-slate-500 font-bold flex items-center gap-1.5 justify-end"><CheckCircle className="w-4 h-4 text-emerald-500" /> Done</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Delivery;
