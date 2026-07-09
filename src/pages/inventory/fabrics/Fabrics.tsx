import React, { useState, useEffect } from 'react';
import { Plus, Search, AlertCircle, Trash2, X, Loader2 } from 'lucide-react';
import { inventoryApi } from '../../../api/inventoryApi';
import { useConfirm } from '../../../context';

interface FabricItem {
  id: number;
  code: string;
  name: string;
  color: string;
  stock: number;
  min_stock: number;
  price: number;
  unit: string;
}

const Fabrics: React.FC = () => {
  const { confirm } = useConfirm();
  const [fabrics, setFabrics] = useState<FabricItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [stock, setStock] = useState<number | ''>('');
  const [minStock, setMinStock] = useState<number | ''>(10);
  const [price, setPrice] = useState<number | ''>('');
  const [unit, setUnit] = useState('meters');

  const fetch = async () => {
    try {
      setLoading(true);
      const data = await inventoryApi.getFabrics();
      setFabrics(data.map((f: any) => ({ ...f, stock: parseFloat(f.stock), min_stock: parseFloat(f.min_stock), price: parseFloat(f.price) })));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const filtered = fabrics.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockCount = fabrics.filter(f => f.stock < f.min_stock).length;

  const resetForm = () => { setCode(''); setName(''); setColor(''); setStock(''); setMinStock(10); setPrice(''); setUnit('meters'); };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;
    setIsSubmitting(true);
    try {
      await inventoryApi.addItem({ code, name, type: 'Fabric', color, stock: stock || 0, min_stock: minStock || 10, price: price || 0, unit });
      resetForm();
      setIsModalOpen(false);
      fetch();
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm('Delete this fabric?', {
      title: 'Delete Fabric',
      confirmText: 'Delete',
      destructive: true
    });
    if (!isConfirmed) return;
    try { await inventoryApi.deleteItem(id); fetch(); } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-[#F4F3F8] text-[#16132D]">
      <div className="flex flex-col space-y-5 p-6 md:p-8 max-w-[1500px] mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 pb-5 border-b border-[#16132D]/[0.08]">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] uppercase text-[#7209B7] mb-1.5">Inventory</p>
            <h1 className="text-3xl font-bold tracking-tight text-[#16132D]">Fabrics</h1>
            <p className="text-sm font-medium text-[#16132D]/55 mt-1">Manage fabric rolls — stock levels, prices and low-stock alerts.</p>
          </div>
          <div className="flex items-center gap-3">
            {lowStockCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-[#F43F5E]/10 text-[#F43F5E] rounded-xl text-sm font-bold border border-[#F43F5E]/20">
                <AlertCircle className="w-4 h-4" /> {lowStockCount} Low Stock
              </div>
            )}
            <button onClick={() => setIsModalOpen(true)} className="px-4 py-2.5 bg-[#16132D] hover:bg-[#2a3545] text-[#F4F3F8] rounded-xl text-sm font-bold flex items-center gap-1.5 transition shadow-md">
              <Plus className="w-4 h-4" /> Add Fabric Roll
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center bg-white border border-[#16132D]/[0.1] rounded-xl px-4 py-3 w-full sm:w-96 shadow-sm focus-within:ring-2 focus-within:ring-[#7209B7]/25 transition">
          <Search className="w-4 h-4 text-[#16132D]/35 mr-2 flex-shrink-0" />
          <input type="text" placeholder="Search by fabric name or code..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-transparent border-none outline-none text-sm font-medium text-[#16132D] placeholder-[#16132D]/35 w-full" />
        </div>

        {/* Grid */}
        {loading ? (
          <p className="text-center text-[#16132D]/50 font-semibold py-12">Loading fabrics...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[#16132D]/40 font-semibold text-base">No fabrics found.</p>
            <p className="text-[#16132D]/30 text-sm mt-1">Add your first fabric roll to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(fab => {
              const isLow = fab.stock < fab.min_stock;
              const pct = Math.min((fab.stock / (fab.min_stock * 2)) * 100, 100);
              return (
                <div key={fab.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col ${isLow ? 'border-[#F43F5E]/30' : 'border-[#16132D]/[0.06]'}`}>
                  {isLow && (
                    <div className="bg-[#F43F5E]/10 border-b border-[#F43F5E]/20 px-4 py-2 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-[#F43F5E]" />
                      <span className="text-xs font-bold text-[#F43F5E]">Low Stock Alert</span>
                    </div>
                  )}
                  <div className="p-5 flex-1 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-bold tracking-wider text-[#16132D]/40 uppercase">{fab.code}</p>
                        <h3 className="font-bold text-[#16132D] text-base mt-0.5">{fab.name}</h3>
                        {fab.color && <p className="text-xs font-semibold text-[#16132D]/50 mt-0.5">{fab.color}</p>}
                      </div>
                      <button onClick={() => handleDelete(fab.id)} className="p-1.5 text-[#16132D]/25 hover:text-[#F43F5E] hover:bg-[#F43F5E]/10 rounded-lg transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-semibold text-[#16132D]/50">Stock Level</span>
                        <span className={`text-xs font-bold ${isLow ? 'text-[#F43F5E]' : 'text-[#10B981]'}`}>{fab.stock} {fab.unit}</span>
                      </div>
                      <div className="h-1.5 bg-[#16132D]/[0.06] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${isLow ? 'bg-[#F43F5E]' : 'bg-[#10B981]'}`} style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-[10px] text-[#16132D]/35 mt-1 font-semibold">Min: {fab.min_stock} {fab.unit}</p>
                    </div>
                  </div>
                  <div className="px-5 py-3.5 border-t border-[#16132D]/[0.05] bg-[#F4F3F8]/50">
                    <p className="text-sm font-bold text-[#16132D]">₹{fab.price.toLocaleString('en-IN')} <span className="text-xs font-semibold text-[#16132D]/40">/ {fab.unit}</span></p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-[#16132D]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl border border-[#16132D]/[0.06] shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
              <div className="px-6 py-5 border-b border-[#16132D]/[0.08] flex justify-between items-center shrink-0">
                <h2 className="text-xl font-bold text-[#16132D]">Add Fabric Roll</h2>
                <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="p-2 bg-[#16132D]/[0.04] hover:bg-[#16132D]/[0.08] text-[#16132D]/50 rounded-full transition"><X className="w-4 h-4" /></button>
              </div>
              <div className="overflow-y-auto p-6">
                <form id="fabricForm" onSubmit={handleAdd} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Fabric Code *</label>
                      <input value={code} onChange={e => setCode(e.target.value)} required placeholder="e.g. FAB-SLK-001" className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Color / Shade</label>
                      <input value={color} onChange={e => setColor(e.target.value)} placeholder="e.g. Crimson Red" className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Fabric Name *</label>
                    <input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Raw Banarasi Silk" className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 text-sm" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 p-4 bg-[#F4F3F8] rounded-xl border border-[#16132D]/[0.04]">
                    <div>
                      <label className="block text-[10px] font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Stock Qty</label>
                      <input type="number" value={stock} onChange={e => setStock(Number(e.target.value))} placeholder="0" className="w-full px-3 py-2.5 border border-[#16132D]/[0.1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 text-sm bg-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Min. Stock</label>
                      <input type="number" value={minStock} onChange={e => setMinStock(Number(e.target.value))} placeholder="10" className="w-full px-3 py-2.5 border border-[#16132D]/[0.1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 text-sm bg-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Unit</label>
                      <select value={unit} onChange={e => setUnit(e.target.value)} className="w-full px-3 py-2.5 border border-[#16132D]/[0.1] rounded-lg focus:outline-none text-sm bg-white">
                        <option value="meters">meters</option>
                        <option value="yards">yards</option>
                        <option value="kg">kg</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Price per {unit} (₹)</label>
                    <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} placeholder="0" className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 text-sm" />
                  </div>
                </form>
              </div>
              <div className="px-6 py-5 border-t border-[#16132D]/[0.08] flex justify-end gap-3 bg-[#F4F3F8]/50 shrink-0">
                <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-5 py-2.5 text-sm font-semibold text-[#16132D]/60 hover:text-[#16132D] transition">Cancel</button>
                <button type="submit" form="fabricForm" disabled={isSubmitting} className="px-6 py-2.5 bg-[#16132D] hover:bg-[#2a3545] disabled:opacity-60 text-[#F4F3F8] rounded-xl text-sm font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Saving...' : 'Save Fabric'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Fabrics;
