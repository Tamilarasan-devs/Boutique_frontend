import React, { useState, useEffect } from 'react';
import { Download, Package, AlertTriangle, TrendingDown } from 'lucide-react';
import { reportApi, InventoryReport as InventoryReportType } from '../../../api/reportApi';

const InventoryReport: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<InventoryReportType | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const report = await reportApi.getInventoryReport();
        setData(report);
      } catch (error) {
        console.error('Failed to load inventory report:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleExport = async () => {
    try {
      await reportApi.exportReport('inventory', 'excel');
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50/50 p-6 text-slate-500 font-semibold">
        Loading inventory data...
      </div>
    );
  }

  const { totalItems, lowStockItems, totalValue, categoryBreakdown } = data;

  return (
    <div className="flex flex-col h-full space-y-5 p-6 bg-slate-50/50">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Inventory Report</h1>
          <p className="text-sm text-slate-500 mt-1">Stock valuation, category breakdown, and low-stock alerts.</p>
        </div>
        <button 
          onClick={handleExport}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 transition shadow-sm"
        >
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div><span className="text-xs font-bold text-slate-400 uppercase">Total Items</span><h3 className="text-2xl font-black text-slate-900 mt-1">{totalItems}</h3></div>
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100"><Package className="w-6 h-6 text-blue-600" /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div><span className="text-xs font-bold text-slate-400 uppercase">Stock Value</span><h3 className="text-2xl font-black text-slate-900 mt-1">₹{totalValue.toLocaleString('en-IN')}</h3></div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100"><TrendingDown className="w-6 h-6 text-emerald-600" /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div><span className="text-xs font-bold text-slate-400 uppercase">Low Stock Items</span><h3 className="text-2xl font-black text-rose-600 mt-1">{lowStockItems.length}</h3></div>
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-100"><AlertTriangle className="w-6 h-6 text-rose-500" /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Category Breakdown</h2>
          <div className="space-y-4">
            {categoryBreakdown.map((d, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-slate-700">{d.category}</span>
                  <span className="font-bold text-slate-900">₹{d.value.toLocaleString('en-IN')}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{ width: `${d.pct}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-semibold">{d.count} items · {d.pct}% of stock</p>
              </div>
            ))}
            {categoryBreakdown.length === 0 && (
              <div className="text-sm text-slate-400 italic text-center py-6">No inventory data available.</div>
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900">🚨 Low Stock Alerts</h2>
          <div className="space-y-3">
            {lowStockItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-rose-50 border border-rose-100 p-4 rounded-xl">
                <div>
                  <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                  <p className="text-xs text-rose-600 font-semibold mt-0.5">
                    Current: {item.stock} {item.unit} · Min: {item.min} {item.unit}
                  </p>
                </div>
                <button className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition">
                  Reorder
                </button>
              </div>
            ))}
            {lowStockItems.length === 0 && (
              <div className="text-sm text-emerald-600 font-semibold text-center py-6 bg-emerald-50 rounded-xl border border-emerald-100">
                ✅ All stock levels are healthy!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryReport;
