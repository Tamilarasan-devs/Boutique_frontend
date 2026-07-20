import React, { useState, useEffect } from 'react';
import Pagination from '@/components/ui/Pagination';
import { Search, ArrowDownCircle, ArrowUpCircle, Plus, X, Loader2 } from 'lucide-react';
import { inventoryApi } from '../../../api/inventoryApi';

interface StockLog {
  id: number;
  item_name: string;
  item_code: string;
  type: 'Stock In' | 'Stock Out';
  quantity: number;
  unit: string;
  reason: string;
  updated_by: string;
  date: string;
}

const Stock: React.FC = () => {
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Stock In' | 'Stock Out'>('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [itemName, setItemName] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [type, setType] = useState<'Stock In' | 'Stock Out'>('Stock In');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [unit, setUnit] = useState('meters');
  const [reason, setReason] = useState('');
  const [updatedBy, setUpdatedBy] = useState('Admin');

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await inventoryApi.getStockLedger(page, 20);
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages);
      }
      setLogs((data.data || data).map((l: any) => ({ ...l, quantity: parseFloat(l.quantity) })));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page]);

  const filtered = logs.filter(l => {
    const match = l.item_name.toLowerCase().includes(searchTerm.toLowerCase()) || l.item_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter === 'All' || l.type === typeFilter;
    return match && matchType;
  });

  const totalIn = logs.filter(l => l.type === 'Stock In').reduce((s, l) => s + l.quantity, 0);
  const totalOut = logs.filter(l => l.type === 'Stock Out').reduce((s, l) => s + l.quantity, 0);

  const resetForm = () => { setItemName(''); setItemCode(''); setType('Stock In'); setQuantity(''); setUnit('meters'); setReason(''); setUpdatedBy('Admin'); };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !itemCode || !quantity || !unit) return;
    setIsSubmitting(true);
    try {
      await inventoryApi.addStockLog({ item_name: itemName, item_code: itemCode, type, quantity, unit, reason, updated_by: updatedBy });
      resetForm();
      setIsModalOpen(false);
      fetchData();
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="flex flex-col h-full bg-[#F4F3F8] text-[#16132D] relative overflow-hidden">
      <div className="flex flex-col flex-1 space-y-5 p-6 md:p-8 max-w-[1500px] mx-auto w-full min-h-0">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 pb-5 border-b border-[#16132D]/[0.08]">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] uppercase text-[#7209B7] mb-1.5">Inventory</p>
            <h1 className="text-3xl font-bold tracking-tight text-[#16132D]">Stock Ledger</h1>
            <p className="text-sm font-medium text-[#16132D]/55 mt-1">Complete audit trail of all stock-in and stock-out movements.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2.5 bg-[#16132D] hover:bg-[#2a3545] text-[#F4F3F8] rounded-xl text-sm font-bold flex items-center gap-1.5 transition shadow-md self-start sm:self-auto">
            <Plus className="w-4 h-4" /> Log Adjustment
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 shrink-0">
          <div className="bg-[#10B981]/10 border border-[#10B981]/20 rounded-2xl p-5 flex items-center gap-4">
            <div className="p-3 bg-[#10B981]/10 rounded-xl"><ArrowDownCircle className="w-6 h-6 text-[#10B981]" /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#10B981]/70 mb-0.5">Total Stock In</p>
              <p className="text-2xl font-bold text-[#10B981]">{totalIn.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-[#F43F5E]/10 border border-[#F43F5E]/20 rounded-2xl p-5 flex items-center gap-4">
            <div className="p-3 bg-[#F43F5E]/10 rounded-xl"><ArrowUpCircle className="w-6 h-6 text-[#F43F5E]" /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#F43F5E]/70 mb-0.5">Total Stock Out</p>
              <p className="text-2xl font-bold text-[#F43F5E]">{totalOut.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <div className="flex items-center bg-white border border-[#16132D]/[0.1] rounded-xl px-4 py-3 w-full sm:w-80 shadow-sm focus-within:ring-2 focus-within:ring-[#7209B7]/25 transition">
            <Search className="w-4 h-4 text-[#16132D]/35 mr-2 flex-shrink-0" />
            <input type="text" placeholder="Search by item name or code..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-transparent border-none outline-none text-sm font-medium text-[#16132D] placeholder-[#16132D]/35 w-full" />
          </div>
          <div className="flex gap-1.5 bg-[#16132D]/[0.04] p-1 rounded-xl">
            {(['All', 'Stock In', 'Stock Out'] as const).map(t => (
              <button key={t} onClick={() => setTypeFilter(t)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${typeFilter === t ? 'bg-white shadow-sm text-[#16132D]' : 'text-[#16132D]/50 hover:text-[#16132D]'}`}>{t}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-center text-[#16132D]/50 font-semibold py-12">Loading stock ledger...</p>
        ) : (
          <div className="flex flex-col flex-1 min-h-0 bg-white rounded-2xl border border-[#16132D]/[0.06] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#16132D]/75">
                <thead>
                  <tr className="border-b border-[#16132D]/[0.06] bg-[#16132D]/[0.02] text-[#16132D]/55 font-bold text-xs tracking-wider uppercase">
                    <th className="py-4 px-6">Type</th>
                    <th className="py-4 px-6">Item</th>
                    <th className="py-4 px-6">Qty</th>
                    <th className="py-4 px-6">Reason / Reference</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#16132D]/[0.04]">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} className="py-12 text-center text-[#16132D]/35 font-semibold">No stock adjustments found.</td></tr>
                  ) : filtered.map(l => (
                    <tr key={l.id} className="hover:bg-[#16132D]/[0.02] transition">
                      <td className="py-4 px-6">
                        <span className={`flex items-center gap-2 font-bold text-xs px-2.5 py-1.5 rounded-full w-fit ${l.type === 'Stock In' ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#F43F5E]/10 text-[#F43F5E]'}`}>
                          {l.type === 'Stock In' ? <ArrowDownCircle className="w-3.5 h-3.5" /> : <ArrowUpCircle className="w-3.5 h-3.5" />}
                          {l.type}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-[#16132D]">{l.item_name}</p>
                        <p className="text-[10px] font-mono text-[#16132D]/40 mt-0.5">{l.item_code}</p>
                      </td>
                      <td className="py-4 px-6 font-bold text-[#16132D]">{l.quantity} <span className="text-xs font-semibold text-[#16132D]/40">{l.unit}</span></td>
                      <td className="py-4 px-6 text-[#16132D]/60 font-medium max-w-[220px] truncate">{l.reason || '—'}</td>
                      <td className="py-4 px-6 text-[#16132D]/55 font-medium">{new Date(l.date).toLocaleDateString('en-IN')}</td>
                      <td className="py-4 px-6 font-semibold text-[#16132D]/60">{l.updated_by}</td>
                    </tr>
                  ))}
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
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-[#16132D]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl border border-[#16132D]/[0.06] shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
              <div className="px-6 py-5 border-b border-[#16132D]/[0.08] flex justify-between items-center shrink-0">
                <h2 className="text-xl font-bold text-[#16132D]">Log Stock Adjustment</h2>
                <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="p-2 bg-[#16132D]/[0.04] hover:bg-[#16132D]/[0.08] text-[#16132D]/50 rounded-full transition"><X className="w-4 h-4" /></button>
              </div>
              <div className="overflow-y-auto p-6">
                <form id="stockForm" onSubmit={handleAdd} className="space-y-4">
                  {/* Type toggle */}
                  <div>
                    <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-2">Adjustment Type *</label>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setType('Stock In')} className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition border ${type === 'Stock In' ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30' : 'bg-white text-[#16132D]/50 border-[#16132D]/[0.1] hover:bg-[#16132D]/[0.02]'}`}>
                        <ArrowDownCircle className="w-4 h-4" /> Stock In
                      </button>
                      <button type="button" onClick={() => setType('Stock Out')} className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition border ${type === 'Stock Out' ? 'bg-[#F43F5E]/10 text-[#F43F5E] border-[#F43F5E]/30' : 'bg-white text-[#16132D]/50 border-[#16132D]/[0.1] hover:bg-[#16132D]/[0.02]'}`}>
                        <ArrowUpCircle className="w-4 h-4" /> Stock Out
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Item Code *</label>
                      <input value={itemCode} onChange={e => setItemCode(e.target.value)} required placeholder="e.g. FAB-RAW-001" className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Updated By</label>
                      <input value={updatedBy} onChange={e => setUpdatedBy(e.target.value)} placeholder="Admin" className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Item Name *</label>
                    <input value={itemName} onChange={e => setItemName(e.target.value)} required placeholder="e.g. Raw Banarasi Silk" className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Quantity *</label>
                      <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} required placeholder="0" min="0.01" step="0.01" className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Unit *</label>
                      <select value={unit} onChange={e => setUnit(e.target.value)} className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none text-sm bg-white">
                        <option value="meters">meters</option>
                        <option value="pcs">pcs</option>
                        <option value="sets">sets</option>
                        <option value="spools">spools</option>
                        <option value="yards">yards</option>
                        <option value="kg">kg</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Reason / Reference</label>
                    <input value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. PO-2026-101 received / Used for ORD-001" className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 text-sm" />
                  </div>
                </form>
              </div>
              <div className="px-6 py-5 border-t border-[#16132D]/[0.08] flex justify-end gap-3 bg-[#F4F3F8]/50 shrink-0">
                <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-5 py-2.5 text-sm font-semibold text-[#16132D]/60 hover:text-[#16132D] transition">Cancel</button>
                <button type="submit" form="stockForm" disabled={isSubmitting} className="px-6 py-2.5 bg-[#16132D] hover:bg-[#2a3545] disabled:opacity-60 text-[#F4F3F8] rounded-xl text-sm font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Logging...' : 'Log Adjustment'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stock;
