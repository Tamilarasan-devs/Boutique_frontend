import React, { useState, useEffect } from 'react';
import { Users, ShoppingBag, Star, Download } from 'lucide-react';
import { reportApi, CustomersReport as CustomersReportType } from '../../../api/reportApi';

const loyaltyColor: Record<string, string> = {
  Gold: 'bg-amber-50 text-amber-700 border-amber-100',
  Silver: 'bg-slate-100 text-slate-600 border-slate-200',
  Regular: 'bg-blue-50 text-blue-700 border-blue-100',
  New: 'bg-emerald-50 text-emerald-700 border-emerald-100',
};

const CustomersReport: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CustomersReportType | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const report = await reportApi.getCustomersReport();
        setData(report);
      } catch (error) {
        console.error('Failed to load customers report:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleExport = async () => {
    try {
      await reportApi.exportReport('customers', 'excel');
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50/50 p-6 text-slate-500 font-semibold">
        Loading customer data...
      </div>
    );
  }

  const { totalCustomers, totalRevenue, totalOrders, customers } = data;

  return (
    <div className="flex flex-col h-full space-y-5 p-6 bg-slate-50/50">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Customer Report</h1>
          <p className="text-sm text-slate-500 mt-1">Lifetime value, loyalty tiers, and order frequency per customer.</p>
        </div>
        <button 
          onClick={handleExport}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 transition shadow-sm"
        >
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div><span className="text-xs font-bold text-slate-400 uppercase">Total Customers</span><h3 className="text-2xl font-black text-slate-900 mt-1">{totalCustomers}</h3></div>
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100"><Users className="w-6 h-6 text-blue-600" /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div><span className="text-xs font-bold text-slate-400 uppercase">Total Revenue</span><h3 className="text-2xl font-black text-slate-900 mt-1">₹{totalRevenue.toLocaleString('en-IN')}</h3></div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100"><ShoppingBag className="w-6 h-6 text-emerald-600" /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div><span className="text-xs font-bold text-slate-400 uppercase">Total Orders</span><h3 className="text-2xl font-black text-slate-900 mt-1">{totalOrders}</h3></div>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-100"><Star className="w-6 h-6 text-amber-500" /></div>
        </div>
      </div>

      {/* Customer Table */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold">
              <th className="py-4 px-6">Customer</th>
              <th className="py-4 px-6 text-center">Orders</th>
              <th className="py-4 px-6 text-right">Total Spend</th>
              <th className="py-4 px-6 text-right">Avg. Order</th>
              <th className="py-4 px-6">Loyalty</th>
              <th className="py-4 px-6">Last Order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {customers.map((c, i) => (
              <tr key={i} className="hover:bg-slate-50/40 transition">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                      {c.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="font-semibold text-slate-800">{c.name}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-center font-bold text-slate-800">{c.orders}</td>
                <td className="py-4 px-6 text-right font-bold text-slate-900">₹{c.totalSpend.toLocaleString('en-IN')}</td>
                <td className="py-4 px-6 text-right text-slate-600 font-medium">₹{c.avgOrder.toLocaleString('en-IN')}</td>
                <td className="py-4 px-6">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${loyaltyColor[c.loyalty] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                    {c.loyalty}
                  </span>
                </td>
                <td className="py-4 px-6 text-slate-500">{c.lastOrder}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 italic">No customers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomersReport;
