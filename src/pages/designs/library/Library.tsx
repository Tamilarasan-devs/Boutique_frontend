import React, { useState } from 'react';
import { Search, Grid3X3, List, Star, Eye, Download, Sparkles } from 'lucide-react';

interface DesignItem {
  id: string;
  name: string;
  category: string;
  style: string;
  colors: string[];
  isFavorite: boolean;
}

const mockDesigns: DesignItem[] = [
  { id: 'DES-001', name: 'Royal Zardosi Lehenga', category: 'Bridal', style: 'Heavy Embroidery', colors: ['#b91c1c', '#eab308', '#f5f5f4'], isFavorite: true },
  { id: 'DES-002', name: 'Modern Anarkali Suit', category: 'Ethnic', style: 'Thread Work', colors: ['#6d28d9', '#d0e8b4', '#fafaf9'], isFavorite: false },
  { id: 'DES-003', name: 'Classic Sherwani Set', category: 'Menswear', style: 'Brocade Pattern', colors: ['#78350f', '#d97706', '#fef3c7'], isFavorite: true },
  { id: 'DES-004', name: 'Pastel Organza Saree', category: 'Sarees', style: 'Mirror Work', colors: ['#f9a8d4', '#fbcfe8', '#fdf2f8'], isFavorite: false },
  { id: 'DES-005', name: 'Indo-Western Gown', category: 'Fusion', style: 'Sequin Detailing', colors: ['#0f766e', '#5eead4', '#f0fdfa'], isFavorite: false },
  { id: 'DES-006', name: 'Silk Gharara Set', category: 'Ethnic', style: 'Gota Patti', colors: ['#be185d', '#f472b6', '#fce7f3'], isFavorite: true },
];

const Library: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [designs, setDesigns] = useState<DesignItem[]>(mockDesigns);

  const categories = ['All', 'Bridal', 'Ethnic', 'Menswear', 'Sarees', 'Fusion'];

  const filtered = designs.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.style.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoryFilter === 'All' || d.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const toggleFav = (id: string) => {
    setDesigns(designs.map(d => d.id === id ? { ...d, isFavorite: !d.isFavorite } : d));
  };

  return (
    <div className="flex flex-col h-full space-y-5 p-6 bg-slate-50/50">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Design Library</h1>
          <p className="text-sm text-slate-500 mt-1">Browse curated garment designs, patterns, and embroidery references.</p>
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          <button onClick={() => setView('grid')} className={`p-2 rounded-lg transition ${view === 'grid' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}><Grid3X3 className="w-4 h-4" /></button>
          <button onClick={() => setView('list')} className={`p-2 rounded-lg transition ${view === 'list' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}><List className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-2.5 w-1/3 shadow-sm">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input type="text" placeholder="Search designs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent border-none outline-none text-sm text-slate-800 placeholder-slate-400 w-full" />
        </div>
        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${categoryFilter === cat ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}>{cat}</button>
          ))}
        </div>
      </div>

      <div className={`flex-1 ${view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-3'}`}>
        {filtered.map(design => (
          <div key={design.id} className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition ${view === 'list' ? 'flex items-center p-4 gap-5' : ''}`}>
            {/* Color Swatch Header */}
            <div className={`${view === 'grid' ? 'h-36' : 'w-24 h-16 rounded-xl overflow-hidden flex-shrink-0'} bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center relative`}>
              <div className="flex gap-2">
                {design.colors.map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: c }} />
                ))}
              </div>
              {view === 'grid' && (
                <button onClick={() => toggleFav(design.id)} className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition shadow-sm">
                  <Star className={`w-4 h-4 ${design.isFavorite ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                </button>
              )}
            </div>

            <div className={`${view === 'grid' ? 'p-5' : 'flex-1'} space-y-2`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{design.category}</span>
                {view === 'list' && (
                  <button onClick={() => toggleFav(design.id)}>
                    <Star className={`w-4 h-4 ${design.isFavorite ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
                  </button>
                )}
              </div>
              <h3 className="font-bold text-slate-800">{design.name}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1"><Sparkles className="w-3 h-3 text-slate-400" /> {design.style}</p>
              {view === 'grid' && (
                <div className="flex gap-2 pt-3 border-t border-slate-50">
                  <button className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition border border-slate-100"><Eye className="w-3 h-3" /> Preview</button>
                  <button className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition border border-blue-100"><Download className="w-3 h-3" /> Use</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Library;
