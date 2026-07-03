import React, { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, Download, Calendar } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { reportApi, SalesReport as SalesReportType } from '../../../api/reportApi';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 p-3 rounded-xl shadow-xl text-white text-xs">
        <p className="font-bold text-slate-400 mb-1">{label}</p>
        <p className="font-extrabold text-blue-400 text-sm">
          ₹{payload[0].value.toLocaleString('en-IN')}
        </p>
      </div>
    );
  }
  return null;
};

const SalesReport: React.FC = () => {
  const [range, setRange] = useState('This Week');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SalesReportType | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const report = await reportApi.getSalesReport();
        setData(report);
      } catch (error) {
        console.error('Failed to load sales report:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleExport = async () => {
    try {
      await reportApi.exportReport('sales', 'excel');
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50/50 p-6 text-slate-500 font-semibold">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="text-sm font-medium">Loading sales data...</p>
        </div>
      </div>
    );
  }

  const { totalRevenue, totalOrders, averageOrderValue, topCustomers, chartData } = data;

  return (
    <div className="flex flex-col h-full space-y-5 p-6 bg-slate-50/50">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Sales Report</h1>
          <p className="text-sm text-slate-500 mt-1">Detailed breakdown of revenue, orders, and top-performing customers.</p>
        </div>
        <div className="flex gap-3">
          <select value={range} onChange={(e) => setRange(e.target.value)} className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm font-semibold text-slate-700 focus:outline-none shadow-sm cursor-pointer hover:border-slate-300 transition">
            <option>This Week</option>
            <option>This Month</option>
            <option>Last Quarter</option>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition duration-300">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
            <h3 className="text-3xl font-black text-slate-900 mt-1">₹{totalRevenue.toLocaleString('en-IN')}</h3>
            <span className="inline-flex items-center text-xs text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold mt-2">
              +12.5% vs last week
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 shadow-sm"><TrendingUp className="w-6 h-6" /></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition duration-300">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Orders Delivered</span>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{totalOrders}</h3>
            <span className="inline-flex items-center text-xs text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full font-bold mt-2">
              +8% vs last week
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 shadow-sm"><ShoppingBag className="w-6 h-6" /></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition duration-300">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg. Order Value</span>
            <h3 className="text-3xl font-black text-slate-900 mt-1">₹{averageOrderValue.toLocaleString('en-IN')}</h3>
            <span className="inline-flex items-center text-xs text-slate-500 bg-slate-50 px-2.5 py-0.5 rounded-full font-bold mt-2">
              Across {totalOrders} orders
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-500 shadow-sm"><Calendar className="w-6 h-6" /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition duration-300">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Revenue by Day</h2>
            <div className="text-xs font-semibold text-slate-400">Daily earnings</div>
          </div>
          <div className="h-64 w-full min-h-[240px] pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.85}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.15}/>
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
                  dataKey="value" 
                  fill="url(#colorRevenue)" 
                  radius={[8, 8, 0, 0]}
                  maxBarSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition duration-300">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Top Customers</h2>
            <p className="text-xs text-slate-400 mt-0.5">Ranked by total expenditure</p>
          </div>
          <div className="space-y-4 flex-1 mt-4 overflow-y-auto max-h-[250px] pr-1">
            {topCustomers.map((c, i) => (
              <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-50/80 rounded-xl transition">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shadow-sm">
                    {c.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{c.name}</p>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{c.orders} orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-slate-900">₹{c.spend.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
            {topCustomers.length === 0 && (
              <div className="text-sm text-slate-400 italic text-center py-6">No sales recorded yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesReport;
