import React, { useState, useEffect } from 'react';
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
  DollarSign
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

// ────────────────────────────────────────────────────────────
// Palette (boutique / atelier inspired):
// Ink      #1C2430  – headings, primary text
// Parchment #FAF7F1 – page background
// Terracotta #C1652F – primary accent (thread/fabric warmth)
// Gold     #C99A3E  – secondary accent
// Pine     #2F5D4F  – success / positive
// Rosewood #9B3B43  – alerts
// ────────────────────────────────────────────────────────────

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'finance'>('overview');
  const [loading, setLoading] = useState(true);
  
  // Real-time backend States
  const [salesData, setSalesData] = useState<SalesReportType | null>(null);
  const [financeData, setFinanceData] = useState<FinanceReportType | null>(null);
  const [inventoryReport, setInventoryReport] = useState<InventoryReportType | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [productionItems, setProductionItems] = useState<any[]>([]);
  
  // Filter States
  const [salesRange, setSalesRange] = useState('This Week');
  const [financePeriod, setFinancePeriod] = useState('H1 2026');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [sales, finance, inventory, ords, prod] = await Promise.all([
          reportApi.getSalesReport(),
          reportApi.getFinanceReport(),
          reportApi.getInventoryReport(),
          orderApi.getOrders(),
          productionApi.getProduction(),
        ]);
        setSalesData(sales);
        setFinanceData(finance);
        setInventoryReport(inventory);
        setOrders(ords || []);
        setProductionItems(prod || []);
      } catch (error) {
        console.error('Failed to load dashboard report data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleExport = async (type: 'sales' | 'finance') => {
    try {
      await reportApi.exportReport(type, 'excel');
    } catch (error) {
      console.error(`Export for ${type} failed:`, error);
    }
  };

  // Fallback Mock Data in case backend is empty
  const fallbackOrders = [
    {
      id: 'ORD-2026-001',
      customer: 'Anjali Sharma',
      items: 'Silk Anarkali Suit',
      status: 'Stitching',
      dot: 'bg-[#C99A3E]',
      pill: 'bg-[#C99A3E]/10 text-[#8a6a25] ring-1 ring-[#C99A3E]/25',
      amount: '₹18,500',
    },
    {
      id: 'ORD-2026-002',
      customer: 'Priyanka Sen',
      items: 'Designer Lehenga Choli',
      status: 'Trial Scheduled',
      dot: 'bg-[#7A5AA8]',
      pill: 'bg-[#7A5AA8]/10 text-[#5d4485] ring-1 ring-[#7A5AA8]/25',
      amount: '₹45,000',
    },
    {
      id: 'ORD-2026-003',
      customer: 'Rohan Mehra',
      items: 'Sherwani & Juti Set',
      status: 'Ready',
      dot: 'bg-[#2F5D4F]',
      pill: 'bg-[#2F5D4F]/10 text-[#234638] ring-1 ring-[#2F5D4F]/25',
      amount: '₹32,000',
    },
    {
      id: 'ORD-2026-004',
      customer: 'Meera Nair',
      items: 'Banarasi Saree Blouse',
      status: 'Delivered',
      dot: 'bg-[#6b7280]',
      pill: 'bg-slate-200/60 text-slate-600 ring-1 ring-slate-300/60',
      amount: '₹6,200',
    },
  ];

  const fallbackWeeklyRevenue = [
    { day: 'Mon', revenue: 28500 },
    { day: 'Tue', revenue: 41200 },
    { day: 'Wed', revenue: 35800 },
    { day: 'Thu', revenue: 52600 },
    { day: 'Fri', revenue: 61400 },
    { day: 'Sat', revenue: 78900 },
    { day: 'Sun', revenue: 69200 },
  ];

  const quickActions = [
    { label: 'Add Lead', icon: Users, color: 'text-[#7A5AA8]', hover: 'hover:border-[#7A5AA8]/40 hover:bg-[#7A5AA8]/[0.06]' },
    { label: 'Book Fitting', icon: Calendar, color: 'text-[#C1652F]', hover: 'hover:border-[#C1652F]/40 hover:bg-[#C1652F]/[0.06]' },
    { label: 'Create Bill', icon: FileText, color: 'text-[#2F5D4F]', hover: 'hover:border-[#2F5D4F]/40 hover:bg-[#2F5D4F]/[0.06]' },
    { label: 'Update Stock', icon: Scissors, color: 'text-[#C99A3E]', hover: 'hover:border-[#C99A3E]/40 hover:bg-[#C99A3E]/[0.06]' },
  ];

  // Tooltips
  const OverviewTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1C2430] text-[#FAF7F1] px-3.5 py-2.5 rounded-lg shadow-xl shadow-[#1C2430]/20 text-xs">
          <p className="text-[10px] font-semibold tracking-wide uppercase text-[#FAF7F1]/55 mb-0.5">
            {label}
          </p>
          <p className="text-sm font-serif font-semibold text-[#C1652F]">
            ₹{payload[0].value.toLocaleString('en-IN')}
          </p>
        </div>
      );
    }
    return null;
  };

  const SalesTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1C2430] text-[#FAF7F1] px-3.5 py-2.5 rounded-lg shadow-xl shadow-[#1C2430]/20 text-xs">
          <p className="text-[10px] font-semibold tracking-wide uppercase text-[#FAF7F1]/55 mb-0.5">
            {label}
          </p>
          <p className="text-sm font-serif font-semibold text-[#C1652F]">
            ₹{payload[0].value.toLocaleString('en-IN')}
          </p>
        </div>
      );
    }
    return null;
  };

  const FinanceTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const rev = payload[0]?.value || 0;
      const exp = payload[1]?.value || 0;
      const profit = rev - exp;
      const profitMargin = rev > 0 ? ((profit / rev) * 100).toFixed(1) : 0;
      
      return (
        <div className="bg-[#1C2430] text-[#FAF7F1] p-4 rounded-xl shadow-xl shadow-[#1C2430]/20 text-xs space-y-2 border border-[#1C2430]/10">
          <p className="font-bold text-[#FAF7F1]/55 mb-1 border-b border-[#FAF7F1]/10 pb-1">{label}</p>
          <div className="space-y-1">
            <div className="flex justify-between gap-6">
              <span className="text-[#FAF7F1]/55">Revenue:</span>
              <span className="font-bold text-[#FAF7F1] font-mono">₹{rev.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-[#FAF7F1]/55">Expenses:</span>
              <span className="font-bold text-[#9B3B43] font-mono">₹{exp.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between gap-6 border-t border-[#FAF7F1]/10 pt-1 mt-1">
              <span className="text-[#FAF7F1]/55">Net Profit:</span>
              <span className={`font-bold font-mono ${profit >= 0 ? 'text-[#2F5D4F]' : 'text-[#9B3B43]'}`}>
                ₹{profit.toLocaleString('en-IN')} ({profitMargin}%)
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAF7F1] p-6 text-slate-500 font-semibold">
        <div className="flex flex-col items-center gap-3 text-[#1C2430]/50">
          <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-[#C1652F]" />
          <p className="text-sm font-semibold tracking-wider font-serif">Opening Atelier Desk...</p>
        </div>
      </div>
    );
  }

  // Calculate real-time stats
  const activeOrdersCount = orders.filter((o: any) => o.status !== 'Completed').length;
  const inProductionCount = productionItems.filter((p: any) => p.stage !== 'Ready').length;
  const lowStockCount = inventoryReport?.lowStockItems?.length || 0;

  // Overview Statistics Grid Content
  const displayStats = [
    {
      label: 'Total Revenue',
      value: salesData ? `₹${salesData.totalRevenue.toLocaleString('en-IN')}` : '₹4,82,900',
      icon: TrendingUp,
      change: '+12.5% this month',
      accent: 'bg-[#2F5D4F]',
      tint: 'bg-[#2F5D4F]/[0.07]',
      ring: 'ring-[#2F5D4F]/15',
    },
    {
      label: 'Active Orders',
      value: activeOrdersCount > 0 ? `${activeOrdersCount}` : (salesData ? `${salesData.totalOrders}` : '42'),
      icon: ShoppingBag,
      change: '+8% vs last week',
      accent: 'bg-[#C1652F]',
      tint: 'bg-[#C1652F]/[0.08]',
      ring: 'ring-[#C1652F]/15',
    },
    {
      label: 'In Production',
      value: inProductionCount > 0 ? `${inProductionCount}` : '18',
      icon: Scissors,
      change: 'Running on schedule',
      accent: 'bg-[#C99A3E]',
      tint: 'bg-[#C99A3E]/[0.10]',
      ring: 'ring-[#C99A3E]/20',
    },
    {
      label: 'Low Stock Fabrics',
      value: lowStockCount > 0 ? `${lowStockCount}` : '5',
      icon: AlertTriangle,
      change: 'Needs attention',
      accent: 'bg-[#9B3B43]',
      tint: 'bg-[#9B3B43]/[0.08]',
      ring: 'ring-[#9B3B43]/15',
    },
  ];

  // Dynamic Weekly Revenue Chart Data mapping
  const displayWeeklyRevenue = salesData && salesData.chartData.length > 0
    ? salesData.chartData.map(d => ({ day: d.label, revenue: d.value }))
    : fallbackWeeklyRevenue;

  // Format real-time orders for display
  const displayRecentOrders = orders.length > 0
    ? orders.slice(0, 5).map((o: any) => {
        let dot = 'bg-slate-500';
        let pill = 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';
        
        if (o.status === 'Cutting') {
          dot = 'bg-[#7A5AA8]';
          pill = 'bg-[#7A5AA8]/10 text-[#5d4485] ring-1 ring-[#7A5AA8]/25';
        } else if (o.status === 'Stitching') {
          dot = 'bg-[#C99A3E]';
          pill = 'bg-[#C99A3E]/10 text-[#8a6a25] ring-1 ring-[#C99A3E]/25';
        } else if (o.status === 'Trial Scheduled' || o.status === 'Trial') {
          dot = 'bg-[#C1652F]';
          pill = 'bg-[#C1652F]/10 text-[#a3531f] ring-1 ring-[#C1652F]/25';
        } else if (o.status === 'Completed' || o.status === 'Ready') {
          dot = 'bg-[#2F5D4F]';
          pill = 'bg-[#2F5D4F]/10 text-[#234638] ring-1 ring-[#2F5D4F]/25';
        } else if (o.status === 'Received') {
          dot = 'bg-blue-600';
          pill = 'bg-blue-50 text-blue-700 ring-1 ring-blue-100';
        }
        
        return {
          id: `ORD-${o.id}`,
          customer: o.customer_name,
          items: o.category,
          status: o.status,
          dot,
          pill,
          amount: `₹${parseFloat(o.total_amount || 0).toLocaleString('en-IN')}`
        };
      })
    : fallbackOrders;

  return (
    <div className="min-h-screen bg-[#FAF7F1] text-[#1C2430]">
      <div className="flex flex-col h-full space-y-7 p-6 md:p-8 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 pb-4 border-b border-[#1C2430]/[0.08]">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#C1652F] mb-1.5">
              Atelier Dashboard
            </p>
            <h1 className="text-3xl md:text-[2rem] font-serif font-semibold tracking-tight text-[#1C2430]">
              Boutique Overview
            </h1>
            <p className="text-sm text-[#1C2430]/55 mt-1">
              {activeTab === 'overview' && "Here's what's happening at your boutique today."}
              {activeTab === 'sales' && "Detailed breakdown of revenue, orders, and top-performing customers."}
              {activeTab === 'finance' && "Revenue, expenses, profit margins, and receivable summaries."}
            </p>
          </div>
          <div className="flex gap-3">
            {activeTab !== 'overview' && (
              <button 
                onClick={() => handleExport(activeTab as 'sales' | 'finance')}
                className="px-4 py-2.5 bg-white border border-[#1C2430]/15 hover:bg-[#1C2430]/[0.03] rounded-xl text-sm font-semibold text-[#1C2430]/80 transition shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Export Report
              </button>
            )}
            <button className="px-4 py-2.5 bg-[#1C2430] hover:bg-[#2a3545] text-[#FAF7F1] rounded-xl text-sm font-semibold flex items-center gap-1.5 transition shadow-md shadow-[#1C2430]/10">
              <Plus className="w-4 h-4" /> New Order
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#1C2430]/[0.08] gap-8 text-sm font-semibold font-serif">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`pb-3.5 relative transition cursor-pointer font-serif text-base tracking-wide ${activeTab === 'overview' ? 'text-[#C1652F] font-bold' : 'text-[#1C2430]/50 hover:text-[#1C2430]/80'}`}
          >
            Overview
            {activeTab === 'overview' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C1652F]" />}
          </button>
          <button 
            onClick={() => setActiveTab('sales')}
            className={`pb-3.5 relative transition cursor-pointer font-serif text-base tracking-wide ${activeTab === 'sales' ? 'text-[#C1652F] font-bold' : 'text-[#1C2430]/50 hover:text-[#1C2430]/80'}`}
          >
            Sales Analytics
            {activeTab === 'sales' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C1652F]" />}
          </button>
          <button 
            onClick={() => setActiveTab('finance')}
            className={`pb-3.5 relative transition cursor-pointer font-serif text-base tracking-wide ${activeTab === 'finance' ? 'text-[#C1652F] font-bold' : 'text-[#1C2430]/50 hover:text-[#1C2430]/80'}`}
          >
            Financial Analytics
            {activeTab === 'finance' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C1652F]" />}
          </button>
        </div>

        {/* Conditional Tab Rendering */}
        
        {/* ────────── OVERVIEW TAB ────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-7 animate-fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {displayStats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={i}
                    className="bg-white p-5 rounded-2xl border border-[#1C2430]/[0.06] shadow-[0_1px_3px_rgba(28,36,48,0.04)] hover:shadow-[0_8px_20px_rgba(28,36,48,0.08)] transition duration-300 flex items-center justify-between"
                  >
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold tracking-wide uppercase text-[#1C2430]/45">
                        {stat.label}
                      </span>
                      <h3 className="text-2xl font-serif font-semibold text-[#1C2430]">{stat.value}</h3>
                      <span className="text-xs font-medium text-[#1C2430]/50">{stat.change}</span>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.tint} ring-1 ${stat.ring}`}>
                      <Icon className={`w-5 h-5 ${stat.accent.replace('bg-', 'text-')}`} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Main Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sales Chart */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#1C2430]/[0.06] shadow-[0_1px_3px_rgba(28,36,48,0.04)] space-y-4 hover:shadow-md transition duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-serif font-semibold text-[#1C2430]">Weekly Revenue</h2>
                    <div className="flex items-baseline gap-2.5 mt-1.5">
                      <span className="text-2xl font-serif font-semibold text-[#1C2430]">
                        ₹{salesData ? salesData.totalRevenue.toLocaleString('en-IN') : '₹3,67,600'}
                      </span>
                      <span className="text-xs font-semibold text-[#2F5D4F] bg-[#2F5D4F]/10 px-2 py-0.5 rounded-full">
                        +12.5%
                      </span>
                    </div>
                  </div>
                  <span className="text-xs bg-[#1C2430]/[0.05] text-[#1C2430]/60 font-semibold px-3 py-1 rounded-full">
                    Mon – Sun
                  </span>
                </div>

                <div className="relative h-64 w-full -ml-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={displayWeeklyRevenue} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#C1652F" stopOpacity={0.28} />
                          <stop offset="100%" stopColor="#C1652F" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="0"
                        vertical={false}
                        stroke="#1C2430"
                        strokeOpacity={0.06}
                      />
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#1C2430', opacity: 0.4, fontSize: 12, fontWeight: 600 }}
                        dy={8}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#1C2430', opacity: 0.35, fontSize: 11 }}
                        tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                        width={48}
                      />
                      <Tooltip
                        content={<OverviewTooltip />}
                        cursor={{ stroke: '#1C2430', strokeOpacity: 0.1, strokeWidth: 1 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#C1652F"
                        strokeWidth={2.75}
                        fill="url(#revenueFill)"
                        dot={{ r: 4, fill: '#C1652F', stroke: '#FAF7F1', strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: '#C1652F', stroke: '#FAF7F1', strokeWidth: 2.5 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-2xl border border-[#1C2430]/[0.06] shadow-[0_1px_3px_rgba(28,36,48,0.04)] space-y-4 hover:shadow-md transition duration-300">
                <h2 className="text-lg font-serif font-semibold text-[#1C2430]">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, i) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={i}
                        className={`flex flex-col items-center justify-center p-4 bg-[#FAF7F1]/70 border border-[#1C2430]/[0.06] rounded-xl transition text-center group cursor-pointer ${action.hover}`}
                      >
                        <Icon className={`w-5 h-5 ${action.color} mb-2 transition group-hover:scale-110`} />
                        <span className="text-xs font-semibold text-[#1C2430]/75">{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white p-6 rounded-2xl border border-[#1C2430]/[0.06] shadow-[0_1px_3px_rgba(28,36,48,0.04)] space-y-4 hover:shadow-md transition duration-300">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-serif font-semibold text-[#1C2430]">Recent Orders</h2>
                  <p className="text-xs text-[#1C2430]/45 mt-0.5">Latest active orders from boutique sales</p>
                </div>
                <button className="text-xs text-[#C1652F] hover:text-[#a3531f] font-bold flex items-center gap-0.5 transition cursor-pointer">
                  View All <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#1C2430]/[0.08] text-[#1C2430]/40 font-semibold text-xs uppercase tracking-wide">
                      <th className="pb-3 pl-2">Order ID</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Items</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right pr-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1C2430]/[0.05]">
                    {displayRecentOrders.map((order, idx) => (
                      <tr key={idx} className="hover:bg-[#FAF7F1]/80 transition">
                        <td className="py-3.5 pl-2 font-semibold text-[#1C2430]/80">{order.id}</td>
                        <td className="py-3.5 text-[#1C2430]/70">{order.customer}</td>
                        <td className="py-3.5 font-medium text-[#1C2430]/85">{order.items}</td>
                        <td className="py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${order.pill}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${order.dot}`} />
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right pr-2 font-bold font-serif text-[#1C2430]">{order.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ────────── SALES ANALYTICS TAB ────────── */}
        {activeTab === 'sales' && salesData && (
          <div className="space-y-7 animate-fade-in">
            {/* Sales Subheader Selection */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#1C2430]/[0.06] shadow-sm">
              <span className="text-sm font-semibold text-[#1C2430]/60">Select Filter Range:</span>
              <select 
                value={salesRange} 
                onChange={(e) => setSalesRange(e.target.value)} 
                className="px-4 py-2 border border-[#1C2430]/15 rounded-lg bg-[#FAF7F1]/50 text-sm font-semibold text-[#1C2430]/80 focus:outline-none cursor-pointer hover:border-[#1C2430]/30 transition"
              >
                <option>This Week</option>
                <option>This Month</option>
                <option>Last Quarter</option>
              </select>
            </div>

            {/* Sales Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white p-6 rounded-2xl border border-[#1C2430]/[0.06] shadow-sm flex items-center justify-between hover:shadow-md transition duration-300">
                <div>
                  <span className="text-xs font-bold text-[#1C2430]/40 uppercase tracking-wider">Total Revenue</span>
                  <h3 className="text-3xl font-serif font-black text-[#1C2430] mt-1">₹{salesData.totalRevenue.toLocaleString('en-IN')}</h3>
                  <span className="inline-flex items-center text-xs text-[#2F5D4F] bg-[#2F5D4F]/10 px-2.5 py-0.5 rounded-full font-bold mt-2">
                    +12.5% vs last week
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-[#2F5D4F]/10 border border-[#2F5D4F]/15 text-[#2F5D4F] shadow-sm"><TrendingUp className="w-6 h-6" /></div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-[#1C2430]/[0.06] shadow-sm flex items-center justify-between hover:shadow-md transition duration-300">
                <div>
                  <span className="text-xs font-bold text-[#1C2430]/40 uppercase tracking-wider">Orders Delivered</span>
                  <h3 className="text-3xl font-serif font-black text-[#1C2430] mt-1">{salesData.totalOrders}</h3>
                  <span className="inline-flex items-center text-xs text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full font-bold mt-2">
                    +8% vs last week
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 shadow-sm"><ShoppingBag className="w-6 h-6" /></div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-[#1C2430]/[0.06] shadow-sm flex items-center justify-between hover:shadow-md transition duration-300">
                <div>
                  <span className="text-xs font-bold text-[#1C2430]/40 uppercase tracking-wider">Avg. Order Value</span>
                  <h3 className="text-3xl font-serif font-black text-[#1C2430] mt-1">₹{salesData.averageOrderValue.toLocaleString('en-IN')}</h3>
                  <span className="inline-flex items-center text-xs text-[#1C2430]/50 bg-[#1C2430]/[0.04] px-2.5 py-0.5 rounded-full font-bold mt-2">
                    Across {salesData.totalOrders} orders
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF7F1] border border-[#1C2430]/10 text-[#1C2430]/70 shadow-sm"><Calendar className="w-6 h-6" /></div>
              </div>
            </div>

            {/* Sales Chart & Top Customers Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Daily Revenue BarChart */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#1C2430]/[0.06] shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition duration-300">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-serif font-bold text-[#1C2430]">Revenue by Day</h2>
                  <div className="text-xs font-semibold text-[#1C2430]/40">Daily boutique earnings</div>
                </div>
                <div className="h-64 w-full min-h-[240px] pt-2 -ml-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData.chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSalesRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C1652F" stopOpacity={0.85}/>
                          <stop offset="95%" stopColor="#C99A3E" stopOpacity={0.20}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1C2430" strokeOpacity={0.06} />
                      <XAxis 
                        dataKey="label" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#1C2430', opacity: 0.5, fontSize: 11, fontWeight: 600 }} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#1C2430', opacity: 0.5, fontSize: 11, fontWeight: 600 }}
                        tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} 
                      />
                      <Tooltip 
                        content={<SalesTooltip />}
                        cursor={{ fill: '#1C2430', fillOpacity: 0.03, radius: 8 }} 
                      />
                      <Bar 
                        dataKey="value" 
                        fill="url(#colorSalesRevenue)" 
                        radius={[8, 8, 0, 0]}
                        maxBarSize={45}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Customers list */}
              <div className="bg-white p-6 rounded-2xl border border-[#1C2430]/[0.06] shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition duration-300">
                <div>
                  <h2 className="text-lg font-serif font-bold text-[#1C2430]">Top Customers</h2>
                  <p className="text-xs text-[#1C2430]/45 mt-0.5">Ranked by total expenditure</p>
                </div>
                <div className="space-y-4 flex-1 mt-4 overflow-y-auto max-h-[250px] pr-1">
                  {salesData.topCustomers.map((c, i) => (
                    <div key={i} className="flex items-center justify-between p-2 hover:bg-[#FAF7F1]/80 rounded-xl transition">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#FAF7F1] border border-[#1C2430]/10 text-[#C1652F] flex items-center justify-center font-bold text-sm shadow-sm">
                          {c.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#1C2430]/85">{c.name}</p>
                          <p className="text-[10px] font-semibold text-[#1C2430]/45 uppercase tracking-wider">{c.orders} orders</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold font-serif text-[#1C2430]">₹{c.spend.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                  {salesData.topCustomers.length === 0 && (
                    <div className="text-sm text-slate-400 italic text-center py-6">No sales recorded yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ────────── FINANCIAL ANALYTICS TAB ────────── */}
        {activeTab === 'finance' && financeData && (
          <div className="space-y-7 animate-fade-in">
            {/* Finance Subheader Selection */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#1C2430]/[0.06] shadow-sm">
              <span className="text-sm font-semibold text-[#1C2430]/60">Select Period:</span>
              <select 
                value={financePeriod} 
                onChange={(e) => setFinancePeriod(e.target.value)} 
                className="px-4 py-2 border border-[#1C2430]/15 rounded-lg bg-[#FAF7F1]/50 text-sm font-semibold text-[#1C2430]/80 focus:outline-none cursor-pointer hover:border-[#1C2430]/30 transition"
              >
                <option>H1 2026</option>
                <option>Q1 2026</option>
                <option>Q2 2026</option>
              </select>
            </div>

            {/* Finance Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#1C2430]/[0.06] shadow-sm hover:shadow-md transition duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#1C2430]/40 uppercase tracking-wider">Total Revenue</span>
                  <div className="p-2 bg-[#2F5D4F]/10 border border-[#2F5D4F]/15 rounded-xl text-[#2F5D4F]"><TrendingUp className="w-4 h-4" /></div>
                </div>
                <h3 className="text-xl font-serif font-black text-[#1C2430]">₹{financeData.totalRevenue.toLocaleString('en-IN')}</h3>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-[#1C2430]/[0.06] shadow-sm hover:shadow-md transition duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#1C2430]/40 uppercase tracking-wider">Total Expenses</span>
                  <div className="p-2 bg-[#9B3B43]/10 border border-[#9B3B43]/15 rounded-xl text-[#9B3B43]"><TrendingDown className="w-4 h-4" /></div>
                </div>
                <h3 className="text-xl font-serif font-black text-[#1C2430]">₹{financeData.totalExpenses.toLocaleString('en-IN')}</h3>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-[#1C2430]/[0.06] shadow-sm hover:shadow-md transition duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#1C2430]/40 uppercase tracking-wider">Gross Profit</span>
                  <div className="p-2 bg-blue-50 border border-blue-100 rounded-xl text-blue-600"><DollarSign className="w-4 h-4" /></div>
                </div>
                <h3 className="text-xl font-serif font-black text-[#2F5D4F]">₹{financeData.grossProfit.toLocaleString('en-IN')}</h3>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-[#1C2430]/[0.06] shadow-sm hover:shadow-md transition duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#1C2430]/40 uppercase tracking-wider">Receivables</span>
                  <div className="p-2 bg-amber-50 border border-amber-100 rounded-xl text-[#C99A3E]"><DollarSign className="w-4 h-4" /></div>
                </div>
                <h3 className="text-xl font-serif font-black text-[#C99A3E]">₹{financeData.pendingReceivables.toLocaleString('en-IN')}</h3>
              </div>
            </div>

            {/* Clustered Monthly Revenue vs Expenses Chart */}
            <div className="bg-white p-6 rounded-2xl border border-[#1C2430]/[0.06] shadow-sm space-y-4 hover:shadow-md transition duration-300">
              <div className="flex justify-between items-center pb-2">
                <div>
                  <h2 className="text-lg font-serif font-bold text-[#1C2430]">Monthly Revenue vs Expenses</h2>
                  <p className="text-xs text-[#1C2430]/40 mt-0.5">Comparison of monthly income and operating expenditures</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#2F5D4F] inline-block" /> Revenue</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#9B3B43] inline-block" /> Expenses</span>
                </div>
              </div>
              <div className="h-72 w-full min-h-[260px] pt-4 -ml-2">
                {financeData.chartData.length === 0 ? (
                  <div className="text-sm text-slate-400 italic text-center py-12 w-full">No finance records logged yet.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={financeData.chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorFinanceRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2F5D4F" stopOpacity={0.85}/>
                          <stop offset="95%" stopColor="#2F5D4F" stopOpacity={0.15}/>
                        </linearGradient>
                        <linearGradient id="colorFinanceExpenses" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#9B3B43" stopOpacity={0.85}/>
                          <stop offset="95%" stopColor="#9B3B43" stopOpacity={0.15}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1C2430" strokeOpacity={0.06} />
                      <XAxis 
                        dataKey="label" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#1C2430', opacity: 0.5, fontSize: 11, fontWeight: 600 }} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#1C2430', opacity: 0.5, fontSize: 11, fontWeight: 600 }}
                        tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} 
                      />
                      <Tooltip 
                        content={<FinanceTooltip />}
                        cursor={{ fill: '#1C2430', fillOpacity: 0.03, radius: 8 }} 
                      />
                      <Bar 
                        dataKey="revenue" 
                        fill="url(#colorFinanceRevenue)" 
                        radius={[6, 6, 0, 0]}
                        maxBarSize={30}
                      />
                      <Bar 
                        dataKey="expenses" 
                        fill="url(#colorFinanceExpenses)" 
                        radius={[6, 6, 0, 0]}
                        maxBarSize={30}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;