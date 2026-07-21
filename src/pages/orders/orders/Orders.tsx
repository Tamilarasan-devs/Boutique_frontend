import React, { useState, useEffect } from 'react';
import Pagination from '@/components/ui/Pagination';
import { Plus, Search, Calendar as CalendarIcon, Clock, Eye, Trash2, X, Scissors, Info, ArrowRight, Edit3, Loader2, List, LayoutGrid } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { orderApi } from '../../../api/orderApi';
import { productionApi } from '../../../api/productionApi';
import { employeeApi, Employee } from '../../../api/employeeApi';
import { customerApi } from '../../../api/customerApi';
import { useConfirm } from '../../../context';
import { TableSkeleton, CardSkeleton } from '../../../components/ui/Skeleton';

interface Order {
  id: string; // The database ID used for API calls
  displayId: string; // The formatted sequence ID for UI
  commonId?: string;
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

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { confirm } = useConfirm();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'card'>(() => {
    return (localStorage.getItem('ordersViewMode') as 'table' | 'card') || 'table';
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    localStorage.setItem('ordersViewMode', viewMode);
  }, [viewMode]);

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
  const [pointsRedeemed, setPointsRedeemed] = useState<number | ''>('');
  const [tailors, setTailors] = useState<Employee[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  const matchedCustomer = customers.find(c => c.name === customerName);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderApi.getOrders(page, 20);
        const ordersData = res.data || res;
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages);
        }
        const formatted = ordersData.map((item: any) => ({
          id: item.id.toString(),
          displayId: item.display_id || `ORD-${item.id}`,
          commonId: item.common_id,
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
          status: item.status,
          pointsEarned: item.points_earned || 0,
          loyaltyDiscount: parseFloat(item.loyalty_discount) || 0
        }));
        setOrders(formatted);
      } catch (error) {
        console.error("Error loading orders", error);
      }
    };

    const fetchTailors = async () => {
      try {
        const res = await employeeApi.getEmployees({ role: 'Tailor', status: 'Active' });
        setTailors(res.data || []);
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

    Promise.all([fetchOrders(), fetchTailors(), fetchCustomers()]).finally(() => setIsLoading(false));

    const state = location.state as any;
    if (state?.openModal) {
      setIsModalOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [page]);

  const filteredOrders = orders.filter(ord => 
    ord.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ord.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ord.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !category || !deliveryDate) return;
    setIsSubmitting(true);

    try {
      // 1. Create or ensure customer exists (only if not editing, or always is fine)
      const existingCustomer = customers.find(c => c.phone === customerPhone && customerPhone !== '');
      if (!existingCustomer && customerName) {
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

      if (isEditMode && editingOrderId) {
        const response = await orderApi.updateOrder(editingOrderId, {
          customer_name: customerName,
          category,
          stitching_cost: stitchingCost || 0,
          total_amount: totalAmount || 0,
          advance_paid: advancePaid || 0,
          delivery_date: deliveryDate,
          tailor,
          fabric_details: fabricDetails,
          priority,
          points_redeemed: pointsRedeemed || 0
        });

        const updatedOrder: Order = {
          id: editingOrderId,
          displayId: response.order.display_id || `ORD-${response.order.id}`,
          commonId: response.order.common_id,
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
          status: response.order.status,
          pointsEarned: response.order.points_earned || 0,
          loyaltyDiscount: parseFloat(response.order.loyalty_discount) || 0
        };

        setOrders(orders.map(o => o.id === editingOrderId ? updatedOrder : o));
      } else {
        const response = await orderApi.addOrder({
          customer_name: customerName,
          category,
          stitching_cost: stitchingCost || 0,
          total_amount: totalAmount || 0,
          advance_paid: advancePaid || 0,
          delivery_date: deliveryDate,
          tailor,
          fabric_details: fabricDetails,
          priority,
          points_redeemed: pointsRedeemed || 0
        });
        
        const newOrder: Order = {
          id: response.order.id.toString(),
          displayId: response.order.display_id || `ORD-${response.order.id}`,
          commonId: response.order.common_id,
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
          status: response.order.status,
          pointsEarned: response.order.points_earned || 0,
          loyaltyDiscount: parseFloat(response.order.loyalty_discount) || 0
        };

        setOrders([newOrder, ...orders]);
      }

      // Reset
      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (order: Order) => {
    setCustomerName(order.customerName);
    setCustomerPhone(''); // We don't store phone in order yet, but can leave empty
    setCategory(order.category);
    setStitchingCost(order.stitchingCost);
    setTotalAmount(order.totalAmount);
    setAdvancePaid(order.advancePaid);
    setDeliveryDate(order.deliveryDate);
    setTailor(order.tailor);
    setFabricDetails(order.fabricDetails);
    setPriority(order.priority);
    setPointsRedeemed(''); // Points redeemed can't easily be re-edited
    
    setIsEditMode(true);
    setEditingOrderId(order.id);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setCustomerName(''); setCustomerPhone(''); setCategory(''); setStitchingCost(''); setTotalAmount('');
    setAdvancePaid(''); setDeliveryDate(''); setTailor(''); setFabricDetails(''); setPointsRedeemed('');
    setPriority('Normal');
    setIsEditMode(false);
    setEditingOrderId(null);
  };

  // Removed block to avoid duplication

  const handleUpdateStatus = async (id: string, nextStatus: string) => {
    try {
      await orderApi.updateOrderStatus(id, nextStatus);
      setOrders(orders.map(o => o.id === id ? { ...o, status: nextStatus as Order['status'] } : o));
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      await orderApi.deleteOrder(id);
      setOrders(orders.filter(o => o.id !== id));
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };



  return (
    <div className="flex h-full bg-[#F4F3F8] text-[#16132D] relative overflow-hidden">
      <div className="flex flex-col flex-1 space-y-5 p-6 md:p-8 max-w-[1500px] mx-auto w-full">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 pb-5 border-b border-[#16132D]/[0.08] shrink-0">
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
              onClick={handleOpenCreateModal}
              className="bg-[#16132D] hover:bg-[#2a3545] text-[#F4F3F8] px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition shadow-md shadow-[#16132D]/10 self-start sm:self-auto"
            >
            <Plus className="w-4 h-4" /> New Order
          </button>
        </div>

        {/* Filter Area & View Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
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

          {/* View Toggle */}
          <div className="flex bg-[#16132D]/[0.05] p-1 rounded-xl self-end sm:self-auto">
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

        {/* Main Content (Table & Detail Sidebar side-by-side) */}
        <div className="flex gap-6 items-start flex-col lg:flex-row flex-1 min-h-0">
          
          {/* Orders List Area */}
          <div className="flex-1 w-full h-full flex flex-col">
            {viewMode === 'table' ? (
              <div className="bg-white rounded-2xl border border-[#16132D]/[0.06] shadow-[0_1px_3px_rgba(28,36,48,0.04)] overflow-hidden flex flex-col flex-1">
                <div className="overflow-x-auto flex-1">
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
                      {isLoading ? (
                        <tr>
                          <td colSpan={5} className="p-0">
                            <TableSkeleton rows={5} />
                          </td>
                        </tr>
                      ) : filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-sm font-semibold text-[#16132D]/35">
                            No orders found.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-[#16132D]/[0.02] transition">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${order.priority === 'Rush' ? 'bg-[#F43F5E]/10 text-[#F43F5E]' : 'bg-[#16132D]/5 text-[#16132D]/55'}`}>
                                  <Scissors className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="font-serif font-bold text-[#16132D] text-base">{order.category}</div>
                                  <div className="text-xs text-[#16132D]/55 font-medium mt-0.5">For {order.customerName} ({order.displayId})</div>
                                  {order.commonId && <div className="text-[10px] font-bold text-[#7209B7] tracking-widest mt-0.5 uppercase">{order.commonId}</div>}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <div className="font-bold text-[#16132D]">₹{order.totalAmount.toLocaleString('en-IN')}</div>
                                {order.advancePaid >= order.totalAmount ? (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#10B981]/15 text-[#10B981]">Paid</span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#F59E0B]/15 text-[#F59E0B]">Pending</span>
                                )}
                              </div>
                              <div className="text-[10px] font-semibold text-[#16132D]/50 uppercase tracking-wide mt-0.5">
                                Adv: ₹{order.advancePaid.toLocaleString('en-IN')}
                                {order.advancePaid < order.totalAmount && (
                                  <span className="text-[#F59E0B] ml-1 font-bold">
                                    • Bal: ₹{(order.totalAmount - order.advancePaid).toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6 font-semibold">
                              <div className="flex flex-col">
                                <span className="text-[#16132D]">{order.deliveryDate}</span>
                                {order.priority === 'Rush' && <span className="text-[10px] text-[#F43F5E] font-bold mt-0.5 tracking-wider uppercase">Rush Order</span>}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <select 
                                value={order.status}
                                onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border-none cursor-pointer focus:outline-none ${statusStyles[order.status] || statusStyles['Received']}`}
                              >
                                {Object.keys(statusStyles).map(status => (
                                  <option key={status} value={status}>{status}</option>
                                ))}
                              </select>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <button 
                                onClick={() => {
                                  navigate('/orders/details', { state: { order } });
                                }}
                                className="p-1.5 rounded-lg text-[#16132D]/45 hover:text-[#7209B7] hover:bg-[#7209B7]/10 transition"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
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
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {totalPages > 0 && (
                  <div className="mt-auto border-t border-[#16132D]/[0.06] bg-white p-2 shrink-0">
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </div>
            ) : isLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                <div className="col-span-full">
                  <CardSkeleton />
                </div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="col-span-full py-12 text-center text-sm font-semibold text-[#16132D]/35 bg-white rounded-2xl border border-[#16132D]/[0.06]">
                No orders found.
              </div>
            ) : (
              <div className="flex flex-col flex-1 h-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 flex-1 content-start">
                  {filteredOrders.map((order) => (
                <div key={order.id} className="bg-white p-5 rounded-2xl border border-[#16132D]/[0.06] shadow-[0_1px_3px_rgba(28,36,48,0.04)] hover:shadow-md transition flex flex-col relative h-full">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${order.priority === 'Rush' ? 'bg-[#F43F5E]/10 text-[#F43F5E]' : 'bg-[#16132D]/5 text-[#16132D]/55'}`}>
                        <Scissors className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-serif font-bold text-[#16132D] text-lg truncate" title={order.category}>{order.category}</div>
                        <div className="text-sm text-[#16132D]/55 font-medium mt-0.5 truncate" title={`For ${order.customerName} (${order.id})`}>For {order.customerName} ({order.id})</div>
                        {order.commonId && <div className="text-[10px] font-bold text-[#7209B7] tracking-widest mt-0.5 uppercase truncate">{order.commonId}</div>}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mb-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#16132D]/60 font-semibold">Status:</span>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusStyles[order.status] || statusStyles['Received']}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#16132D]/60 font-semibold">Delivery:</span>
                      <div className="flex items-center gap-1.5 text-[#16132D]/80 font-bold">
                        <CalendarIcon className="w-3.5 h-3.5 text-[#16132D]/40" />
                        {order.deliveryDate}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-auto pt-4 border-t border-[#16132D]/[0.04] gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-[#16132D] text-lg">₹{order.totalAmount.toLocaleString('en-IN')}</div>
                        {order.advancePaid >= order.totalAmount ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#10B981]/15 text-[#10B981]">Paid</span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#F59E0B]/15 text-[#F59E0B]">Pending</span>
                        )}
                      </div>
                      <div className="text-[10px] font-semibold text-[#10B981] uppercase tracking-wide mt-0.5">
                        Adv: ₹{order.advancePaid.toLocaleString('en-IN')}
                        {order.advancePaid < order.totalAmount && (
                          <span className="text-[#F59E0B] ml-1 font-bold">
                            • Bal: ₹{(order.totalAmount - order.advancePaid).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleOpenEditModal(order)}
                        className="p-1.5 rounded-lg text-[#16132D]/45 hover:text-[#7209B7] hover:bg-[#7209B7]/10 transition"
                        title="Edit Order"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          navigate('/orders/details', { state: { order } });
                        }}
                        className="p-1.5 rounded-lg text-[#16132D]/45 hover:text-[#7209B7] hover:bg-[#7209B7]/10 transition"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteOrder(order.id)}
                        className="p-1.5 rounded-lg text-[#16132D]/45 hover:text-[#F43F5E] hover:bg-[#F43F5E]/10 transition"
                        title="Delete Order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredOrders.length === 0 && (
                <div className="col-span-full py-12 text-center text-sm font-semibold text-[#16132D]/35 bg-white rounded-2xl border border-[#16132D]/[0.06]">
                  No orders found.
                </div>
              )}
            </div>
            {totalPages > 0 && (
              <div className="mt-auto border-t border-[#16132D]/[0.06] bg-white p-2 rounded-xl shrink-0">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
            </div>
          )}
        </div>
      </div>
        {/* Create Order Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-[#16132D]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl border border-[#16132D]/[0.06] shadow-2xl shadow-[#16132D]/20 w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="px-6 py-5 border-b border-[#16132D]/[0.08] flex justify-between items-center shrink-0">
                <h2 className="text-xl font-serif font-bold text-[#16132D]">
                  {isEditMode ? 'Edit Order' : 'Create New Order'}
                </h2>
                <button 
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
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
                    <div className="md:col-span-3">
                      {matchedCustomer && matchedCustomer.loyalty_points > 0 && (
                        <div className="mb-3 p-3 bg-[#7209B7]/5 rounded-lg border border-[#7209B7]/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div>
                            <span className="text-xs font-bold text-[#7209B7] flex items-center gap-1"><span className="text-[14px]">💎</span> Available Loyalty Points: {matchedCustomer.loyalty_points}</span>
                            <span className="text-[10px] text-[#16132D]/50 block mt-0.5">Use points to give an instant discount on this order.</span>
                          </div>
                          <div className="shrink-0 w-full md:w-32">
                            <input 
                              type="number" 
                              value={pointsRedeemed} 
                              onChange={(e) => setPointsRedeemed(Number(e.target.value))}
                              max={matchedCustomer.loyalty_points}
                              placeholder="Redeem pts" 
                              className="w-full px-3 py-2 border border-[#7209B7]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7209B7]/50 text-xs bg-white text-[#7209B7] font-bold"
                            />
                          </div>
                        </div>
                      )}
                    </div>
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
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#16132D] hover:bg-[#2a3545] disabled:opacity-60 text-[#F4F3F8] rounded-xl text-sm font-bold shadow-md shadow-[#16132D]/10 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Saving...' : isEditMode ? 'Update Order' : 'Save Order'}
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
