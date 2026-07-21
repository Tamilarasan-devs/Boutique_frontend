import React, { useState } from 'react';
import { Search, Package, MapPin, CheckCircle, FileText, User, Scissors, Truck, IndianRupee, Clock, ArrowRight } from 'lucide-react';
import { orderApi } from '../../../api/orderApi';
import { useToast } from '../../../context';

const OrderTracking = () => {
  const { toast } = useToast();
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setData(null);

    try {
      const res = await orderApi.trackOrder(searchId.trim());
      setData(res);
    } catch (err) {
      toast('Order not found or tracking failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { key: 'lead', title: 'Lead Generated', icon: <User className="w-5 h-5" /> },
    { key: 'quotation', title: 'Quotation', icon: <FileText className="w-5 h-5" /> },
    { key: 'order', title: 'Order Placed', icon: <Package className="w-5 h-5" /> },
    { key: 'production', title: 'In Production', icon: <Scissors className="w-5 h-5" /> },
    { key: 'trial', title: 'Trial Appt', icon: <Clock className="w-5 h-5" /> },
    { key: 'delivery', title: 'Delivered', icon: <Truck className="w-5 h-5" /> },
    { key: 'invoice', title: 'Invoiced', icon: <IndianRupee className="w-5 h-5" /> },
  ];

  const getStepStatus = (stepKey: string) => {
    if (!data) return 'pending';
    if (data[stepKey]) {
      // additional checks if needed
      return 'completed';
    }
    return 'pending';
  };

  return (
    <div className="flex flex-col h-full space-y-6 p-4 sm:p-6 bg-slate-50 overflow-y-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Order Tracking</h1>
        <p className="text-sm text-slate-500 mt-1">Track the complete lifecycle of an order using its Common ID.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-4 max-w-xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Enter Common ID (e.g. ORD-...)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading || !searchId.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition flex items-center gap-2 disabled:opacity-60"
          >
            {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Track'}
          </button>
        </form>
      </div>

      {hasSearched && !loading && !data && (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 border-dashed">
          <Package className="w-16 h-16 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700">No matching order found</h3>
          <p className="text-sm text-slate-500">Please verify the Common ID and try again.</p>
        </div>
      )}

      {data && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Main Info */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg flex justify-between items-center flex-wrap gap-4">
            <div>
              <p className="text-blue-300 text-sm font-bold tracking-widest uppercase mb-1">Order Overview</p>
              <h2 className="text-2xl font-black">{searchId.toUpperCase()}</h2>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-sm mb-1">Customer</p>
              <p className="font-bold text-lg">{data.order?.customer_name || data.lead?.name || data.quotation?.customer_name || 'N/A'}</p>
            </div>
          </div>

          {/* Timeline Stepper */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
            <div className="flex justify-between items-center min-w-[700px]">
              {steps.map((step, idx) => {
                const status = getStepStatus(step.key);
                return (
                  <div key={step.key} className="flex flex-col items-center relative flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 transition-colors shadow-sm
                      ${status === 'completed' ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-slate-100 text-slate-400 border-2 border-slate-200'}`}
                    >
                      {step.icon}
                    </div>
                    <p className={`mt-3 text-sm font-bold ${status === 'completed' ? 'text-slate-800' : 'text-slate-400'}`}>
                      {step.title}
                    </p>
                    
                    {/* Connector line */}
                    {idx < steps.length - 1 && (
                      <div className={`absolute top-6 left-[50%] w-full h-[2px] -z-0
                        ${getStepStatus(steps[idx+1].key) === 'completed' ? 'bg-emerald-500' : 'bg-slate-200'}`} 
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Lead Card */}
            {data.lead && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-blue-600">
                  <User className="w-5 h-5" />
                  <h3 className="font-bold">Lead Details</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="text-slate-500">Name:</span> <span className="font-semibold text-slate-800">{data.lead.name}</span></p>
                  <p><span className="text-slate-500">Source:</span> <span className="font-semibold text-slate-800">{data.lead.source}</span></p>
                  <p><span className="text-slate-500">Status:</span> <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-bold">{data.lead.status}</span></p>
                </div>
              </div>
            )}

            {/* Quotation Card */}
            {data.quotation && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-purple-600">
                  <FileText className="w-5 h-5" />
                  <h3 className="font-bold">Quotation</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="text-slate-500">Total:</span> <span className="font-bold text-slate-800">₹{parseFloat(data.quotation.total_amount).toLocaleString('en-IN')}</span></p>
                  <p><span className="text-slate-500">Status:</span> <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md font-bold">{data.quotation.status}</span></p>
                  <p><span className="text-slate-500">Items:</span> <span className="font-medium text-slate-800 truncate block">{data.quotation.items}</span></p>
                </div>
              </div>
            )}

            {/* Order Card */}
            {data.order && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-indigo-600">
                  <Package className="w-5 h-5" />
                  <h3 className="font-bold">Order Confirmed</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="text-slate-500">Delivery Date:</span> <span className="font-semibold text-slate-800">{new Date(data.order.delivery_date).toLocaleDateString()}</span></p>
                  <p><span className="text-slate-500">Advance:</span> <span className="font-semibold text-emerald-600">₹{parseFloat(data.order.advance_paid).toLocaleString('en-IN')}</span></p>
                  <p><span className="text-slate-500">Status:</span> <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-bold">{data.order.status}</span></p>
                </div>
              </div>
            )}

            {/* Production Card */}
            {data.production && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-orange-600">
                  <Scissors className="w-5 h-5" />
                  <h3 className="font-bold">Production</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="text-slate-500">Stage:</span> <span className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded-md font-bold">{data.production.stage}</span></p>
                  <p><span className="text-slate-500">Tailor:</span> <span className="font-semibold text-slate-800">{data.production.tailor || 'Unassigned'}</span></p>
                </div>
              </div>
            )}

            {/* Trial Card */}
            {data.trial && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-pink-600">
                  <Clock className="w-5 h-5" />
                  <h3 className="font-bold">Trial</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="text-slate-500">Date:</span> <span className="font-semibold text-slate-800">{new Date(data.trial.trial_date).toLocaleString()}</span></p>
                  <p><span className="text-slate-500">Status:</span> <span className="px-2 py-0.5 bg-pink-50 text-pink-700 rounded-md font-bold">{data.trial.status}</span></p>
                </div>
              </div>
            )}

            {/* Delivery Card */}
            {data.delivery && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-emerald-600">
                  <Truck className="w-5 h-5" />
                  <h3 className="font-bold">Delivery</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="text-slate-500">Status:</span> <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-bold">{data.delivery.status}</span></p>
                  <p><span className="text-slate-500">Date:</span> <span className="font-semibold text-slate-800">{data.delivery.delivery_date ? new Date(data.delivery.delivery_date).toLocaleDateString() : 'Pending'}</span></p>
                </div>
              </div>
            )}

            {/* Invoice Card */}
            {data.invoice && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-sky-600">
                  <IndianRupee className="w-5 h-5" />
                  <h3 className="font-bold">Invoice</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="text-slate-500">Invoice #:</span> <span className="font-semibold text-slate-800">{data.invoice.invoice_number}</span></p>
                  <p><span className="text-slate-500">Total:</span> <span className="font-bold text-slate-800">₹{parseFloat(data.invoice.total_amount).toLocaleString('en-IN')}</span></p>
                  <p><span className="text-slate-500">Status:</span> <span className={`px-2 py-0.5 rounded-md font-bold ${data.invoice.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{data.invoice.status}</span></p>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
