import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, X, Loader2, Edit2, Trash2 } from 'lucide-react';
import { inventoryApi } from '../../../api/inventoryApi';
import { useConfirm } from '../../../context';

interface Purchase {
  id: number;
  po_number: string;
  supplier: string;
  items: string;
  total_amount: number;
  date: string;
  status: 'Ordered' | 'In Transit' | 'Received' | 'Cancelled';
}

const STATUS_STYLES: Record<string, string> = {
  'Ordered':    'bg-[#16132D]/[0.05] text-[#16132D]/65 border-[#16132D]/10',
  'In Transit': 'bg-[#8338EC]/10 text-[#6200EA] border-[#8338EC]/20',
  'Received':   'bg-[#10B981]/10 text-[#234638] border-[#10B981]/20',
  'Cancelled':  'bg-[#F43F5E]/10 text-[#7a2e34] border-[#F43F5E]/20',
};

const Purchases: React.FC = () => {
  const { confirm } = useConfirm();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [poNumber, setPoNumber] = useState('');
  const [supplier, setSupplier] = useState('');
  const [items, setItems] = useState('');
  const [totalAmount, setTotalAmount] = useState<number | ''>('');
  const [status, setStatus] = useState<Purchase['status']>('Ordered');

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await inventoryApi.getPurchases();
      setPurchases(data.map((p: any) => ({ ...p, total_amount: parseFloat(p.total_amount) })));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = purchases.filter(p => {
    const match = p.po_number.toLowerCase().includes(searchTerm.toLowerCase()) || p.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    return match && matchStatus;
  });

  const resetForm = () => { setPoNumber(''); setSupplier(''); setItems(''); setTotalAmount(''); setStatus('Ordered'); setEditingId(null); };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poNumber || !supplier || !items) return;
    setIsSubmitting(true);
    try {
      if (editingId) {
        await inventoryApi.updatePurchase(editingId, { po_number: poNumber, supplier, items, total_amount: totalAmount || 0, status });
      } else {
        await inventoryApi.addPurchase({ po_number: poNumber, supplier, items, total_amount: totalAmount || 0, status });
      }
      resetForm();
      setIsModalOpen(false);
      fetchData();
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await inventoryApi.updatePurchaseStatus(id, newStatus);
      setPurchases(purchases.map(p => p.id === id ? { ...p, status: newStatus as Purchase['status'] } : p));
    } catch (err) { console.error(err); }
  };

  const handleEdit = (p: Purchase) => {
    setEditingId(p.id);
    setPoNumber(p.po_number);
    setSupplier(p.supplier);
    setItems(p.items);
    setTotalAmount(p.total_amount);
    setStatus(p.status);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm('Delete this purchase order?', {
      title: 'Delete Purchase Order',
      confirmText: 'Delete',
      destructive: true
    });
    if (!isConfirmed) return;
    try { await inventoryApi.deletePurchase(id); fetchData(); } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-[#F4F3F8] text-[#16132D]">
      <div className="flex flex-col space-y-5 p-6 md:p-8 max-w-[1500px] mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 pb-5 border-b border-[#16132D]/[0.08]">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] uppercase text-[#7209B7] mb-1.5">Inventory</p>
            <h1 className="text-3xl font-bold tracking-tight text-[#16132D]">Purchase Orders</h1>
            <p className="text-sm font-medium text-[#16132D]/55 mt-1">Track POs from suppliers — ordered, in transit and received.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2.5 bg-[#16132D] hover:bg-[#2a3545] text-[#F4F3F8] rounded-xl text-sm font-bold flex items-center gap-1.5 transition shadow-md self-start sm:self-auto">
            <Plus className="w-4 h-4" /> New PO
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center bg-white border border-[#16132D]/[0.1] rounded-xl px-4 py-3 w-full sm:w-80 shadow-sm focus-within:ring-2 focus-within:ring-[#7209B7]/25 transition">
            <Search className="w-4 h-4 text-[#16132D]/35 mr-2 flex-shrink-0" />
            <input type="text" placeholder="Search by PO number or supplier..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-transparent border-none outline-none text-sm font-medium text-[#16132D] placeholder-[#16132D]/35 w-full" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-3 border border-[#16132D]/[0.1] rounded-xl bg-white text-sm font-semibold text-[#16132D]/70 focus:outline-none cursor-pointer">
            <option value="All">All Statuses</option>
            <option>Ordered</option>
            <option>In Transit</option>
            <option>Received</option>
            <option>Cancelled</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-center text-[#16132D]/50 font-semibold py-12">Loading purchase orders...</p>
        ) : (
          <div className="bg-white rounded-2xl border border-[#16132D]/[0.06] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#16132D]/75">
                <thead>
                  <tr className="border-b border-[#16132D]/[0.06] bg-[#16132D]/[0.02] text-[#16132D]/55 font-bold text-xs tracking-wider uppercase">
                    <th className="py-4 px-6">PO Number</th>
                    <th className="py-4 px-6">Supplier</th>
                    <th className="py-4 px-6">Items</th>
                    <th className="py-4 px-6 text-right">Amount</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#16132D]/[0.04]">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} className="py-12 text-center text-[#16132D]/35 font-semibold">No purchase orders found.</td></tr>
                  ) : filtered.map(p => (
                    <tr key={p.id} className="hover:bg-[#16132D]/[0.02] transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#16132D]/30" />
                          <span className="font-bold text-[#16132D]">{p.po_number}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-[#16132D]">{p.supplier}</td>
                      <td className="py-4 px-6 text-[#16132D]/60 max-w-[200px] truncate">{p.items}</td>
                      <td className="py-4 px-6 text-right font-bold text-[#16132D]">₹{p.total_amount.toLocaleString('en-IN')}</td>
                      <td className="py-4 px-6 text-[#16132D]/55 font-medium">{new Date(p.date).toLocaleDateString('en-IN')}</td>
                      <td className="py-4 px-6">
                        <select
                          value={p.status}
                          onChange={e => handleStatusChange(p.id, e.target.value)}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border cursor-pointer focus:outline-none ${STATUS_STYLES[p.status] || ''}`}
                        >
                          <option>Ordered</option>
                          <option>In Transit</option>
                          <option>Received</option>
                          <option>Cancelled</option>
                        </select>
                      </td>
                      <td className="py-4 px-6 flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(p)} className="p-1.5 text-[#16132D]/30 hover:text-[#7209B7] hover:bg-[#7209B7]/10 rounded-lg transition"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 text-[#16132D]/30 hover:text-[#F43F5E] hover:bg-[#F43F5E]/10 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-[#16132D]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl border border-[#16132D]/[0.06] shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
              <div className="px-6 py-5 border-b border-[#16132D]/[0.08] flex justify-between items-center shrink-0">
                <h2 className="text-xl font-bold text-[#16132D]">{editingId ? 'Edit Purchase Order' : 'New Purchase Order'}</h2>
                <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="p-2 bg-[#16132D]/[0.04] hover:bg-[#16132D]/[0.08] text-[#16132D]/50 rounded-full transition"><X className="w-4 h-4" /></button>
              </div>
              <div className="overflow-y-auto p-6">
                <form id="poForm" onSubmit={handleAdd} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">PO Number *</label>
                      <input value={poNumber} onChange={e => setPoNumber(e.target.value)} required placeholder="e.g. PO-2026-101" className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Initial Status</label>
                      <select value={status} onChange={e => setStatus(e.target.value as Purchase['status'])} className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none text-sm bg-white">
                        <option>Ordered</option>
                        <option>In Transit</option>
                        <option>Received</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Supplier Name *</label>
                    <input value={supplier} onChange={e => setSupplier(e.target.value)} required placeholder="e.g. Kashi Silk Mills" className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Items Ordered *</label>
                    <textarea value={items} onChange={e => setItems(e.target.value)} required rows={2} placeholder="e.g. Raw Banarasi Silk – 50m, Gold Zari Thread x10" className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 text-sm resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Total Amount (₹)</label>
                    <input type="number" value={totalAmount} onChange={e => setTotalAmount(Number(e.target.value))} placeholder="0" className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 text-sm" />
                  </div>
                </form>
              </div>
              <div className="px-6 py-5 border-t border-[#16132D]/[0.08] flex justify-end gap-3 bg-[#F4F3F8]/50 shrink-0">
                <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-5 py-2.5 text-sm font-semibold text-[#16132D]/60 hover:text-[#16132D] transition">Cancel</button>
                <button type="submit" form="poForm" disabled={isSubmitting} className="px-6 py-2.5 bg-[#16132D] hover:bg-[#2a3545] disabled:opacity-60 text-[#F4F3F8] rounded-xl text-sm font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Saving...' : (editingId ? 'Update PO' : 'Create PO')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Purchases;
