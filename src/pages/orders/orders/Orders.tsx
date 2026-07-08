import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar as CalendarIcon, Clock, Eye, Trash2, X, Scissors, Info, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { orderApi } from '../../../api/orderApi';
import { productionApi } from '../../../api/productionApi';
import { employeeApi, Employee } from '../../../api/employeeApi';
import { customerApi } from '../../../api/customerApi';
import { useConfirm } from '../../../context';

interface Order {
  id: string;
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
}

const statusStyles: Record<string, string> = {
  'Received': 'bg-[#16132D]/[0.05] text-[#16132D]/70',
  'Cutting': 'bg-[#7A5AA8]/10 text-[#5d4485]',
  'Stitching': 'bg-[#8338EC]/10 text-[#6200EA]',
  'Trial Scheduled': 'bg-[#7209B7]/10 text-[#a3531f]',
  'Completed': 'bg-[#10B981]/10 text-[#234638]',
};

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { confirm } = useConfirm();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [category, setCategory] = useState('');
  const [stitchingCost, setStitchingCost] = useState<number | ''>('');
  const [totalAmount, setTotalAmount] = useState<number | ''>('');
  const [advancePaid, setAdvancePaid] = useState<number | ''>('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [tailor, setTailor] = useState('');
  const [fabricDetails, setFabricDetails] = useState('');
  const [priority, setPriority] = useState<Order['priority']>('Normal');
  const [tailors, setTailors] = useState<Employee[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderApi.getOrders();
        const formatted = data.map((item: any) => ({
          id: `ORD-${item.id}`,
          customerName: item.customer_name,
          category: item.category,
          stitchingCost: parseFloat(item.stitching_cost) || 0,
          totalAmount: parseFloat(item.total_amount) || 0,
          advancePaid: parseFloat(item.advance_paid) || 0,
          deliveryDate: new Date(item.delivery_date).toISOString().split('T')[0],
          orderDate: new Date(item.order_date).toISOString().split('T')[0],
          tailor: item.tailor || '',
          fabricDetails: item.fabric_details || '',
          priority: item.priority,
          status: item.status
        }));
        setOrders(formatted);
      } catch (error) {
        console.error("Error loading orders", error);
      }
    };

    const fetchTailors = async () => {
      try {
        const data = await employeeApi.getEmployees({ role: 'Tailor', status: 'Active' });
        setTailors(Array.isArray(data) ? data : (data as any).employees || []);
      } catch (err) {
        console.error('Error fetching tailors:', err);
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

    fetchOrders();
    fetchTailors();
    fetchCustomers();

    const state = location.state as any;
    if (state?.openModal) {
      setIsModalOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);

  const filteredOrders = orders.filter(ord => 
    ord.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ord.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ord.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !category || !deliveryDate) return;

    try {
      // 1. Create or ensure customer exists
      const existingCustomer = customers.find(c => c.phone === customerPhone && customerPhone !== '');
      if (!existingCustomer) {
        try {
          await customerApi.addCustomer({ 
            name: customerName, 
            phone: customerPhone || 'N/A', 
            email: '',
            address: '' 
          });
        } catch (custError) {
          console.warn('Customer creation skipped/failed:', custError);
        }
      }

      const response = await orderApi.addOrder({
        customer_name: customerName,
        category,
        stitching_cost: stitchingCost || 0,
        total_amount: totalAmount || 0,
        advance_paid: advancePaid || 0,
        delivery_date: deliveryDate,
        tailor,
        fabric_details: fabricDetails,
        priority
      });
      
      const newOrder: Order = {
        id: `ORD-${response.order.id}`,
        customerName: response.order.customer_name,
        category: response.order.category,
        stitchingCost: parseFloat(response.order.stitching_cost) || 0,
        totalAmount: parseFloat(response.order.total_amount) || 0,
        advancePaid: parseFloat(response.order.advance_paid) || 0,
        deliveryDate: new Date(response.order.delivery_date).toISOString().split('T')[0],
        orderDate: new Date(response.order.order_date).toISOString().split('T')[0],
        tailor: response.order.tailor || '',
        fabricDetails: response.order.fabric_details || '',
        priority: response.order.priority,
        status: response.order.status
      };

      setOrders([newOrder, ...orders]);
      // Reset
      setCustomerName(''); setCustomerPhone(''); setCategory(''); setStitchingCost(''); setTotalAmount('');
      setAdvancePaid(''); setDeliveryDate(''); setTailor(''); setFabricDetails('');
      setPriority('Normal');
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  const handleUpdateStatus = async (id: string, nextStatus: string) => {
    try {
      await orderApi.updateOrderStatus(id, nextStatus);
      setOrders(orders.map(o => o.id === id ? { ...o, status: nextStatus as Order['status'] } : o));
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder({ ...selectedOrder, status: nextStatus as Order['status'] });
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      await orderApi.deleteOrder(id);
      setOrders(orders.filter(o => o.id !== id));
      if (selectedOrder && selectedOrder.id === id) setSelectedOrder(null);
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  const handleTakeMeasurements = (order: Order) => {
    navigate('/measurements', { 
      state: { 
        openNewModal: true,
        customerName: order.customerName,
        garment: order.category,
        returnTo: '/orders/list',
        cancelReturnTo: '/orders/list',
      } 
    });
  };

  const handleSendToProduction = async (order: Order) => {
    const isConfirmed = await confirm(`Are you sure you want to send "${order.category}" for ${order.customerName} to the Production queue?`, {
      title: 'Send to Production',
      confirmText: 'Send to Production'
    });
    if (!isConfirmed) return;
    
    try {
      await productionApi.addProduction({
        order_id: order.id,
        customer_name: order.customerName,
        garment: order.category,
        tailor: order.tailor || '',
        priority: order.priority === 'Rush' ? 'High' : 'Medium',
        expected_end_date: order.deliveryDate,
        notes: order.fabricDetails || '',
      });
      await orderApi.updateOrderStatus(order.id, 'Cutting');
      
      setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'Cutting' } : o));
      setSelectedOrder({ ...order, status: 'Cutting' });
    } catch (err) {
      console.error('Error sending directly to production:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F3F8] text-[#16132D]">
      <div className="flex flex-col h-full space-y-5 p-6 md:p-8 max-w-[1500px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 pb-5 border-b border-[#16132D]/[0.08]">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#7209B7] mb-1.5">
              Production
            </p>
            <h1 className="text-3xl md:text-[2rem] font-serif font-semibold tracking-tight text-[#16132D]">
              Orders
            </h1>
            <p className="text-sm text-[#16132D]/55 mt-1">
              Manage bespoke garment orders, financial advances, and delivery deadlines.
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-[#16132D] hover:bg-[#2a3545] text-[#F4F3F8] rounded-xl text-sm font-semibold flex items-center gap-1.5 transition shadow-md shadow-[#16132D]/10 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> New Order
          </button>
        </div>

        {/* Filter Area & Search */}
        <div className="flex items-center bg-white border border-[#16132D]/[0.08] rounded-xl px-4 py-2.5 w-full sm:w-80 shadow-sm focus-within:ring-2 focus-within:ring-[#7209B7]/25 focus-within:border-[#7209B7]/40 transition">
          <Search className="w-4 h-4 text-[#16132D]/35 mr-2 flex-shrink-0" />
          <input 
            type="text" 
            placeholder="Search by customer or garment..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-[#16132D] placeholder-[#16132D]/35 w-full"
          />
        </div>

        {/* Main Content (Table & Detail Sidebar side-by-side) */}
        <div className="flex gap-6 items-start flex-col lg:flex-row">
          
          {/* Orders Table */}
          <div className="flex-1 w-full bg-white rounded-2xl border border-[#16132D]/[0.06] shadow-[0_1px_3px_rgba(28,36,48,0.04)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#16132D]/75">
                <thead>
                  <tr className="border-b border-[#16132D]/[0.06] bg-[#16132D]/[0.02] text-[#16132D]/55 font-semibold text-xs tracking-wider uppercase">
                    <th className="py-4 px-6">Order Details</th>
                    <th className="py-4 px-6">Financials</th>
                    <th className="py-4 px-6">Delivery Date</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#16132D]/[0.04]">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#16132D]/[0.02] transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${order.priority === 'Rush' ? 'bg-[#F43F5E]/10 text-[#F43F5E]' : 'bg-[#16132D]/5 text-[#16132D]/55'}`}>
                            <Scissors className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-serif font-bold text-[#16132D] text-base">{order.category}</div>
                            <div className="text-xs text-[#16132D]/55 font-medium mt-0.5">For {order.customerName} ({order.id})</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-[#16132D]">₹{order.totalAmount.toLocaleString('en-IN')}</div>
                        <div className="text-[10px] font-semibold text-[#16132D]/50 uppercase tracking-wide mt-0.5">
                          Adv: ₹{order.advancePaid.toLocaleString('en-IN')}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold">
                        <div className="flex items-center gap-1.5 text-[#16132D]/65">
                          <CalendarIcon className="w-4 h-4 text-[#16132D]/40" />
                          {order.deliveryDate}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusStyles[order.status] || statusStyles['Received']}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 rounded-lg text-[#16132D]/45 hover:text-[#7209B7] hover:bg-[#7209B7]/10 transition"
                          title="View Details"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-1.5 rounded-lg text-[#16132D]/45 hover:text-[#F43F5E] hover:bg-[#F43F5E]/10 transition"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-sm font-semibold text-[#16132D]/35">
                        No orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Selected Order Drawer */}
          {selectedOrder && (
            <div className="w-full lg:w-80 flex-shrink-0 bg-white p-6 rounded-2xl border border-[#16132D]/[0.06] shadow-[0_1px_3px_rgba(28,36,48,0.04)] space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-[#16132D]/[0.06]">
                <h3 className="font-serif font-bold text-[#16132D] text-lg">Order Details</h3>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 text-[#16132D]/40 hover:text-[#16132D]/70 rounded-lg hover:bg-[#16132D]/5 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4 text-sm font-semibold text-[#16132D]/65">
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-[#16132D]/40 block mb-1">ORDER ID</span>
                  <span className="text-[#16132D]">{selectedOrder.id}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-[#16132D]/40 block mb-1">CUSTOMER NAME</span>
                  <span className="text-[#16132D]">{selectedOrder.customerName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-[#16132D]/40 block mb-1">GARMENT SPECIFICATION</span>
                  <span className="text-[#16132D]">{selectedOrder.category}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-[#16132D]/40 block mb-1">FABRIC DETAILS</span>
                  <span className="text-[#16132D] whitespace-pre-wrap">{selectedOrder.fabricDetails || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-[#16132D]/40 block mb-1">ASSIGNED TAILOR</span>
                  <span className="text-[#16132D]">{selectedOrder.tailor || 'Unassigned'}</span>
                </div>
                <div className="bg-[#F4F3F8] p-3 rounded-xl border border-[#16132D]/[0.04] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#16132D]/50">Total Amount</span>
                    <span className="text-[#16132D]">₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#16132D]/50">Advance Paid</span>
                    <span className="text-[#234638]">₹{selectedOrder.advancePaid.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#16132D]/[0.06]">
                    <span className="text-[#16132D]/80">Balance Due</span>
                    <span className="text-[#F43F5E]">₹{(selectedOrder.totalAmount - selectedOrder.advancePaid).toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-[#16132D]/40 block mb-1.5">UPDATE STATUS</span>
                  <select 
                    value={selectedOrder.status} 
                    onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                    className="w-full px-3 py-2 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 focus:border-[#7209B7]/40 text-sm bg-white transition cursor-pointer"
                  >
                    <option>Received</option>
                    <option>Cutting</option>
                    <option>Stitching</option>
                    <option>Trial Scheduled</option>
                    <option>Completed</option>
                  </select>
                </div>

                {selectedOrder.status === 'Received' && (
                  <div className="space-y-3 pt-2">
                    <button
                      onClick={() => handleTakeMeasurements(selectedOrder)}
                      className="w-full py-2.5 bg-white border border-[#7209B7] text-[#7209B7] hover:bg-[#7209B7]/5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition"
                    >
                      <Scissors className="w-4 h-4" /> Record Measurements
                    </button>
                    <button
                      onClick={() => handleSendToProduction(selectedOrder)}
                      className="w-full py-2.5 bg-[#7209B7] hover:bg-[#a3531f] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition shadow-md shadow-[#7209B7]/20"
                    >
                      Send to Production <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Create Order Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-[#16132D]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl border border-[#16132D]/[0.06] shadow-2xl shadow-[#16132D]/20 w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="px-6 py-5 border-b border-[#16132D]/[0.08] flex justify-between items-center shrink-0">
                <h2 className="text-xl font-serif font-bold text-[#16132D]">Create New Order</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 bg-[#16132D]/[0.03] hover:bg-[#16132D]/[0.08] text-[#16132D]/50 hover:text-[#16132D] rounded-full transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-y-auto p-6">
                <form id="orderForm" onSubmit={handleCreateOrder} className="space-y-5">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          }
                        }}
                        placeholder="e.g. +91 98765 43210" 
                        className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 focus:border-[#7209B7]/40 text-sm transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Customer Name *</label>
                      <input 
                        type="text" 
                        value={customerName} 
                        onChange={(e) => setCustomerName(e.target.value)} 
                        required
                        placeholder="e.g. Shalini Roy" 
                        className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 focus:border-[#7209B7]/40 text-sm transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Delivery Date *</label>
                      <input 
                        type="date" 
                        value={deliveryDate} 
                        onChange={(e) => setDeliveryDate(e.target.value)} 
                        required
                        className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 focus:border-[#7209B7]/40 text-sm transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Garment Category *</label>
                      <input 
                        type="text" 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)} 
                        required
                        placeholder="e.g. Silk Anarkali Suit" 
                        className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 focus:border-[#7209B7]/40 text-sm transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Priority</label>
                      <select 
                        value={priority} 
                        onChange={(e) => setPriority(e.target.value as Order['priority'])}
                        className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 focus:border-[#7209B7]/40 text-sm transition bg-white"
                      >
                        <option value="Normal">Normal</option>
                        <option value="Rush">Rush (Expedited)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Fabric Details</label>
                    <textarea 
                      value={fabricDetails} 
                      onChange={(e) => setFabricDetails(e.target.value)} 
                      placeholder="e.g. Banarasi Silk - Provided by customer" 
                      rows={2}
                      className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 focus:border-[#7209B7]/40 text-sm transition resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-[#F4F3F8] rounded-xl border border-[#16132D]/[0.04]">
                    <div>
                      <label className="block text-[10px] font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Stitching Cost (₹)</label>
                      <input 
                        type="number" 
                        value={stitchingCost} 
                        onChange={(e) => setStitchingCost(Number(e.target.value))} 
                        placeholder="0" 
                        className="w-full px-3 py-2.5 border border-[#16132D]/[0.1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 focus:border-[#7209B7]/40 text-sm transition bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Total Amount (₹)</label>
                      <input 
                        type="number" 
                        value={totalAmount} 
                        onChange={(e) => setTotalAmount(Number(e.target.value))} 
                        placeholder="0" 
                        className="w-full px-3 py-2.5 border border-[#16132D]/[0.1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 focus:border-[#7209B7]/40 text-sm transition bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Advance Paid (₹)</label>
                      <input 
                        type="number" 
                        value={advancePaid} 
                        onChange={(e) => setAdvancePaid(Number(e.target.value))} 
                        placeholder="0" 
                        className="w-full px-3 py-2.5 border border-[#16132D]/[0.1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 focus:border-[#7209B7]/40 text-sm transition bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Assigned Tailor</label>
                    <select 
                      value={tailor} 
                      onChange={(e) => setTailor(e.target.value)} 
                      className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 focus:border-[#7209B7]/40 text-sm transition bg-white"
                    >
                      <option value="">-- Select Tailor --</option>
                      {tailors.map(t => (
                        <option key={t.id} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                </form>
              </div>
              <div className="px-6 py-5 border-t border-[#16132D]/[0.08] flex justify-end shrink-0 bg-[#F4F3F8]/50">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-[#16132D]/60 hover:text-[#16132D] transition mr-3"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  form="orderForm"
                  className="px-6 py-2.5 bg-[#16132D] hover:bg-[#2a3545] text-[#F4F3F8] rounded-xl text-sm font-bold shadow-md shadow-[#16132D]/10 transition"
                >
                  Save Order
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Orders;
