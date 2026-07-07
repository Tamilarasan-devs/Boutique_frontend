import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Download } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { reportApi, FinanceReport as FinanceReportType } from '../../../api/reportApi';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const rev = payload[0]?.value || 0;
    const exp = payload[1]?.value || 0;
    const profit = rev - exp;
    const profitMargin = rev > 0 ? ((profit / rev) * 100).toFixed(1) : 0;
    
    return (
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 p-4 rounded-xl shadow-xl text-white text-xs space-y-2">
        <p className="font-bold text-slate-400 mb-1 border-b border-slate-800 pb-1">{label}</p>
        <div className="space-y-1">
          <div className="flex justify-between gap-6">
            <span className="text-slate-400">Revenue:</span>
            <span className="font-bold text-blue-400 font-mono">₹{rev.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-slate-400">Expenses:</span>
            <span className="font-bold text-rose-400 font-mono">₹{exp.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between gap-6 border-t border-slate-800 pt-1 mt-1">
            <span className="text-slate-400">Net Profit:</span>
            <span className={`font-bold font-mono ${profit >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
              ₹{profit.toLocaleString('en-IN')} ({profitMargin}%)
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const FinanceReport: React.FC = () => {
  const [period, setPeriod] = useState('H1 2026');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FinanceReportType | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const report = await reportApi.getFinanceReport();
        setData(report);
      } catch (error) {
        console.error('Failed to load finance report:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleExport = async () => {
    try {
      await reportApi.exportReport('finance', 'excel');
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50/50 p-6 text-slate-500 font-semibold">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="text-sm font-medium">Loading finance data...</p>
        </div>
      </div>
    );
  }

  const { totalRevenue, totalExpenses, grossProfit, pendingReceivables, chartData } = data;

  return (
    <div className="flex flex-col h-full space-y-5 p-6 bg-slate-50/50">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Finance Report</h1>
          <p className="text-sm text-slate-500 mt-1">Revenue, expenses, profit margins, and receivable summaries.</p>
        </div>
        <div className="flex gap-3">
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm font-semibold text-slate-700 focus:outline-none shadow-sm cursor-pointer hover:border-slate-300 transition">
            <option>H1 2026</option>
            <option>Q1 2026</option>
            <option>Q2 2026</option>
          </select>
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
            <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600"><TrendingUp className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">₹{totalRevenue.toLocaleString('en-IN')}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Expenses</span>
            <div className="p-2 bg-rose-50 border border-rose-100 rounded-xl text-rose-600"><TrendingDown className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">₹{totalExpenses.toLocaleString('en-IN')}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Profit</span>
            <div className="p-2 bg-blue-50 border border-blue-100 rounded-xl text-blue-600"><DollarSign className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-black text-emerald-600">₹{grossProfit.toLocaleString('en-IN')}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Receivables</span>
            <div className="p-2 bg-amber-50 border border-amber-100 rounded-xl text-amber-600"><DollarSign className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-black text-amber-600">₹{pendingReceivables.toLocaleString('en-IN')}</h3>
        </div>
      </div>

      {/* Monthly Revenue vs Expenses Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition duration-300">
        <div className="flex justify-between items-center pb-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Monthly Revenue vs Expenses</h2>
            <p className="text-xs text-slate-400 mt-0.5">Comparison of monthly income and operating expenditures</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Revenue</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-400 inline-block" /> Expenses</span>
          </div>
        </div>
        <div className="h-72 w-full min-h-[260px] pt-4">
          {chartData.length === 0 ? (
            <div className="text-sm text-slate-400 italic text-center py-12 w-full">No finance records logged yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.85}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.15}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.85}/>
                    <stop offset="95%" stopColor="#fda4af" stopOpacity={0.15}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="label" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} 
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ fill: '#f8fafc', radius: 8 }} 
                />
                <Bar 
                  dataKey="revenue" 
                  fill="url(#colorRevenue)" 
                  radius={[6, 6, 0, 0]}
                  maxBarSize={30}
                />
                <Bar 
                  dataKey="expenses" 
                  fill="url(#colorExpenses)" 
                  radius={[6, 6, 0, 0]}
                  maxBarSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinanceReport;
