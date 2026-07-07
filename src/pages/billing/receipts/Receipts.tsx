import React, { useState } from 'react';
import { Search, Printer, Download, CheckCircle } from 'lucide-react';

interface Receipt {
  id: string;
  invoiceId: string;
  customerName: string;
  amount: number;
  method: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';
  date: string;
  printed: boolean;
}

const mockReceipts: Receipt[] = [
  { id: 'RCP-001', invoiceId: 'INV-2026-042', customerName: 'Priyanka Sen', amount: 20000, method: 'UPI', date: '2026-06-25', printed: true },
  { id: 'RCP-002', invoiceId: 'INV-2026-038', customerName: 'Rohan Mehra', amount: 32000, method: 'Card', date: '2026-06-24', printed: true },
  { id: 'RCP-003', invoiceId: 'INV-2026-041', customerName: 'Anjali Sharma', amount: 10000, method: 'Cash', date: '2026-06-26', printed: false },
  { id: 'RCP-004', invoiceId: 'INV-2026-035', customerName: 'Meera Nair', amount: 6200, method: 'Bank Transfer', date: '2026-06-23', printed: false },
];

const methodColor: Record<Receipt['method'], string> = {
  Cash: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  UPI: 'bg-purple-50 text-purple-700 border-purple-100',
  Card: 'bg-blue-50 text-blue-700 border-blue-100',
  'Bank Transfer': 'bg-amber-50 text-amber-700 border-amber-100',
};

const Receipts: React.FC = () => {
  const [receipts, setReceipts] = useState<Receipt[]>(mockReceipts);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = receipts.filter(r =>
    r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const markPrinted = (id: string) => {
    setReceipts(receipts.map(r => r.id === id ? { ...r, printed: true } : r));
  };

  return (
    <div className="flex flex-col h-full space-y-5 p-6 bg-slate-50/50">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Receipts</h1>
          <p className="text-sm text-slate-500 mt-1">Print and download payment receipts for customers.</p>
        </div>
      </div>

      <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-2.5 w-1/3 shadow-sm">
        <Search className="w-4 h-4 text-slate-400 mr-2" />
        <input
          type="text"
          placeholder="Search receipts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none outline-none text-sm text-slate-800 placeholder-slate-400 w-full"
        />
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold">
              <th className="py-4 px-6">Receipt #</th>
              <th className="py-4 px-6">Invoice</th>
              <th className="py-4 px-6">Customer</th>
              <th className="py-4 px-6 text-right">Amount</th>
              <th className="py-4 px-6">Method</th>
              <th className="py-4 px-6">Date</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(r => (
              <tr key={r.id} className="hover:bg-slate-50/40 transition">
                <td className="py-4 px-6 font-bold text-slate-800">{r.id}</td>
                <td className="py-4 px-6 text-slate-500">{r.invoiceId}</td>
                <td className="py-4 px-6 font-medium text-slate-700">{r.customerName}</td>
                <td className="py-4 px-6 text-right font-bold text-slate-900">₹{r.amount.toLocaleString('en-IN')}</td>
                <td className="py-4 px-6">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${methodColor[r.method]}`}>
                    {r.method}
                  </span>
                </td>
                <td className="py-4 px-6 text-slate-500">{r.date}</td>
                <td className="py-4 px-6 text-right space-x-2">
                  {r.printed ? (
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 justify-end">
                      <CheckCircle className="w-3.5 h-3.5" /> Printed
                    </span>
                  ) : (
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => markPrinted(r.id)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition"
                        title="Print"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 transition" title="Download">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Receipts;
