import React, { useState, useEffect } from 'react';
import { Plus, Search, AlertCircle, Trash2, X } from 'lucide-react';
import { inventoryApi } from '../../../api/inventoryApi';

interface Accessory {
  id: number;
  code: string;
  name: string;
  type: string;
  stock: number;
  unit: string;
  min_stock: number;
  price: number;
}

const TYPES = ['All', 'Buttons', 'Zippers', 'Threads', 'Lace', 'Hooks', 'Beads', 'Other'];

const Accessories: React.FC = () => {
  const [items, setItems] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    const matchType = typeFilter === 'All' || a.type === typeFilter;
    return matchSearch && matchType;
  });

  const lowStockCount = items.filter(a => a.stock < a.min_stock).length;

  const resetForm = () => { setCode(''); setName(''); setType('Buttons'); setStock(''); setUnit('pcs'); setMinStock(20); setPrice(''); };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;
    try {
      await inventoryApi.addItem({ code, name, type: 'Accessory', color: type, stock: stock || 0, min_stock: minStock || 20, price: price || 0, unit });
      resetForm();
      setIsModalOpen(false);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this accessory?')) return;
    try { await inventoryApi.deleteItem(id); fetchData(); } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F1] text-[#1C2430]">
      <div className="flex flex-col space-y-5 p-6 md:p-8 max-w-[1500px] mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 pb-5 border-b border-[#1C2430]/[0.08]">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] uppercase text-[#C1652F] mb-1.5">Inventory</p>
            <h1 className="text-3xl font-bold tracking-tight text-[#1C2430]">Accessories</h1>
            <p className="text-sm font-medium text-[#1C2430]/55 mt-1">Track buttons, zippers, threads, lace and all notions in the workshop.</p>
          </div>
          <div className="flex items-center gap-3">
            {lowStockCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-[#9B3B43]/10 text-[#9B3B43] rounded-xl text-sm font-bold border border-[#9B3B43]/20">
                <AlertCircle className="w-4 h-4" /> {lowStockCount} Low Stock
              </div>
            )}
            <button onClick={() => setIsModalOpen(true)} className="px-4 py-2.5 bg-[#1C2430] hover:bg-[#2a3545] text-[#FAF7F1] rounded-xl text-sm font-bold flex items-center gap-1.5 transition shadow-md">
              <Plus className="w-4 h-4" /> Add Accessory
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center bg-white border border-[#1C2430]/[0.1] rounded-xl px-4 py-3 w-full sm:w-80 shadow-sm focus-within:ring-2 focus-within:ring-[#C1652F]/25 transition">
            <Search className="w-4 h-4 text-[#1C2430]/35 mr-2 flex-shrink-0" />
            <input type="text" placeholder="Search accessories..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-transparent border-none outline-none text-sm font-medium text-[#1C2430] placeholder-[#1C2430]/35 w-full" />
          </div>
          <div className="flex gap-1.5 bg-[#1C2430]/[0.04] p-1 rounded-xl overflow-x-auto">
            {TYPES.map(t => (
              <button key={t} onClick={() => setTypeFilter(t)} className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${typeFilter === t ? 'bg-white shadow-sm text-[#1C2430]' : 'text-[#1C2430]/50 hover:text-[#1C2430]'}`}>{t}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-center text-[#1C2430]/50 font-semibold py-12">Loading accessories...</p>
        ) : (
          <div className="bg-white rounded-2xl border border-[#1C2430]/[0.06] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#1C2430]/75">
                <thead>
                  <tr className="border-b border-[#1C2430]/[0.06] bg-[#1C2430]/[0.02] text-[#1C2430]/55 font-bold text-xs tracking-wider uppercase">
                    <th className="py-4 px-6">Code</th>
                    <th className="py-4 px-6">Accessory Name</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Stock</th>
                    <th className="py-4 px-6">Price/Unit</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C2430]/[0.04]">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} className="py-12 text-center text-[#1C2430]/35 font-semibold">No accessories found.</td></tr>
                  ) : filtered.map(a => {
                    const isLow = a.stock < a.min_stock;
                    return (
                      <tr key={a.id} className="hover:bg-[#1C2430]/[0.02] transition">
                        <td className="py-4 px-6 font-mono text-xs font-bold text-[#1C2430]/60">{a.code}</td>
                        <td className="py-4 px-6 font-bold text-[#1C2430]">{a.name}</td>
                        <td className="py-4 px-6"><span className="px-2.5 py-1 bg-[#1C2430]/[0.05] text-[#1C2430]/70 rounded-full text-xs font-bold">{a.type}</span></td>
                        <td className="py-4 px-6 font-bold text-[#1C2430]">{a.stock} <span className="text-xs font-semibold text-[#1C2430]/40">{a.unit}</span></td>
                        <td className="py-4 px-6 font-semibold text-[#1C2430]">₹{a.price}</td>
                        <td className="py-4 px-6">
                          {isLow ? (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-[#9B3B43]"><AlertCircle className="w-3.5 h-3.5" /> Low Stock</span>
                          ) : (
                            <span className="text-xs font-bold text-[#2F5D4F]">✓ In Stock</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <button onClick={() => handleDelete(a.id)} className="p-1.5 text-[#1C2430]/30 hover:text-[#9B3B43] hover:bg-[#9B3B43]/10 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-[#1C2430]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl border border-[#1C2430]/[0.06] shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
              <div className="px-6 py-5 border-b border-[#1C2430]/[0.08] flex justify-between items-center shrink-0">
                <h2 className="text-xl font-bold text-[#1C2430]">Add Accessory</h2>
                <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="p-2 bg-[#1C2430]/[0.04] hover:bg-[#1C2430]/[0.08] text-[#1C2430]/50 rounded-full transition"><X className="w-4 h-4" /></button>
              </div>
              <div className="overflow-y-auto p-6">
                <form id="accForm" onSubmit={handleAdd} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Item Code *</label>
                      <input value={code} onChange={e => setCode(e.target.value)} required placeholder="e.g. ACC-BTN-001" className="w-full px-4 py-3 border border-[#1C2430]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Category *</label>
                      <select value={type} onChange={e => setType(e.target.value)} className="w-full px-4 py-3 border border-[#1C2430]/[0.1] rounded-xl focus:outline-none text-sm bg-white">
                        {TYPES.filter(t => t !== 'All').map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Accessory Name *</label>
                    <input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Pearl Buttons (Bridal Set)" className="w-full px-4 py-3 border border-[#1C2430]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 text-sm" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 p-4 bg-[#FAF7F1] rounded-xl border border-[#1C2430]/[0.04]">
                    <div>
                      <label className="block text-[10px] font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Stock Qty</label>
                      <input type="number" value={stock} onChange={e => setStock(Number(e.target.value))} placeholder="0" className="w-full px-3 py-2.5 border border-[#1C2430]/[0.1] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Min. Stock</label>
                      <input type="number" value={minStock} onChange={e => setMinStock(Number(e.target.value))} placeholder="20" className="w-full px-3 py-2.5 border border-[#1C2430]/[0.1] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Unit</label>
                      <select value={unit} onChange={e => setUnit(e.target.value)} className="w-full px-3 py-2.5 border border-[#1C2430]/[0.1] rounded-lg text-sm bg-white focus:outline-none">
                        <option value="pcs">pcs</option>
                        <option value="sets">sets</option>
                        <option value="spools">spools</option>
                        <option value="meters">meters</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Price per {unit} (₹)</label>
                    <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} placeholder="0" className="w-full px-4 py-3 border border-[#1C2430]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 text-sm" />
                  </div>
                </form>
              </div>
              <div className="px-6 py-5 border-t border-[#1C2430]/[0.08] flex justify-end gap-3 bg-[#FAF7F1]/50 shrink-0">
                <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-5 py-2.5 text-sm font-semibold text-[#1C2430]/60 hover:text-[#1C2430] transition">Cancel</button>
                <button type="submit" form="accForm" className="px-6 py-2.5 bg-[#1C2430] hover:bg-[#2a3545] text-[#FAF7F1] rounded-xl text-sm font-bold shadow-md transition">Save Accessory</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Accessories;
