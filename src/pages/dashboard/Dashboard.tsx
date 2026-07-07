import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Scissors,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  FileText,
  Users,
  Calendar,
  Download,
  DollarSign,
  RefreshCw,
  Package,
  Activity
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  reportApi,
  SalesReport as SalesReportType,
  FinanceReport as FinanceReportType,
  InventoryReport as InventoryReportType
} from '../../api/reportApi';
import { orderApi } from '../../api/orderApi';
import { productionApi } from '../../api/productionApi';
import { leadApi } from '../../api/leadApi';
import { useNavigate } from 'react-router-dom';

// ─── Status colour map ───────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, { dot: string; pill: string }> = {
  'Received':        { dot: 'bg-blue-500',      pill: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' },
  'Cutting':         { dot: 'bg-[#7A5AA8]',     pill: 'bg-[#7A5AA8]/10 text-[#5d4485] ring-1 ring-[#7A5AA8]/25' },
  'Stitching':       { dot: 'bg-[#8338EC]',     pill: 'bg-[#8338EC]/10 text-[#6200EA] ring-1 ring-[#8338EC]/25' },
  'Trial':           { dot: 'bg-[#7209B7]',     pill: 'bg-[#7209B7]/10 text-[#a3531f] ring-1 ring-[#7209B7]/25' },
  'Trial Scheduled': { dot: 'bg-[#7209B7]',     pill: 'bg-[#7209B7]/10 text-[#a3531f] ring-1 ring-[#7209B7]/25' },
  'Ready':           { dot: 'bg-[#10B981]',     pill: 'bg-[#10B981]/10 text-[#234638] ring-1 ring-[#10B981]/25' },
  'Completed':       { dot: 'bg-[#10B981]',     pill: 'bg-[#10B981]/10 text-[#234638] ring-1 ring-[#10B981]/25' },
  'Delivered':       { dot: 'bg-slate-400',      pill: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200' },
};
const defaultStyle = { dot: 'bg-slate-400', pill: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200' };

// ─── Empty State helper ──────────────────────────────────────────────────────
const EmptyState = ({ icon: Icon, message }: { icon: React.ElementType; message: string }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-10 text-[#16132D]/30">
    <Icon className="w-8 h-8" />
    <p className="text-sm font-medium">{message}</p>
  </div>
);

// ─── Tooltip components ──────────────────────────────────────────────────────
const OverviewTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#16132D] text-[#F4F3F8] px-3.5 py-2.5 rounded-lg shadow-xl text-xs">
        <p className="text-[10px] font-semibold tracking-wide uppercase text-[#F4F3F8]/55 mb-0.5">{label}</p>
        <p className="text-sm font-serif font-semibold text-[#7209B7]">
          ₹{Number(payload[0].value).toLocaleString('en-IN')}
        </p>
      </div>
    );
  }
  return null;
};

const SalesTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#16132D] text-[#F4F3F8] px-3.5 py-2.5 rounded-lg shadow-xl text-xs">
        <p className="text-[10px] font-semibold tracking-wide uppercase text-[#F4F3F8]/55 mb-0.5">{label}</p>
        <p className="text-sm font-serif font-semibold text-[#7209B7]">
          ₹{Number(payload[0].value).toLocaleString('en-IN')}
        </p>
      </div>
    );
  }
  return null;
};

const FinanceTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    const rev = payload[0]?.value || 0;
    const exp = payload[1]?.value || 0;
    const profit = rev - exp;
    const profitMargin = rev > 0 ? ((profit / rev) * 100).toFixed(1) : '0';
    return (
      <div className="bg-[#16132D] text-[#F4F3F8] p-4 rounded-xl shadow-xl text-xs space-y-2 border border-[#16132D]/10">
        <p className="font-bold text-[#F4F3F8]/55 mb-1 border-b border-[#F4F3F8]/10 pb-1">{label}</p>
        <div className="space-y-1">
          <div className="flex justify-between gap-6">
            <span className="text-[#F4F3F8]/55">Revenue:</span>
            <span className="font-bold text-[#F4F3F8] font-mono">₹{rev.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-[#F4F3F8]/55">Expenses:</span>
            <span className="font-bold text-[#F43F5E] font-mono">₹{exp.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between gap-6 border-t border-[#F4F3F8]/10 pt-1 mt-1">
            <span className="text-[#F4F3F8]/55">Net Profit:</span>
            <span className={`font-bold font-mono ${profit >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
              ₹{profit.toLocaleString('en-IN')} ({profitMargin}%)
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// ─── Main Dashboard ──────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'finance'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Real API data — no fallbacks
  const [salesData, setSalesData] = useState<SalesReportType | null>(null);
  const [financeData, setFinanceData] = useState<FinanceReportType | null>(null);
  const [inventoryReport, setInventoryReport] = useState<InventoryReportType | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [productionItems, setProductionItems] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sales, finance, inventory, ords, prod, ldrs] = await Promise.all([
        reportApi.getSalesReport(),
        reportApi.getFinanceReport(),
        reportApi.getInventoryReport(),
        orderApi.getOrders(),
        productionApi.getProduction(),
        leadApi.getLeads(),
      ]);
      setSalesData(sales);
      setFinanceData(finance);
      setInventoryReport(inventory);
      setOrders(Array.isArray(ords) ? ords : []);
      setProductionItems(Array.isArray(prod) ? prod : []);
      setLeads(Array.isArray(ldrs) ? ldrs : []);
      setLastRefreshed(new Date());
    } catch (err: any) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleExport = async (type: 'sales' | 'finance') => {
    try {
      await reportApi.exportReport(type, 'excel');
    } catch (err) {
      console.error(`Export for ${type} failed:`, err);
    }
  };

  // ── Computed real-time stats ─────────────────────────────────────────────
  const totalRevenue = salesData?.totalRevenue ?? 0;
  const activeOrdersCount = orders.filter((o) => !['Completed', 'Delivered'].includes(o.status)).length;
  const inProductionCount = productionItems.filter((p) => !['Ready', 'Delivered', 'Completed'].includes(p.stage)).length;
  const lowStockCount = inventoryReport?.lowStockItems?.length ?? 0;
  const newLeadsCount = leads.filter((l) => l.status === 'New').length;

  // ── Overview stats cards ─────────────────────────────────────────────────
  const statsCards = [
    {
      label: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      sub: salesData ? `${salesData.totalOrders} orders recorded` : 'No payments yet',
      icon: TrendingUp,
      accent: '#10B981',
      tint: 'bg-[#10B981]/[0.07]',
      ring: 'ring-[#10B981]/15',
    },
    {
      label: 'Active Orders',
      value: String(activeOrdersCount),
      sub: `${orders.length} total orders`,
      icon: ShoppingBag,
      accent: '#7209B7',
      tint: 'bg-[#7209B7]/[0.08]',
      ring: 'ring-[#7209B7]/15',
    },
    {
      label: 'In Production',
      value: String(inProductionCount),
      sub: `${productionItems.length} total items`,
      icon: Scissors,
      accent: '#8338EC',
      tint: 'bg-[#8338EC]/[0.10]',
      ring: 'ring-[#8338EC]/20',
    },
    {
      label: 'Low Stock Fabrics',
      value: String(lowStockCount),
      sub: lowStockCount > 0 ? 'Needs attention' : 'Stock levels OK',
      icon: AlertTriangle,
      accent: lowStockCount > 0 ? '#F43F5E' : '#10B981',
      tint: lowStockCount > 0 ? 'bg-[#F43F5E]/[0.08]' : 'bg-[#10B981]/[0.07]',
      ring: lowStockCount > 0 ? 'ring-[#F43F5E]/15' : 'ring-[#10B981]/15',
    },
  ];

  // ── Recent orders for table ──────────────────────────────────────────────
  const displayRecentOrders = orders.slice(0, 5).map((o: any) => {
    const style = STATUS_STYLES[o.status] ?? defaultStyle;
    return {
      id: `ORD-${o.id}`,
      customer: o.customer_name,
      items: o.category || '—',
      status: o.status,
      dot: style.dot,
      pill: style.pill,
      amount: `₹${parseFloat(o.total_amount || 0).toLocaleString('en-IN')}`,
      delivery: o.delivery_date ? new Date(o.delivery_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—',
    };
  });

  // ── Weekly chart data ────────────────────────────────────────────────────
  const weeklyChartData = salesData?.chartData.map(d => ({ day: d.label, revenue: d.value })) ?? [];

  // ── Quick actions ────────────────────────────────────────────────────────
  const quickActions = [
    { label: 'Add Lead',    icon: Users,    color: '#7A5AA8', path: '/crm/leads', state: { openModal: true } },
    { label: 'New Order',   icon: ShoppingBag, color: '#7209B7', path: '/orders/list', state: { openModal: true } },
    { label: 'Create Bill', icon: FileText, color: '#10B981', path: '/billing/invoice', state: { openModal: true } },
    // { label: 'View Stock',  icon: Package,  color: '#8338EC', path: '/inventory/stock' },
  ];

  // ─── Loading screen ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F4F3F8]">
        <div className="flex flex-col items-center gap-3 text-[#16132D]/50">
          <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-[#7209B7]" />
          <p className="text-sm font-semibold tracking-wider font-serif">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  // ─── Error screen ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F4F3F8]">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="p-4 rounded-2xl bg-[#F43F5E]/10 text-[#F43F5E]">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <p className="text-base font-semibold text-[#16132D]">Couldn't load dashboard</p>
          <p className="text-sm text-[#16132D]/55">{error}</p>
          <button
            onClick={fetchAll}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#16132D] text-[#F4F3F8] rounded-xl text-sm font-semibold hover:bg-[#2a3545] transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F4F3F8] text-[#16132D]">
      <div className="flex flex-col h-full space-y-7 p-6 md:p-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 pb-4 border-b border-[#16132D]/[0.08]">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#7209B7] mb-1.5">Atelier Dashboard</p>
            <h1 className="text-3xl md:text-[2rem] font-serif font-semibold tracking-tight text-[#16132D]">
              Boutique Overview
            </h1>
            <p className="text-xs text-[#16132D]/40 mt-1.5 flex items-center gap-1.5">
              <Activity className="w-3 h-3" />
              Live data · Last refreshed {lastRefreshed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchAll}
              className="px-4 py-2.5 bg-white border border-[#16132D]/15 hover:bg-[#16132D]/[0.03] rounded-xl text-sm font-semibold text-[#16132D]/70 transition shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            {activeTab !== 'overview' && (
              <button
                onClick={() => handleExport(activeTab as 'sales' | 'finance')}
                className="px-4 py-2.5 bg-white border border-[#16132D]/15 hover:bg-[#16132D]/[0.03] rounded-xl text-sm font-semibold text-[#16132D]/80 transition shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Export
              </button>
            )}
            <button
              onClick={() => navigate('/orders/list', { state: { openModal: true } })}
              className="px-4 py-2.5 bg-[#16132D] hover:bg-[#2a3545] text-[#F4F3F8] rounded-xl text-sm font-semibold flex items-center gap-1.5 transition shadow-md shadow-[#16132D]/10 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> New Order
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#16132D]/[0.08] gap-8 text-sm font-semibold font-serif">
          {(['overview', 'sales', 'finance'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3.5 relative transition cursor-pointer font-serif text-base tracking-wide capitalize ${
                activeTab === tab ? 'text-[#7209B7] font-bold' : 'text-[#16132D]/50 hover:text-[#16132D]/80'
              }`}
            >
              {tab === 'overview' ? 'Overview' : tab === 'sales' ? 'Sales Analytics' : 'Financial Analytics'}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7209B7]" />}
            </button>
          ))}
        </div>

        {/* ────────── OVERVIEW TAB ────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-7 animate-fade-in">

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {statsCards.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={i}
                    className="bg-white p-5 rounded-2xl border border-[#16132D]/[0.06] shadow-[0_1px_3px_rgba(28,36,48,0.04)] hover:shadow-[0_8px_20px_rgba(28,36,48,0.08)] transition duration-300 flex items-center justify-between"
                  >
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold tracking-wide uppercase text-[#16132D]/45">{stat.label}</span>
                      <h3 className="text-2xl font-serif font-semibold text-[#16132D]">{stat.value}</h3>
                      <span className="text-xs font-medium text-[#16132D]/50">{stat.sub}</span>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.tint} ring-1 ${stat.ring}`}>
                      <Icon className="w-5 h-5" style={{ color: stat.accent }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* New Leads badge (if any) */}
            {newLeadsCount > 0 && (
              <div
                className="flex items-center gap-3 bg-[#7A5AA8]/[0.07] border border-[#7A5AA8]/20 rounded-xl px-5 py-3 cursor-pointer hover:bg-[#7A5AA8]/[0.11] transition"
                onClick={() => navigate('/crm/leads')}
              >
                <Users className="w-4 h-4 text-[#7A5AA8]" />
                <span className="text-sm font-semibold text-[#7A5AA8]">
                  {newLeadsCount} new lead{newLeadsCount > 1 ? 's' : ''} waiting for follow-up
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#7A5AA8] ml-auto" />
              </div>
            )}

            {/* Main Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Chart */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#16132D]/[0.06] shadow-[0_1px_3px_rgba(28,36,48,0.04)] space-y-4 hover:shadow-md transition duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-serif font-semibold text-[#16132D]">Weekly Revenue</h2>
                    <div className="flex items-baseline gap-2.5 mt-1.5">
                      <span className="text-2xl font-serif font-semibold text-[#16132D]">
                        ₹{totalRevenue.toLocaleString('en-IN')}
                      </span>
                      {salesData && salesData.totalOrders > 0 && (
                        <span className="text-xs font-semibold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full">
                          {salesData.totalOrders} orders
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs bg-[#16132D]/[0.05] text-[#16132D]/60 font-semibold px-3 py-1 rounded-full">
                    Mon – Sun
                  </span>
                </div>

                {weeklyChartData.length > 0 ? (
                  <div className="relative h-64 w-full -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weeklyChartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#7209B7" stopOpacity={0.28} />
                            <stop offset="100%" stopColor="#7209B7" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="0" vertical={false} stroke="#16132D" strokeOpacity={0.06} />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#16132D', opacity: 0.4, fontSize: 12, fontWeight: 600 }} dy={8} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#16132D', opacity: 0.35, fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} width={48} />
                        <Tooltip content={<OverviewTooltip />} cursor={{ stroke: '#16132D', strokeOpacity: 0.1, strokeWidth: 1 }} />
                        <Area type="monotone" dataKey="revenue" stroke="#7209B7" strokeWidth={2.75} fill="url(#revenueFill)" dot={{ r: 4, fill: '#7209B7', stroke: '#F4F3F8', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#7209B7', stroke: '#F4F3F8', strokeWidth: 2.5 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyState icon={TrendingUp} message="No revenue data yet. Start recording payments to see trends." />
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-2xl border border-[#16132D]/[0.06] shadow-[0_1px_3px_rgba(28,36,48,0.04)] space-y-4 hover:shadow-md transition duration-300">
                <h2 className="text-lg font-serif font-semibold text-[#16132D]">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, i) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={i}
                        onClick={() => navigate(action.path, action.state ? { state: action.state } : undefined)}
                        className="flex flex-col items-center justify-center p-4 bg-[#F4F3F8]/70 border border-[#16132D]/[0.06] rounded-xl transition text-center group cursor-pointer hover:border-[#16132D]/20 hover:bg-white hover:shadow-sm"
                      >
                        <Icon className="w-5 h-5 mb-2 transition group-hover:scale-110" style={{ color: action.color }} />
                        <span className="text-xs font-semibold text-[#16132D]/75">{action.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Low stock alert */}
                {inventoryReport && inventoryReport.lowStockItems.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#16132D]/[0.06]">
                    <p className="text-xs font-bold text-[#F43F5E] uppercase tracking-wide mb-2">Low Stock Alert</p>
                    <div className="space-y-1.5 max-h-28 overflow-y-auto">
                      {inventoryReport.lowStockItems.slice(0, 4).map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="text-[#16132D]/70 font-medium truncate max-w-[60%]">{item.name}</span>
                          <span className="text-[#F43F5E] font-bold">{item.stock} {item.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white p-6 rounded-2xl border border-[#16132D]/[0.06] shadow-[0_1px_3px_rgba(28,36,48,0.04)] space-y-4 hover:shadow-md transition duration-300">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-serif font-semibold text-[#16132D]">Recent Orders</h2>
                  <p className="text-xs text-[#16132D]/45 mt-0.5">
                    {orders.length > 0 ? `Showing ${Math.min(5, orders.length)} of ${orders.length} orders` : 'No orders yet'}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/orders')}
                  className="text-xs text-[#7209B7] hover:text-[#a3531f] font-bold flex items-center gap-0.5 transition cursor-pointer"
                >
                  View All <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {displayRecentOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#16132D]/[0.08] text-[#16132D]/40 font-semibold text-xs uppercase tracking-wide">
                        <th className="pb-3 pl-2">Order ID</th>
                        <th className="pb-3">Customer</th>
                        <th className="pb-3">Category</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Delivery</th>
                        <th className="pb-3 text-right pr-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#16132D]/[0.05]">
                      {displayRecentOrders.map((order, idx) => (
                        <tr key={idx} className="hover:bg-[#F4F3F8]/80 transition">
                          <td className="py-3.5 pl-2 font-semibold text-[#16132D]/80">{order.id}</td>
                          <td className="py-3.5 text-[#16132D]/70">{order.customer}</td>
                          <td className="py-3.5 font-medium text-[#16132D]/85">{order.items}</td>
                          <td className="py-3.5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${order.pill}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${order.dot}`} />
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3.5 text-xs text-[#16132D]/55 font-medium">{order.delivery}</td>
                          <td className="py-3.5 text-right pr-2 font-bold font-serif text-[#16132D]">{order.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState icon={ShoppingBag} message="No orders yet. Create your first order to see it here." />
              )}
            </div>
          </div>
        )}

        {/* ────────── SALES ANALYTICS TAB ────────── */}
        {activeTab === 'sales' && (
          <div className="space-y-7 animate-fade-in">
            {salesData ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="bg-white p-6 rounded-2xl border border-[#16132D]/[0.06] shadow-sm flex items-center justify-between hover:shadow-md transition duration-300">
                    <div>
                      <span className="text-xs font-bold text-[#16132D]/40 uppercase tracking-wider">Total Revenue</span>
                      <h3 className="text-3xl font-serif font-black text-[#16132D] mt-1">
                        ₹{salesData.totalRevenue.toLocaleString('en-IN')}
                      </h3>
                      <span className="inline-flex items-center text-xs text-[#16132D]/50 bg-[#16132D]/[0.04] px-2.5 py-0.5 rounded-full font-bold mt-2">
                        All time earnings
                      </span>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/15 text-[#10B981] shadow-sm">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-[#16132D]/[0.06] shadow-sm flex items-center justify-between hover:shadow-md transition duration-300">
                    <div>
                      <span className="text-xs font-bold text-[#16132D]/40 uppercase tracking-wider">Total Orders</span>
                      <h3 className="text-3xl font-serif font-black text-[#16132D] mt-1">{salesData.totalOrders}</h3>
                      <span className="inline-flex items-center text-xs text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full font-bold mt-2">
                        Payments received
                      </span>
                    </div>
                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 shadow-sm">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-[#16132D]/[0.06] shadow-sm flex items-center justify-between hover:shadow-md transition duration-300">
                    <div>
                      <span className="text-xs font-bold text-[#16132D]/40 uppercase tracking-wider">Avg. Order Value</span>
                      <h3 className="text-3xl font-serif font-black text-[#16132D] mt-1">
                        ₹{salesData.averageOrderValue.toLocaleString('en-IN')}
                      </h3>
                      <span className="inline-flex items-center text-xs text-[#16132D]/50 bg-[#16132D]/[0.04] px-2.5 py-0.5 rounded-full font-bold mt-2">
                        Across {salesData.totalOrders} orders
                      </span>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#F4F3F8] border border-[#16132D]/10 text-[#16132D]/70 shadow-sm">
                      <Calendar className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Chart & Top Customers */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#16132D]/[0.06] shadow-sm space-y-4 hover:shadow-md transition duration-300">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-serif font-bold text-[#16132D]">Revenue by Day</h2>
                      <div className="text-xs font-semibold text-[#16132D]/40">Daily boutique earnings</div>
                    </div>
                    {salesData.chartData.length > 0 ? (
                      <div className="h-64 w-full min-h-[240px] pt-2 -ml-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={salesData.chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorSalesRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#7209B7" stopOpacity={0.85} />
                                <stop offset="95%" stopColor="#8338EC" stopOpacity={0.20} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#16132D" strokeOpacity={0.06} />
                            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#16132D', opacity: 0.5, fontSize: 11, fontWeight: 600 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#16132D', opacity: 0.5, fontSize: 11, fontWeight: 600 }} tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
                            <Tooltip content={<SalesTooltip />} cursor={{ fill: '#16132D', fillOpacity: 0.03, radius: 8 }} />
                            <Bar dataKey="value" fill="url(#colorSalesRevenue)" radius={[8, 8, 0, 0]} maxBarSize={45} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <EmptyState icon={TrendingUp} message="No daily sales data available yet." />
                    )}
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-[#16132D]/[0.06] shadow-sm space-y-4 hover:shadow-md transition duration-300">
                    <div>
                      <h2 className="text-lg font-serif font-bold text-[#16132D]">Top Customers</h2>
                      <p className="text-xs text-[#16132D]/45 mt-0.5">Ranked by total spend</p>
                    </div>
                    {salesData.topCustomers.length > 0 ? (
                      <div className="space-y-3 overflow-y-auto max-h-[260px] pr-1">
                        {salesData.topCustomers.map((c, i) => (
                          <div key={i} className="flex items-center justify-between p-2 hover:bg-[#F4F3F8]/80 rounded-xl transition">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-[#F4F3F8] border border-[#16132D]/10 text-[#7209B7] flex items-center justify-center font-bold text-sm">
                                {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-[#16132D]/85">{c.name}</p>
                                <p className="text-[10px] font-semibold text-[#16132D]/45 uppercase tracking-wider">{c.orders} orders</p>
                              </div>
                            </div>
                            <span className="text-sm font-bold font-serif text-[#16132D]">₹{c.spend.toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState icon={Users} message="No customer data yet. Record payments to see top customers." />
                    )}
                  </div>
                </div>
              </>
            ) : (
              <EmptyState icon={TrendingUp} message="Sales data unavailable. Please try refreshing." />
            )}
          </div>
        )}

        {/* ────────── FINANCIAL ANALYTICS TAB ────────── */}
        {activeTab === 'finance' && (
          <div className="space-y-7 animate-fade-in">
            {financeData ? (
              <>
                {/* Finance Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Revenue',    value: financeData.totalRevenue,    icon: TrendingUp,   accent: '#10B981', tint: 'bg-[#10B981]/10', border: 'border-[#10B981]/15' },
                    { label: 'Total Expenses',   value: financeData.totalExpenses,   icon: TrendingDown, accent: '#F43F5E', tint: 'bg-[#F43F5E]/10', border: 'border-[#F43F5E]/15' },
                    { label: 'Gross Profit',     value: financeData.grossProfit,     icon: DollarSign,   accent: '#2563eb', tint: 'bg-blue-50', border: 'border-blue-100' },
                    { label: 'Pending Receivables', value: financeData.pendingReceivables, icon: DollarSign, accent: '#8338EC', tint: 'bg-amber-50', border: 'border-amber-100' },
                  ].map((card, i) => {
                    const Icon = card.icon;
                    return (
                      <div key={i} className="bg-white p-5 rounded-2xl border border-[#16132D]/[0.06] shadow-sm hover:shadow-md transition duration-300">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-[#16132D]/40 uppercase tracking-wider">{card.label}</span>
                          <div className={`p-2 ${card.tint} border ${card.border} rounded-xl`} style={{ color: card.accent }}>
                            <Icon className="w-4 h-4" />
                          </div>
                        </div>
                        <h3 className="text-xl font-serif font-black text-[#16132D]" style={{ color: i === 2 ? '#10B981' : i === 3 ? '#8338EC' : '#16132D' }}>
                          ₹{card.value.toLocaleString('en-IN')}
                        </h3>
                      </div>
                    );
                  })}
                </div>

                {/* Monthly Revenue vs Expenses Chart */}
                <div className="bg-white p-6 rounded-2xl border border-[#16132D]/[0.06] shadow-sm space-y-4 hover:shadow-md transition duration-300">
                  <div className="flex justify-between items-center pb-2">
                    <div>
                      <h2 className="text-lg font-serif font-bold text-[#16132D]">Monthly Revenue vs Expenses</h2>
                      <p className="text-xs text-[#16132D]/40 mt-0.5">Last 6 months comparison</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold">
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#10B981] inline-block" /> Revenue</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#F43F5E] inline-block" /> Expenses</span>
                    </div>
                  </div>
                  {financeData.chartData.length > 0 ? (
                    <div className="h-72 w-full min-h-[260px] pt-4 -ml-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={financeData.chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorFinanceRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.85} />
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0.15} />
                            </linearGradient>
                            <linearGradient id="colorFinanceExpenses" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.85} />
                              <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.15} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#16132D" strokeOpacity={0.06} />
                          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#16132D', opacity: 0.5, fontSize: 11, fontWeight: 600 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#16132D', opacity: 0.5, fontSize: 11, fontWeight: 600 }} tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
                          <Tooltip content={<FinanceTooltip />} cursor={{ fill: '#16132D', fillOpacity: 0.03, radius: 8 }} />
                          <Bar dataKey="revenue" fill="url(#colorFinanceRevenue)" radius={[6, 6, 0, 0]} maxBarSize={30} />
                          <Bar dataKey="expenses" fill="url(#colorFinanceExpenses)" radius={[6, 6, 0, 0]} maxBarSize={30} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <EmptyState icon={DollarSign} message="No financial records yet. Add payments and purchases to see trends." />
                  )}
                </div>
              </>
            ) : (
              <EmptyState icon={DollarSign} message="Finance data unavailable. Please try refreshing." />
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;