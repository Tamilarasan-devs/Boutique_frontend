import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Scissors, Calendar as CalendarIcon, ArrowRight, Edit3, Trash2, User, Phone, MapPin, Mail } from 'lucide-react';
import { orderApi } from '../../../api/orderApi';
import { productionApi } from '../../../api/productionApi';
import { employeeApi, Employee } from '../../../api/employeeApi';
import { customerApi } from '../../../api/customerApi';
import { useConfirm } from '../../../context';

interface Order {
  id: string; // The database ID used for API calls
  displayId: string; // The formatted sequence ID for UI
  customerName: string;
  category: string;
  stitchingCost: number;
  totalAmount: number;
  advancePaid: number;
  deliveryDate: string;
  orderDate: string;
  tailor: string;
  fabricDetails: string;
  priority: 'Normal' | 'Rush';
  status: 'Received' | 'Cutting' | 'Stitching' | 'Trial Scheduled' | 'Completed';
  pointsEarned?: number;
  loyaltyDiscount?: number;
}

const statusStyles: Record<string, string> = {
  'Received': 'bg-[#16132D]/[0.05] text-[#16132D]/70',
  'Cutting': 'bg-[#7A5AA8]/10 text-[#5d4485]',
  'Stitching': 'bg-[#8338EC]/10 text-[#6200EA]',
  'Trial Scheduled': 'bg-[#7209B7]/10 text-[#a3531f]',
  'Completed': 'bg-[#10B981]/10 text-[#234638]',
};

const OrderDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [tailors, setTailors] = useState<Employee[]>([]);
  const [productionTailor, setProductionTailor] = useState('');

  useEffect(() => {
    if (location.state && location.state.order) {
      setOrder(location.state.order);
      setProductionTailor(location.state.order.tailor || '');
    } else {
      // If no order data passed in state, redirect back to list
      navigate('/orders/list');
    }

    const fetchTailors = async () => {
      try {
        const res = await employeeApi.getEmployees({ role: 'Tailor', status: 'Active' });
        setTailors(res.data || []);
      } catch (err) {
        console.error('Error fetching tailors:', err);
      }
    };

    const fetchCustomer = async () => {
      if (location.state?.order?.customerName) {
        try {
          const customers = await customerApi.getCustomers();
          const matched = customers.find((c: any) => c.name === location.state.order.customerName);
          setCustomer(matched || null);
        } catch (e) {
          console.error('Error fetching customer:', e);
        }
      }
    };

    fetchTailors();
    fetchCustomer();
  }, [location, navigate]);

  if (!order) return null;

  const handleUpdateStatus = async (nextStatus: string) => {
    try {
      await orderApi.updateOrderStatus(order.id, nextStatus);
      setOrder({ ...order, status: nextStatus as Order['status'] });
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleDeleteOrder = async () => {
    const isConfirmed = await confirm(`Are you sure you want to delete order ${order.displayId}?`, {
      title: 'Delete Order',
      confirmText: 'Delete'
    });
    if (!isConfirmed) return;
    
    try {
      await orderApi.deleteOrder(order.id);
      navigate('/orders/list');
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  const handleTakeMeasurements = () => {
    navigate('/measurements', { 
      state: { 
        openNewModal: true,
        customerName: order.customerName,
        garment: order.category,
        returnTo: `/orders/details`,
        cancelReturnTo: `/orders/details`,
      } 
    });
  };

  const handleSendToProduction = async () => {
    const assignedTailor = productionTailor || order.tailor || '';
    if (!assignedTailor) {
      alert("Please assign a tailor before sending to production.");
      return;
    }

    const isConfirmed = await confirm(`Are you sure you want to send "${order.category}" for ${order.customerName} to the Production queue?`, {
      title: 'Send to Production',
      confirmText: 'Send to Production'
    });
    if (!isConfirmed) return;
    
    try {
      if (assignedTailor !== order.tailor) {
        try {
          // Map camelCase frontend fields to snake_case expected by the backend
          await orderApi.updateOrder(order.id, {
            customer_name: order.customerName,
            category: order.category,
            stitching_cost: order.stitchingCost,
            total_amount: order.totalAmount,
            advance_paid: order.advancePaid,
            delivery_date: order.deliveryDate,
            order_date: order.orderDate,
            tailor: assignedTailor,
            fabric_details: order.fabricDetails,
            priority: order.priority,
            status: order.status,
          });
        } catch (e) {
          console.warn("Failed to update order tailor, but proceeding to production", e);
        }
      }

      await productionApi.addProduction({
        order_id: order.id,
        customer_name: order.customerName,
        garment: order.category,
        tailor: assignedTailor,
        priority: order.priority === 'Rush' ? 'High' : 'Medium',
        expected_end_date: order.deliveryDate,
        notes: order.fabricDetails || '',
      });

      // Update order status — non-blocking: production item already created above
      try {
        await orderApi.updateOrderStatus(order.id, 'Cutting');
      } catch (statusErr) {
        console.warn('Production added but order status update failed:', statusErr);
      }

      setOrder({ ...order, status: 'Cutting', tailor: assignedTailor });
      navigate('/orders/production');
    } catch (err) {
      console.error('Error sending directly to production:', err);
      alert('Failed to send to production. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F3F8] text-[#16132D] p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/orders/list')}
              className="p-2 bg-white rounded-full text-[#16132D]/50 hover:text-[#16132D] hover:bg-[#16132D]/5 transition border border-[#16132D]/[0.08]"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#7209B7] mb-1">
                Order details
              </p>
              <h1 className="text-2xl font-serif font-bold text-[#16132D]">
                {order.displayId} - {order.customerName}
              </h1>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleDeleteOrder}
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
                <div className="bg-white border border-[#16132D]/[0.08] rounded-xl p-4 shadow-sm flex flex-col gap-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold tracking-wider uppercase text-[#16132D]/40">Customer Details</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#7209B7]/10 flex items-center justify-center text-[#7209B7] shrink-0 border border-[#7209B7]/20">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-[#16132D] text-lg">{order.customerName}</div>
                      {customer?.phone && (
                        <div className="text-sm font-medium text-[#16132D]/60 flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3.5 h-3.5" /> {customer.phone}
                        </div>
                      )}
                      {customer?.email && (
                        <div className="text-sm font-medium text-[#16132D]/60 flex items-center gap-1.5 mt-1">
                          <Mail className="w-3.5 h-3.5" /> <span className="truncate">{customer.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {customer?.address && (
                    <div className="text-sm font-medium text-[#16132D]/65 flex items-start gap-2 mt-2 pt-3 border-t border-[#16132D]/[0.06]">
                      <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-[#16132D]/40" />
                      <span className="leading-relaxed">{customer.address}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <span className="text-xs font-bold tracking-wider uppercase text-[#16132D]/40 block mb-1">GARMENT SPECIFICATION</span>
                  <div className="flex items-center gap-2 text-[#16132D] font-medium text-lg">
                    <Scissors className="w-4 h-4 text-[#7209B7]" />
                    {order.category}
                  </div>
                </div>
                
                <div>
                  <span className="text-xs font-bold tracking-wider uppercase text-[#16132D]/40 block mb-1">FABRIC DETAILS</span>
                  <span className="text-[#16132D] whitespace-pre-wrap block bg-[#F4F3F8] p-3 rounded-lg border border-[#16132D]/5 text-sm">{order.fabricDetails || 'No fabric details provided.'}</span>
                </div>
                
                <div>
                  <span className="text-xs font-bold tracking-wider uppercase text-[#16132D]/40 block mb-1">DELIVERY DATE</span>
                  <div className="flex items-center gap-2 text-[#16132D] font-medium">
                    <CalendarIcon className="w-4 h-4 text-[#16132D]/50" />
                    {order.deliveryDate}
                  </div>
                </div>
                
                <div>
                  <span className="text-xs font-bold tracking-wider uppercase text-[#16132D]/40 block mb-1">ASSIGNED TAILOR</span>
                  <span className="text-[#16132D] font-medium">{order.tailor || 'Unassigned'}</span>
                </div>
                </div>
              </div>
            </div>

            {/* Right Column: Financials & Status */}
            <div className="space-y-6">
              <h3 className="text-lg font-serif font-bold border-b border-[#16132D]/[0.06] pb-3 text-[#16132D]">Financials & Actions</h3>
              
              <div className="bg-[#F4F3F8] p-4 rounded-xl border border-[#16132D]/[0.04] space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#16132D]/60 font-semibold">Total Amount</span>
                  <span className="text-[#16132D] font-bold">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#16132D]/60 font-semibold">Advance Paid</span>
                  <span className="text-[#10B981] font-bold">₹{order.advancePaid.toLocaleString('en-IN')}</span>
                </div>
                {(order.loyaltyDiscount || 0) > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#16132D]/60 font-semibold">Loyalty Discount</span>
                    <span className="text-[#F43F5E] font-bold">- ₹{order.loyaltyDiscount?.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-[#16132D]/[0.06]">
                  <span className="text-[#16132D]/80 font-bold">Balance Due</span>
                  <span className="text-[#F43F5E] font-bold text-lg">₹{Math.max(0, order.totalAmount - order.advancePaid).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {(order.pointsEarned || 0) > 0 && (
                <div className="bg-gradient-to-r from-[#7209B7]/10 to-[#7209B7]/5 p-3 rounded-xl border border-[#7209B7]/20 flex items-center justify-center gap-2 text-[#7209B7]">
                  <span className="text-sm font-bold">💎 Earned {order.pointsEarned} Loyalty Points!</span>
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-xs font-bold tracking-wider uppercase text-[#16132D]/40 mb-1">Update Status</label>
                <select 
                  value={order.status} 
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 focus:border-[#7209B7]/40 text-sm font-medium bg-white transition cursor-pointer"
                >
                  <option>Received</option>
                  <option>Cutting</option>
                  <option>Stitching</option>
                  <option>Trial Scheduled</option>
                  <option>Completed</option>
                </select>
              </div>

              {order.status === 'Received' && (
                <div className="space-y-3 pt-4 border-t border-[#16132D]/[0.06]">
                  <div>
                    <label className="block text-xs font-bold tracking-wider uppercase text-[#16132D]/40 mb-1.5">Assign Tailor for Production</label>
                    <select 
                      value={productionTailor}
                      onChange={(e) => setProductionTailor(e.target.value)}
                      className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 focus:border-[#7209B7]/40 text-sm bg-white transition cursor-pointer"
                    >
                      <option value="">-- Select Tailor --</option>
                      {tailors.map(t => (
                        <option key={t.id} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleTakeMeasurements}
                    className="w-full py-3 bg-white border border-[#7209B7] text-[#7209B7] hover:bg-[#7209B7]/5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition"
                  >
                    <Scissors className="w-4 h-4" /> Record Measurements
                  </button>
                  <button
                    onClick={handleSendToProduction}
                    className="w-full py-3 bg-[#7209B7] hover:bg-[#a3531f] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition shadow-md shadow-[#7209B7]/20"
                  >
                    Send to Production <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
