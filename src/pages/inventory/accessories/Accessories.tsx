import React, { useState, useEffect } from 'react';
import { Plus, Search, AlertCircle, Trash2, X, Edit2, Loader2 } from 'lucide-react';
import { inventoryApi } from '../../../api/inventoryApi';
import { useConfirm } from '../../../context';
import { TableSkeleton } from '../../../components/ui/Skeleton';

interface Accessory {
  id: number;
  code: string;
  name: string;
  type: string;
  color?: string;
  stock: number;
  unit: string;
  min_stock: number;
  price: number;
}

const TYPES = ['All', 'Buttons', 'Zippers', 'Threads', 'Lace', 'Hooks', 'Beads', 'Other'];

const Accessories: React.FC = () => {
  const { confirm } = useConfirm();
  const [items, setItems] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('Buttons');
  const [stock, setStock] = useState<number | ''>('');
  const [unit, setUnit] = useState('pcs');
  const [minStock, setMinStock] = useState<number | ''>(20);
  const [price, setPrice] = useState<number | ''>('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await inventoryApi.getAccessories();
      setItems(data.map((a: any) => ({ ...a, stock: parseFloat(a.stock), min_stock: parseFloat(a.min_stock), price: parseFloat(a.price) })));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = items.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter === 'All' || a.color === typeFilter || a.type === typeFilter;
    return matchSearch && matchType;
  });

  const lowStockCount = items.filter(a => a.stock < a.min_stock).length;

  const resetForm = () => { setCode(''); setName(''); setType('Buttons'); setStock(''); setUnit('pcs'); setMinStock(20); setPrice(''); setEditingId(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;
    setIsSubmitting(true);
    try {
      const payload = { code, name, type: 'Accessory', color: type, stock: stock || 0, min_stock: minStock || 20, price: price || 0, unit };
      if (editingId) {
        await inventoryApi.updateItem(editingId, payload);
      } else {
        await inventoryApi.addItem(payload);
      }
      resetForm();
      setIsModalOpen(false);
      fetchData();
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  const handleEdit = (item: Accessory) => {
    setEditingId(item.id);
    setCode(item.code);
    setName(item.name);
    setType(item.color || 'Buttons');
    setStock(item.stock);
    setUnit(item.unit);
    setMinStock(item.min_stock);
    setPrice(item.price);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm('Delete this accessory?', {
      title: 'Delete Accessory',
      confirmText: 'Delete',
      destructive: true
    });
    if (!isConfirmed) return;
    try { await inventoryApi.deleteItem(id); fetchData(); } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-[#F4F3F8] text-[#16132D]">
      <div className="flex flex-col space-y-5 p-6 md:p-8 max-w-[1500px] mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 pb-5 border-b border-[#16132D]/[0.08]">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] uppercase text-[#7209B7] mb-1.5">Inventory</p>
            <h1 className="text-3xl font-bold tracking-tight text-[#16132D]">Accessories</h1>
            <p className="text-sm font-medium text-[#16132D]/55 mt-1">Track buttons, zippers, threads, lace and all notions in the workshop.</p>
          </div>
          <div className="flex items-center gap-3">
            {lowStockCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-[#F43F5E]/10 text-[#F43F5E] rounded-xl text-sm font-bold border border-[#F43F5E]/20">
                <AlertCircle className="w-4 h-4" /> {lowStockCount} Low Stock
              </div>
            )}
            <button onClick={() => setIsModalOpen(true)} className="px-4 py-2.5 bg-[#16132D] hover:bg-[#2a3545] text-[#F4F3F8] rounded-xl text-sm font-bold flex items-center gap-1.5 transition shadow-md">
              <Plus className="w-4 h-4" /> Add Accessory
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center bg-white border border-[#16132D]/[0.1] rounded-xl px-4 py-3 w-full sm:w-80 shadow-sm focus-within:ring-2 focus-within:ring-[#7209B7]/25 transition">
            <Search className="w-4 h-4 text-[#16132D]/35 mr-2 flex-shrink-0" />
            <input type="text" placeholder="Search accessories..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-transparent border-none outline-none text-sm font-medium text-[#16132D] placeholder-[#16132D]/35 w-full" />
          </div>
          <div className="flex gap-1.5 bg-[#16132D]/[0.04] p-1 rounded-xl overflow-x-auto">
            {TYPES.map(t => (
              <button key={t} onClick={() => setTypeFilter(t)} className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${typeFilter === t ? 'bg-white shadow-sm text-[#16132D]' : 'text-[#16132D]/50 hover:text-[#16132D]'}`}>{t}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#16132D]/[0.06] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#16132D]/75">
                <thead>
                  <tr className="border-b border-[#16132D]/[0.06] bg-[#16132D]/[0.02] text-[#16132D]/55 font-bold text-xs tracking-wider uppercase">
                    <th className="py-4 px-6">Code</th>
                    <th className="py-4 px-6">Accessory Name</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Stock</th>
                    <th className="py-4 px-6">Price/Unit</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#16132D]/[0.04]">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-0">
                        <TableSkeleton rows={5} />
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={7} className="py-12 text-center text-[#16132D]/35 font-semibold">No accessories found.</td></tr>
                  ) : filtered.map(a => {
                    const isLow = a.stock < a.min_stock;
                    return (
                      <tr key={a.id} className="hover:bg-[#16132D]/[0.02] transition">
                        <td className="py-4 px-6 font-mono text-xs font-bold text-[#16132D]/60">{a.code}</td>
                        <td className="py-4 px-6 font-bold text-[#16132D]">{a.name}</td>
                        <td className="py-4 px-6"><span className="px-2.5 py-1 bg-[#16132D]/[0.05] text-[#16132D]/70 rounded-full text-xs font-bold">{a.color || a.type}</span></td>
                        <td className="py-4 px-6 font-bold text-[#16132D]">{a.stock} <span className="text-xs font-semibold text-[#16132D]/40">{a.unit}</span></td>
                        <td className="py-4 px-6 font-semibold text-[#16132D]">₹{a.price}</td>
                        <td className="py-4 px-6">
                          {isLow ? (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-[#F43F5E]"><AlertCircle className="w-3.5 h-3.5" /> Low Stock</span>
                          ) : (
                            <span className="text-xs font-bold text-[#10B981]">✓ In Stock</span>
                          )}
                        </td>
                        <td className="py-4 px-6 flex items-center gap-2">
                          <button onClick={() => handleEdit(a)} className="p-1.5 text-[#16132D]/30 hover:text-[#7209B7] hover:bg-[#7209B7]/10 rounded-lg transition"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(a.id)} className="p-1.5 text-[#16132D]/30 hover:text-[#F43F5E] hover:bg-[#F43F5E]/10 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-[#16132D]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl border border-[#16132D]/[0.06] shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
              <div className="px-6 py-5 border-b border-[#16132D]/[0.08] flex justify-between items-center shrink-0">
                <h2 className="text-xl font-bold text-[#16132D]">{editingId ? 'Edit Accessory' : 'Add Accessory'}</h2>
                <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="p-2 bg-[#16132D]/[0.04] hover:bg-[#16132D]/[0.08] text-[#16132D]/50 rounded-full transition"><X className="w-4 h-4" /></button>
              </div>
              <div className="overflow-y-auto p-6">
                <form id="accForm" onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Item Code *</label>
                      <input value={code} onChange={e => setCode(e.target.value)} required placeholder="e.g. ACC-BTN-001" className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Category *</label>
                      <select value={type} onChange={e => setType(e.target.value)} className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none text-sm bg-white">
                        {TYPES.filter(t => t !== 'All').map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Accessory Name *</label>
                    <input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Pearl Buttons (Bridal Set)" className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 text-sm" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 p-4 bg-[#F4F3F8] rounded-xl border border-[#16132D]/[0.04]">
                    <div>
                      <label className="block text-[10px] font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Stock Qty</label>
                      <input type="number" value={stock} onChange={e => setStock(Number(e.target.value))} placeholder="0" className="w-full px-3 py-2.5 border border-[#16132D]/[0.1] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Min. Stock</label>
                      <input type="number" value={minStock} onChange={e => setMinStock(Number(e.target.value))} placeholder="20" className="w-full px-3 py-2.5 border border-[#16132D]/[0.1] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Unit</label>
                      <select value={unit} onChange={e => setUnit(e.target.value)} className="w-full px-3 py-2.5 border border-[#16132D]/[0.1] rounded-lg text-sm bg-white focus:outline-none">
                        <option value="pcs">pcs</option>
                        <option value="sets">sets</option>
                        <option value="spools">spools</option>
                        <option value="meters">meters</option>
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
                <button type="submit" form="accForm" disabled={isSubmitting} className="px-6 py-2.5 bg-[#16132D] hover:bg-[#2a3545] disabled:opacity-60 text-[#F4F3F8] rounded-xl text-sm font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Saving...' : (editingId ? 'Update Accessory' : 'Save Accessory')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Accessories;
