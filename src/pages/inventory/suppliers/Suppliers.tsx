import React, { useState, useEffect } from 'react';
import { Plus, Search, Phone, Mail, MapPin, Trash2, X, Star } from 'lucide-react';
import { inventoryApi } from '../../../api/inventoryApi';

interface Supplier {
  id: number;
  name: string;
  contact: string;
  email: string;
  phone: string;
  location: string;
  category: string;
  rating: number;
}

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [rating, setRating] = useState(5);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await inventoryApi.getSuppliers();
      setSuppliers(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => { setName(''); setContact(''); setPhone(''); setEmail(''); setLocation(''); setCategory(''); setRating(5); };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    try {
      await inventoryApi.addSupplier({ name, contact, phone, email, location, category, rating });
      resetForm();
      setIsModalOpen(false);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this supplier?')) return;
    try { await inventoryApi.deleteSupplier(id); fetchData(); } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F1] text-[#1C2430]">
      <div className="flex flex-col space-y-5 p-6 md:p-8 max-w-[1500px] mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 pb-5 border-b border-[#1C2430]/[0.08]">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] uppercase text-[#C1652F] mb-1.5">Inventory</p>
            <h1 className="text-3xl font-bold tracking-tight text-[#1C2430]">Supplier Directory</h1>
            <p className="text-sm font-medium text-[#1C2430]/55 mt-1">Manage fabric, accessory and raw material suppliers.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2.5 bg-[#1C2430] hover:bg-[#2a3545] text-[#FAF7F1] rounded-xl text-sm font-bold flex items-center gap-1.5 transition shadow-md self-start sm:self-auto">
            <Plus className="w-4 h-4" /> Add Supplier
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center bg-white border border-[#1C2430]/[0.1] rounded-xl px-4 py-3 w-full sm:w-96 shadow-sm focus-within:ring-2 focus-within:ring-[#C1652F]/25 transition">
          <Search className="w-4 h-4 text-[#1C2430]/35 mr-2 flex-shrink-0" />
          <input type="text" placeholder="Search by name or category..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-transparent border-none outline-none text-sm font-medium text-[#1C2430] placeholder-[#1C2430]/35 w-full" />
        </div>

        {/* Grid */}
        {loading ? (
          <p className="text-center text-[#1C2430]/50 font-semibold py-12">Loading suppliers...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[#1C2430]/40 font-semibold">No suppliers found.</p>
            <p className="text-[#1C2430]/30 text-sm mt-1">Add your first supplier to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(s => (
              <div key={s.id} className="bg-white p-6 rounded-2xl border border-[#1C2430]/[0.06] shadow-sm hover:shadow-md transition space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-[#1C2430] text-base">{s.name}</h3>
                    {s.category && <span className="mt-1 inline-block text-[10px] bg-[#C99A3E]/10 text-[#8a6a25] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">{s.category}</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < s.rating ? 'text-[#C99A3E] fill-[#C99A3E]' : 'text-[#1C2430]/15'}`} />
                    ))}
                  </div>
                </div>

                <div className="space-y-2 text-sm font-semibold text-[#1C2430]/60">
                  {s.phone && <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-[#1C2430]/35 flex-shrink-0" />{s.phone} {s.contact && `· ${s.contact}`}</p>}
                  {s.email && <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-[#1C2430]/35 flex-shrink-0" />{s.email}</p>}
                  {s.location && <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#1C2430]/35 flex-shrink-0" />{s.location}</p>}
                </div>

                <div className="pt-3 border-t border-[#1C2430]/[0.05] flex justify-end">
                  <button onClick={() => handleDelete(s.id)} className="p-1.5 text-[#1C2430]/30 hover:text-[#9B3B43] hover:bg-[#9B3B43]/10 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-[#1C2430]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl border border-[#1C2430]/[0.06] shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
              <div className="px-6 py-5 border-b border-[#1C2430]/[0.08] flex justify-between items-center shrink-0">
                <h2 className="text-xl font-bold text-[#1C2430]">Add New Supplier</h2>
                <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="p-2 bg-[#1C2430]/[0.04] hover:bg-[#1C2430]/[0.08] text-[#1C2430]/50 rounded-full transition"><X className="w-4 h-4" /></button>
              </div>
              <div className="overflow-y-auto p-6">
                <form id="supForm" onSubmit={handleAdd} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Supplier / Company Name *</label>
                    <input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Kashi Silk Mills" className="w-full px-4 py-3 border border-[#1C2430]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Contact Person</label>
                      <input value={contact} onChange={e => setContact(e.target.value)} placeholder="e.g. Rajesh Gupta" className="w-full px-4 py-3 border border-[#1C2430]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Phone *</label>
                      <input value={phone} onChange={e => setPhone(e.target.value)} required placeholder="+91 94151 00001" className="w-full px-4 py-3 border border-[#1C2430]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="supplier@example.com" className="w-full px-4 py-3 border border-[#1C2430]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Location / City</label>
                      <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Varanasi, UP" className="w-full px-4 py-3 border border-[#1C2430]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Category / Specialty</label>
                      <input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Silk Fabrics" className="w-full px-4 py-3 border border-[#1C2430]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Rating (1–5)</label>
                    <div className="flex gap-2">
                      {[1,2,3,4,5].map(r => (
                        <button key={r} type="button" onClick={() => setRating(r)} className={`p-1.5 rounded-lg transition ${r <= rating ? 'text-[#C99A3E]' : 'text-[#1C2430]/20'}`}>
                          <Star className={`w-5 h-5 ${r <= rating ? 'fill-[#C99A3E]' : ''}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </form>
              </div>
              <div className="px-6 py-5 border-t border-[#1C2430]/[0.08] flex justify-end gap-3 bg-[#FAF7F1]/50 shrink-0">
                <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-5 py-2.5 text-sm font-semibold text-[#1C2430]/60 hover:text-[#1C2430] transition">Cancel</button>
                <button type="submit" form="supForm" className="px-6 py-2.5 bg-[#1C2430] hover:bg-[#2a3545] text-[#FAF7F1] rounded-xl text-sm font-bold shadow-md transition">Save Supplier</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Suppliers;
