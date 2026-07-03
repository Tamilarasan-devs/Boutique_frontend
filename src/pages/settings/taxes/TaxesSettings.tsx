import React, { useState } from 'react';
import { Save, Plus, Receipt, Trash2, Edit2, CheckCircle2 } from 'lucide-react';

interface TaxRule {
  id: string;
  name: string;
  rate: number;
  isActive: boolean;
}

const defaultTaxes: TaxRule[] = [
  { id: '1', name: 'CGST', rate: 9, isActive: true },
  { id: '2', name: 'SGST', rate: 9, isActive: true },
  { id: '3', name: 'IGST', rate: 18, isActive: false },
];

const TaxesSettings: React.FC = () => {
  const [taxes, setTaxes] = useState<TaxRule[]>(defaultTaxes);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggleStatus = (id: string) => {
    setTaxes(taxes.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t));
  };

  return (
    <div className="min-h-screen bg-[#FAF7F1] text-[#1C2430]">
      <div className="flex flex-col h-full space-y-6 p-6 md:p-8 max-w-5xl mx-auto">
        
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 pb-5 border-b border-[#1C2430]/[0.08]">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#C1652F] mb-1.5">Settings</p>
            <h1 className="text-3xl font-serif font-semibold text-[#1C2430]">Taxes & GST</h1>
            <p className="text-sm text-[#1C2430]/55 mt-1">Manage tax rates and GST configurations for invoicing.</p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button className="px-4 py-2.5 bg-white border border-[#1C2430]/[0.1] hover:bg-[#1C2430]/[0.02] text-[#1C2430] rounded-xl text-sm font-semibold flex items-center gap-1.5 transition shadow-sm cursor-not-allowed opacity-70" title="Coming soon">
              <Plus className="w-4 h-4" /> Add Tax Rate
            </button>
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-md cursor-pointer ${
                saved
                  ? 'bg-[#2F5D4F] text-white shadow-[#2F5D4F]/20'
                  : 'bg-[#1C2430] hover:bg-[#2a3545] text-[#FAF7F1] shadow-[#1C2430]/10'
              }`}
            >
              {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-[#1C2430]/[0.06] shadow-[0_1px_3px_rgba(28,36,48,0.04)] overflow-hidden">
              <div className="px-6 py-5 border-b border-[#1C2430]/[0.07] flex items-center gap-2.5 bg-[#FAF7F1]/30">
                <div className="p-1.5 bg-[#C1652F]/10 rounded-lg">
                  <Receipt className="w-4 h-4 text-[#C1652F]" />
                </div>
                <h2 className="text-sm font-bold text-[#1C2430]">Active Tax Rules</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#1C2430]/[0.08] bg-white text-[#1C2430]/40 font-semibold text-xs uppercase tracking-wide">
                      <th className="py-4 px-6">Tax Name</th>
                      <th className="py-4 px-6 text-right">Rate (%)</th>
                      <th className="py-4 px-6 text-center">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1C2430]/[0.05]">
                    {taxes.map((tax) => (
                      <tr key={tax.id} className="hover:bg-[#FAF7F1]/60 transition">
                        <td className="py-4 px-6 font-semibold text-[#1C2430]">{tax.name}</td>
                        <td className="py-4 px-6 text-right font-medium text-[#1C2430]/70">{tax.rate}%</td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => toggleStatus(tax.id)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ring-1 cursor-pointer transition ${
                              tax.isActive
                                ? 'bg-[#2F5D4F]/10 text-[#234638] ring-[#2F5D4F]/20 hover:bg-[#9B3B43]/10 hover:text-[#9B3B43] hover:ring-[#9B3B43]/20'
                                : 'bg-[#9B3B43]/10 text-[#9B3B43] ring-[#9B3B43]/20 hover:bg-[#2F5D4F]/10 hover:text-[#234638] hover:ring-[#2F5D4F]/20'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${tax.isActive ? 'bg-[#2F5D4F]' : 'bg-[#9B3B43]'}`} />
                            {tax.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button className="p-2 hover:bg-[#C99A3E]/10 rounded-lg text-[#1C2430]/40 hover:text-[#C99A3E] transition cursor-not-allowed opacity-50"><Edit2 className="w-4 h-4" /></button>
                            <button className="p-2 hover:bg-[#9B3B43]/10 rounded-lg text-[#1C2430]/40 hover:text-[#9B3B43] transition cursor-not-allowed opacity-50"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-[#1C2430] text-[#FAF7F1] rounded-2xl shadow-lg shadow-[#1C2430]/20 p-6">
              <h3 className="font-serif font-bold text-lg mb-2">How Taxes Work</h3>
              <p className="text-sm text-white/60 leading-relaxed mb-4">
                Active tax rules will appear in the invoice and quotation generators. You can toggle rules on or off depending on the customer's state code for IGST vs CGST/SGST splitting.
              </p>
              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-white/40 italic">Note: Make sure your GSTIN is filled out in the Boutique Profile settings to issue valid GST invoices.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TaxesSettings;
