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
  ReferenceLine,
  ComposedChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
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
  'Stitching':       { dot: 'bg-[var(--primary-hex)]',     pill: 'bg-[var(--primary-hex)]/10 text-[#6200EA] ring-1 ring-[var(--accent-hex)]/25' },
  'Trial':           { dot: 'bg-[var(--primary-hex)]',     pill: 'bg-[var(--primary-hex)]/10 text-[#a3531f] ring-1 ring-[var(--accent-hex)]/25' },
  'Trial Scheduled': { dot: 'bg-[var(--primary-hex)]',     pill: 'bg-[var(--primary-hex)]/10 text-[#a3531f] ring-1 ring-[var(--accent-hex)]/25' },
  'Ready':           { dot: 'bg-[#10B981]',     pill: 'bg-[#10B981]/10 text-[#234638] ring-1 ring-[#10B981]/25' },
  'Completed':       { dot: 'bg-[#10B981]',     pill: 'bg-[#10B981]/10 text-[#234638] ring-1 ring-[#10B981]/25' },
  'Delivered':       { dot: 'bg-slate-400',      pill: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200' },
};
const defaultStyle = { dot: 'bg-slate-400', pill: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200' };

// ─── Empty State helper ──────────────────────────────────────────────────────
const EmptyState = ({ icon: Icon, message }: { icon: React.ElementType; message: string }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-10 text-slate-400">
    <Icon className="w-8 h-8" />
    <p className="text-sm font-medium">{message}</p>
  </div>
);

// ─── Tooltip components ──────────────────────────────────────────────────────
const OverviewTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#1E293B]/95 backdrop-blur-md text-white px-4 py-3 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.15)] text-xs border border-white/10">
        <p className="text-[10px] font-bold tracking-wider uppercase text-white/50 mb-1">{label}</p>
        <p className="text-sm font-extrabold text-[var(--primary-hex)]">
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
      <div className="bg-[#1E293B]/95 backdrop-blur-md text-white px-4 py-3 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.15)] text-xs border border-white/10">
        <p className="text-[10px] font-bold tracking-wider uppercase text-white/50 mb-1">{label}</p>
        <p className="text-sm font-extrabold text-[var(--primary-hex)]">
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
      <div className="bg-[#1E293B]/95 backdrop-blur-md text-white p-4 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.15)] text-xs space-y-2 border border-white/10">
        <p className="font-bold text-white/50 mb-1 border-b border-white/10 pb-1">{label}</p>
        <div className="space-y-1">
          <div className="flex justify-between gap-6">
            <span className="text-white/50">Revenue:</span>
            <span className="font-bold text-white">₹{rev.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-white/50">Expenses:</span>
            <span className="font-bold text-[#F43F5E]">₹{exp.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between gap-6 border-t border-white/10 pt-1 mt-1 font-semibold">
            <span className="text-white/55">Net Profit:</span>
            <span className={`font-bold ${profit >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
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

  // ── Weekly chart data ────────────────────────────────────────────────────
  const weeklyChartData = salesData?.chartData.map(d => ({ day: d.label, revenue: d.value })) ?? [];
  const avgWeeklyRevenue = weeklyChartData.length > 0 ? weeklyChartData.reduce((acc, curr) => acc + curr.revenue, 0) / weeklyChartData.length : 0;

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
      sparkData: weeklyChartData.length > 0 ? weeklyChartData.map(d => ({ value: d.revenue })) : [ { value: 100 }, { value: 150 }, { value: 120 }, { value: 180 }, { value: 160 }, { value: 240 } ],
    },
    {
      label: 'Active Orders',
      value: String(activeOrdersCount),
      sub: `${orders.length} total orders`,
      icon: ShoppingBag,
      accent: 'var(--primary-hex)',
      tint: 'bg-[var(--primary-hex)]/[0.08]',
      ring: 'ring-[var(--primary-hex)]/15',
      sparkData: [ { value: 2 }, { value: 4 }, { value: 3 }, { value: 5 }, { value: 4 }, { value: 6 }, { value: activeOrdersCount || 5 } ],
    },
    {
      label: 'In Production',
      value: String(inProductionCount),
      sub: `${productionItems.length} total items`,
      icon: Scissors,
      accent: '#8338EC',
      tint: 'bg-[#8338EC]/[0.10]',
      ring: 'ring-[#8338EC]/20',
      sparkData: [ { value: 1 }, { value: 3 }, { value: 2 }, { value: 4 }, { value: 3 }, { value: 5 }, { value: inProductionCount || 4 } ],
    },
    {
      label: 'Low Stock Fabrics',
      value: String(lowStockCount),
      sub: lowStockCount > 0 ? 'Needs attention' : 'Stock levels OK',
      icon: AlertTriangle,
      accent: lowStockCount > 0 ? '#F43F5E' : '#10B981',
      tint: lowStockCount > 0 ? 'bg-[#F43F5E]/[0.08]' : 'bg-[#10B981]/[0.07]',
      ring: lowStockCount > 0 ? 'ring-[#F43F5E]/15' : 'ring-[#10B981]/15',
      sparkData: [ { value: 5 }, { value: 4 }, { value: 6 }, { value: 3 }, { value: 2 }, { value: 1 }, { value: lowStockCount || 0 } ],
    },
  ];

  // ── Recent orders for table ──────────────────────────────────────────────
  const displayRecentOrders = orders.slice(0, 5).map((o: any) => {
    const style = STATUS_STYLES[o.status] ?? defaultStyle;
    return {
      id: o.display_id || `ORD-${o.id}`,
      customer: o.customer_name,
      items: o.category || '—',
      tailor: o.tailor || 'Unassigned',
      status: o.status,
      dot: style.dot,
      pill: style.pill,
      amount: `₹${parseFloat(o.total_amount || 0).toLocaleString('en-IN')}`,
      delivery: o.delivery_date ? new Date(o.delivery_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—',
    };
  });

  // ── Category Distribution for Donut Chart ────────────────────────────────
  const categoryCounts = orders.reduce((acc: Record<string, number>, curr: any) => {
    const cat = curr.category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const categoryChartData = Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value,
  })).sort((a, b) => b.value - a.value);

  const DONUT_COLORS = ['var(--primary-hex)', '#8338EC', '#10B981', '#F43F5E', '#0891B2', '#D97706'];

  // ── Quick actions ────────────────────────────────────────────────────────
  const quickActions = [
    { label: 'Add Lead',    icon: Users,    color: '#7A5AA8', path: '/crm/leads', state: { openModal: true } },
    { label: 'New Order',   icon: ShoppingBag, color: 'var(--accent-hex)', path: '/orders/list', state: { openModal: true } },
    { label: 'Create Bill', icon: FileText, color: '#10B981', path: '/billing/invoice', state: { openModal: true } },
    // { label: 'View Stock',  icon: Package,  color: 'var(--accent-hex)', path: '/inventory/stock' },
  ];

  // ─── Loading screen ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F3F8] text-[var(--primary-hex)]">
        <div className="flex flex-col h-full space-y-7 p-6 md:p-8 max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 pb-4 border-b border-slate-200/70">
            <div className="space-y-3">
              <div className="h-3 w-32 bg-slate-200 rounded animate-pulse" />
              <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-40 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-24 bg-slate-200 rounded-xl animate-pulse" />
              <div className="h-10 w-28 bg-slate-300 rounded-xl animate-pulse" />
            </div>
          </div>

          {/* Tabs Skeleton */}
          <div className="flex border-b border-slate-200/70 gap-8">
            <div className="h-6 w-20 bg-slate-200 rounded animate-pulse mb-3" />
            <div className="h-6 w-32 bg-slate-200 rounded animate-pulse mb-3" />
            <div className="h-6 w-32 bg-slate-200 rounded animate-pulse mb-3" />
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/50 shadow-sm flex items-center justify-between h-[120px] animate-pulse">
                <div className="space-y-3 w-full">
                  <div className="h-3 w-16 bg-slate-200 rounded" />
                  <div className="h-6 w-24 bg-slate-200 rounded" />
                  <div className="h-2 w-20 bg-slate-200 rounded" />
                </div>
                <div className="h-12 w-12 rounded-xl bg-slate-100 flex-shrink-0" />
              </div>
            ))}
          </div>

          {/* Content Area Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/50 p-6 h-[400px] animate-pulse">
              <div className="flex justify-between items-center mb-6">
                <div className="h-6 w-48 bg-slate-200 rounded" />
                <div className="h-4 w-20 bg-slate-200 rounded" />
              </div>
              <div className="h-72 w-full bg-slate-50 rounded-xl border border-slate-100" />
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/50 p-6 h-[400px] animate-pulse">
              <div className="h-6 w-32 bg-slate-200 rounded mb-6" />
              <div className="space-y-5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-slate-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-full bg-slate-200 rounded" />
                      <div className="h-3 w-2/3 bg-slate-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
          <p className="text-base font-semibold text-[var(--primary-hex)]">Couldn't load dashboard</p>
          <p className="text-sm text-slate-500">{error}</p>
          <button
            onClick={fetchAll}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary-hex)] text-[#F4F3F8] rounded-xl text-sm font-semibold hover:bg-[#2a3545] transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F4F3F8] text-[var(--primary-hex)]">
      <div className="flex flex-col h-full space-y-7 p-6 md:p-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 pb-4 border-b border-slate-200/70">
          <div>
            {/* <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[var(--primary-hex)] mb-1.5">Atelier Dashboard</p> */}
            <h1 className="text-3xl md:text-[2rem] font-semibold tracking-tight text-[var(--primary-hex)]">
              Boutique Overview
            </h1>
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
              <Activity className="w-3 h-3" />
              Live data · Last refreshed {lastRefreshed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchAll}
              className="px-4 py-2.5 bg-white border border-[var(--primary-hex)]/15 hover:bg-[var(--primary-hex)]/[0.03] rounded-xl text-sm font-semibold text-slate-600 transition shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            {activeTab !== 'overview' && (
              <button
                onClick={() => handleExport(activeTab as 'sales' | 'finance')}
                className="px-4 py-2.5 bg-white border border-[var(--primary-hex)]/15 hover:bg-[var(--primary-hex)]/[0.03] rounded-xl text-sm font-semibold text-slate-850 transition shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Export
              </button>
            )}
            <button
              onClick={() => navigate('/orders/list', { state: { openModal: true } })}
              className="px-4 py-2.5 bg-[var(--primary-hex)] hover:bg-[#2a3545] text-[#F4F3F8] rounded-xl text-sm font-semibold flex items-center gap-1.5 transition shadow-md shadow-[var(--primary-hex)]/10 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> New Order
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200/70 gap-8 text-sm font-semibold">
          {(['overview', 'sales', 'finance'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3.5 relative transition cursor-pointer text-base tracking-wide capitalize ${
                activeTab === tab ? 'text-[var(--primary-hex)] font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab === 'overview' ? 'Overview' : tab === 'sales' ? 'Sales Analytics' : 'Financial Analytics'}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary-hex)]" />}
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
                     className="bg-white p-5 rounded-2xl border border-slate-200/50 shadow-[0_1px_3px_rgba(28,36,48,0.04)] hover:shadow-[0_8px_20px_rgba(28,36,48,0.08)] transition duration-300 flex flex-col justify-between overflow-hidden relative min-h-[140px]"
                   >
                     <div className="flex items-center justify-between w-full">
                       <div className="space-y-1">
                         <span className="text-xs font-semibold tracking-wide uppercase text-slate-500">{stat.label}</span>
                         <h3 className="text-2xl font-bold text-[var(--primary-hex)]">{stat.value}</h3>
                         <span className="text-[10px] font-medium text-slate-400">{stat.sub}</span>
                       </div>
                       <div className={`p-2.5 rounded-xl ${stat.tint} ring-1 ${stat.ring} shrink-0`}>
                         <Icon className="w-4.5 h-4.5" style={{ color: stat.accent }} />
                       </div>
                     </div>
                     {/* Sparkline Area */}
                     {stat.sparkData && (
                       <div className="h-9 w-[110%] -ml-[5%] -mb-[5%] mt-3 opacity-90">
                         <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={stat.sparkData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                             <defs>
                               <linearGradient id={`sparkFill-${i}`} x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="0%" stopColor={stat.accent} stopOpacity={0.18} />
                                 <stop offset="100%" stopColor={stat.accent} stopOpacity={0.00} />
                               </linearGradient>
                             </defs>
                             <Area type="monotone" dataKey="value" stroke={stat.accent} strokeWidth={1.5} fill={`url(#sparkFill-${i})`} dot={false} />
                           </AreaChart>
                         </ResponsiveContainer>
                       </div>
                     )}
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
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/50 shadow-[0_1px_3px_rgba(28,36,48,0.04)] space-y-4 hover:shadow-md transition duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--primary-hex)]">Weekly Revenue</h2>
                    <div className="flex items-baseline gap-2.5 mt-1.5">
                      <span className="text-2xl font-semibold text-[var(--primary-hex)]">
                        ₹{totalRevenue.toLocaleString('en-IN')}
                      </span>
                      {salesData && salesData.totalOrders > 0 && (
                        <span className="text-xs font-semibold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full">
                          {salesData.totalOrders} orders
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-3 py-1 rounded-full">
                    Mon – Sun
                  </span>
                </div>

                {weeklyChartData.length > 0 ? (
                  <div className="relative h-64 w-full -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weeklyChartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--primary-hex)" stopOpacity={0.24} />
                            <stop offset="100%" stopColor="var(--primary-hex)" stopOpacity={0.00} />
                          </linearGradient>
                          <linearGradient id="lineStroke" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="var(--primary-hex)" />
                            <stop offset="50%" stopColor="#8338EC" />
                            <stop offset="100%" stopColor="#10B981" />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }} dy={8} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} width={48} />
                        <Tooltip content={<OverviewTooltip />} cursor={{ stroke: 'var(--primary-hex)', strokeOpacity: 0.1, strokeWidth: 1.5 }} />
                        <ReferenceLine y={avgWeeklyRevenue} stroke="#94A3B8" strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: 'Average', fill: '#94A3B8', fontSize: 9, position: 'right', fontWeight: 600 }} />
                        <Area type="monotone" dataKey="revenue" stroke="url(#lineStroke)" strokeWidth={3.5} fill="url(#revenueFill)" dot={{ r: 4, fill: '#FFFFFF', stroke: 'var(--primary-hex)', strokeWidth: 2.5 }} activeDot={{ r: 6, fill: '#FFFFFF', stroke: '#8338EC', strokeWidth: 3.5 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyState icon={TrendingUp} message="No revenue data yet. Start recording payments to see trends." />
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/50 shadow-[0_1px_3px_rgba(28,36,48,0.04)] space-y-4 hover:shadow-md transition duration-300">
                <h2 className="text-lg font-semibold text-[var(--primary-hex)]">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, i) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={i}
                        onClick={() => navigate(action.path, action.state ? { state: action.state } : undefined)}
                        className="flex flex-col items-center justify-center p-4 bg-[#F4F3F8]/70 border border-slate-200/50 rounded-xl transition text-center group cursor-pointer hover:border-[var(--primary-hex)]/20 hover:bg-white hover:shadow-sm"
                      >
                        <Icon className="w-5 h-5 mb-2 transition group-hover:scale-110" style={{ color: action.color }} />
                        <span className="text-xs font-semibold text-slate-700">{action.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Low stock alert */}
                {inventoryReport && inventoryReport.lowStockItems.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200/50">
                    <p className="text-xs font-bold text-[#F43F5E] uppercase tracking-wide mb-2">Low Stock Alert</p>
                    <div className="space-y-1.5 max-h-28 overflow-y-auto">
                      {inventoryReport.lowStockItems.slice(0, 4).map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="text-slate-600 font-medium truncate max-w-[60%]">{item.name}</span>
                          <span className="text-[#F43F5E] font-bold">{item.stock} {item.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/50 shadow-[0_1px_3px_rgba(28,36,48,0.04)] space-y-4 hover:shadow-md transition duration-300">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--primary-hex)]">Recent Orders</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {orders.length > 0 ? `Showing ${Math.min(5, orders.length)} of ${orders.length} orders` : 'No orders yet'}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/orders/list')}
                  className="text-xs text-[var(--primary-hex)] hover:opacity-80 font-bold flex items-center gap-0.5 transition cursor-pointer"
                >
                  View All <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {displayRecentOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200/70 text-slate-500 font-semibold text-xs uppercase tracking-wide">
                        <th className="pb-3 pl-2">Order ID</th>
                        <th className="pb-3">Customer</th>
                        <th className="pb-3">Category</th>
                        <th className="pb-3">Tailor</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Delivery</th>
                        <th className="pb-3 text-right pr-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {displayRecentOrders.map((order, idx) => (
                        <tr key={idx} className="hover:bg-[#F4F3F8]/80 transition">
                          <td className="py-3.5 pl-2 font-semibold text-slate-850">{order.id}</td>
                          <td className="py-3.5 text-slate-600">{order.customer}</td>
                          <td className="py-3.5 font-medium text-slate-800">{order.items}</td>
                          <td className="py-3.5 text-slate-600">{order.tailor}</td>
                          <td className="py-3.5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${order.pill}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${order.dot}`} />
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3.5 text-xs text-slate-500 font-medium">{order.delivery}</td>
                          <td className="py-3.5 text-right pr-2 font-bold text-[var(--primary-hex)]">{order.amount}</td>
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
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/50 shadow-sm flex items-center justify-between hover:shadow-md transition duration-300">
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Revenue</span>
                      <h3 className="text-3xl font-black text-[var(--primary-hex)] mt-1">
                        ₹{salesData.totalRevenue.toLocaleString('en-IN')}
                      </h3>
                      <span className="inline-flex items-center text-xs text-slate-500 bg-slate-50 px-2.5 py-0.5 rounded-full font-bold mt-2">
                        All time earnings
                      </span>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/15 text-[#10B981] shadow-sm">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/50 shadow-sm flex items-center justify-between hover:shadow-md transition duration-300">
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Orders</span>
                      <h3 className="text-3xl font-black text-[var(--primary-hex)] mt-1">{salesData.totalOrders}</h3>
                      <span className="inline-flex items-center text-xs text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full font-bold mt-2">
                        Payments received
                      </span>
                    </div>
                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 shadow-sm">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/50 shadow-sm flex items-center justify-between hover:shadow-md transition duration-300">
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg. Order Value</span>
                      <h3 className="text-3xl font-black text-[var(--primary-hex)] mt-1">
                        ₹{salesData.averageOrderValue.toLocaleString('en-IN')}
                      </h3>
                      <span className="inline-flex items-center text-xs text-slate-500 bg-slate-50 px-2.5 py-0.5 rounded-full font-bold mt-2">
                        Across {salesData.totalOrders} orders
                      </span>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#F4F3F8] border border-slate-200/60 text-slate-600 shadow-sm">
                      <Calendar className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Chart & Category Donut */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/50 shadow-sm space-y-4 hover:shadow-md transition duration-300">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold text-[var(--primary-hex)]">Revenue by Day</h2>
                      <div className="text-xs font-semibold text-slate-500">Daily boutique earnings</div>
                    </div>
                    {salesData.chartData.length > 0 ? (
                      <div className="h-64 w-full min-h-[240px] pt-2 -ml-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={salesData.chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorSalesRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--primary-hex)" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="var(--primary-hex)" stopOpacity={0.05} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E2E8F0" />
                            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }} tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
                            <Tooltip content={<SalesTooltip />} cursor={{ fill: 'var(--primary-hex)', fillOpacity: 0.03, radius: 8 }} />
                            <Bar dataKey="value" fill="url(#colorSalesRevenue)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                            <Line type="monotone" dataKey="value" stroke="var(--primary-hex)" strokeWidth={2.5} dot={{ r: 3, fill: '#FFFFFF', stroke: 'var(--primary-hex)', strokeWidth: 2 }} activeDot={{ r: 5, fill: '#FFFFFF', stroke: 'var(--primary-hex)', strokeWidth: 3 }} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <EmptyState icon={TrendingUp} message="No daily sales data available yet." />
                    )}
                  </div>

                  {/* Category Donut Chart */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/50 shadow-sm space-y-4 hover:shadow-md transition duration-300 flex flex-col justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-[var(--primary-hex)]">Sales by Category</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Garment category distribution</p>
                    </div>
                    {categoryChartData.length > 0 ? (
                      <div className="h-44 w-full relative flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={65}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {categoryChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} orders`, 'Orders']} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute flex flex-col items-center justify-center">
                          <span className="text-xl font-bold text-[var(--primary-hex)]">
                            {orders.length}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Total</span>
                        </div>
                      </div>
                    ) : (
                      <EmptyState icon={ShoppingBag} message="No categories recorded yet." />
                    )}
                    {/* Custom Legend */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                      {categoryChartData.slice(0, 4).map((entry, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 truncate">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }} />
                          <span className="text-slate-600 truncate">{entry.name}</span>
                          <span className="text-slate-400 font-bold ml-auto">{((entry.value / orders.length) * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top Customers Section */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/50 shadow-sm space-y-4 hover:shadow-md transition duration-300">
                  <div>
                    <h2 className="text-lg font-bold text-[var(--primary-hex)]">Top Customers</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Ranked by total spend</p>
                  </div>
                  {salesData.topCustomers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {salesData.topCustomers.slice(0, 6).map((c, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-[#F4F3F8]/40 border border-slate-100 hover:bg-[#F4F3F8]/80 rounded-xl transition">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/50 text-[var(--primary-hex)] flex items-center justify-center font-bold text-sm">
                              {c.name.split(' ').map((n: any) => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800 truncate max-w-[150px]">{c.name}</p>
                              <p className="text-[10px] font-semibold text-slate-450 uppercase tracking-wider">{c.orders} orders</p>
                            </div>
                          </div>
                          <span className="text-sm font-bold text-[var(--primary-hex)]">₹{c.spend.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState icon={Users} message="No customer data yet. Record payments to see top customers." />
                  )}
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
                    { label: 'Pending Receivables', value: financeData.pendingReceivables, icon: DollarSign, accent: 'var(--accent-hex)', tint: 'bg-amber-50', border: 'border-amber-100' },
                  ].map((card, i) => {
                    const Icon = card.icon;
                    return (
                      <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/50 shadow-sm hover:shadow-md transition duration-300">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.label}</span>
                          <div className={`p-2 ${card.tint} border ${card.border} rounded-xl`} style={{ color: card.accent }}>
                            <Icon className="w-4 h-4" />
                          </div>
                        </div>
                        <h3 className="text-xl font-black text-[var(--primary-hex)]" style={{ color: i === 2 ? '#10B981' : i === 3 ? 'var(--accent-hex)' : 'var(--primary-hex)' }}>
                          ₹{card.value.toLocaleString('en-IN')}
                        </h3>
                      </div>
                    );
                  })}
                </div>

                {/* Monthly Revenue vs Expenses Chart */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/50 shadow-sm space-y-4 hover:shadow-md transition duration-300">
                  <div className="flex justify-between items-center pb-2">
                    <div>
                      <h2 className="text-lg font-bold text-[var(--primary-hex)]">Monthly Revenue vs Expenses</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Last 6 months comparison</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold">
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#10B981] inline-block" /> Revenue</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#F43F5E] inline-block" /> Expenses</span>
                    </div>
                  </div>
                  {financeData.chartData.length > 0 ? (
                    <div className="h-72 w-full min-h-[260px] pt-4 -ml-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={financeData.chartData} barGap={5} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorFinanceRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.9} />
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0.15} />
                            </linearGradient>
                            <linearGradient id="colorFinanceExpenses" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.9} />
                              <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.15} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--primary-hex)" strokeOpacity={0.08} />
                          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'var(--primary-hex)', opacity: 0.55, fontSize: 11, fontWeight: 600 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--primary-hex)', opacity: 0.55, fontSize: 11, fontWeight: 600 }} tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
                          <Tooltip content={<FinanceTooltip />} cursor={{ fill: 'var(--primary-hex)', fillOpacity: 0.02, radius: 8 }} />
                          <Bar dataKey="revenue" fill="url(#colorFinanceRevenue)" radius={[4, 4, 0, 0]} maxBarSize={16} />
                          <Bar dataKey="expenses" fill="url(#colorFinanceExpenses)" radius={[4, 4, 0, 0]} maxBarSize={16} />
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