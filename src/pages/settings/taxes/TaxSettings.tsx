import React, { useState } from 'react';
import { Plus, Percent, Save, Trash2 } from 'lucide-react';

interface TaxSlab {
  id: string;
  name: string;
  rate: number;
  applicableTo: string;
  isActive: boolean;
}

const defaultSlabs: TaxSlab[] = [
  { id: '1', name: 'GST 5%', rate: 5, applicableTo: 'Cotton & Linen Fabrics', isActive: true },
  { id: '2', name: 'GST 12%', rate: 12, applicableTo: 'Silk & Synthetic Fabrics', isActive: true },
  { id: '3', name: 'GST 18%', rate: 18, applicableTo: 'Tailoring Services, Accessories', isActive: true },
  { id: '4', name: 'Exempt', rate: 0, applicableTo: 'Handloom / Cottage Industry', isActive: false },
];

const TaxSettings: React.FC = () => {
  const [slabs, setSlabs] = useState<TaxSlab[]>(defaultSlabs);
  const [saved, setSaved] = useState(false);
  const [gstRegistered, setGstRegistered] = useState(true);
  const [gstNumber, setGstNumber] = useState('27AAAAA1111A1Z1');
  const [inclusive, setInclusive] = useState(false);

  const toggleActive = (id: string) => {
    setSlabs(slabs.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  };

  const removeSlot = (id: string) => {
    setSlabs(slabs.filter(s => s.id !== id));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex flex-col h-full space-y-6 p-6 bg-slate-50/50">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tax Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Configure GST slabs, inclusive/exclusive billing, and tax registration details.</p>
        </div>
        <button
          onClick={handleSave}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition shadow-sm ${saved ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
        >
          <Save className="w-4 h-4" /> {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* GST Config Panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <Percent className="w-4 h-4 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">GST Registration</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-800">GST Registered</p>
                  <p className="text-xs text-slate-400 mt-0.5">Enable to show GST on invoices</p>
                </div>
                <button
                  onClick={() => setGstRegistered(!gstRegistered)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${gstRegistered ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${gstRegistered ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {gstRegistered && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">GSTIN</label>
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-mono font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-800">Tax Inclusive Pricing</p>
                  <p className="text-xs text-slate-400 mt-0.5">Prices shown include GST</p>
                </div>
                <button
                  onClick={() => setInclusive(!inclusive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${inclusive ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${inclusive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tax Slabs */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">GST Slabs</h2>
            </div>
            <button className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg flex items-center gap-1 transition">
              <Plus className="w-3 h-3" /> Add Slab
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {slabs.map(slab => (
              <div key={slab.id} className={`flex items-center justify-between px-6 py-4 transition ${!slab.isActive ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-black text-blue-700 text-sm">
                    {slab.rate}%
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{slab.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{slab.applicableTo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${slab.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {slab.isActive ? 'Active' : 'Disabled'}
                  </span>
                  <button
                    onClick={() => toggleActive(slab.id)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${slab.isActive ? 'bg-blue-600' : 'bg-slate-200'}`}
                  >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${slab.isActive ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                  <button onClick={() => removeSlot(slab.id)} className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxSettings;
