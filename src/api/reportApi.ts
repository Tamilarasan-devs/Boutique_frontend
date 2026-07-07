import { fetchWithAuth } from './client';
import { API_BASE_URL as BASE } from '@/constants';
const API_BASE_URL = `${BASE}/reports`;

export interface SalesReport {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topCustomers: Array<{ name: string; spend: number; orders: number }>;
  chartData: Array<{ label: string; value: number }>;
}

export interface InventoryReport {
  totalItems: number;
  lowStockItems: Array<{ name: string; stock: number; unit: string; min: number }>;
  totalValue: number;
  categoryBreakdown: Array<{ category: string; count: number; value: number; pct: number }>;
}

export interface FinanceReport {
  totalRevenue: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  pendingReceivables: number;
  chartData: Array<{ label: string; revenue: number; expenses: number }>;
}

export interface CustomersReport {
  totalCustomers: number;
  totalRevenue: number;
  totalOrders: number;
  customers: Array<{ name: string; orders: number; totalSpend: number; avgOrder: number; loyalty: string; lastOrder: string }>;
}

export const reportApi = {
  getSalesReport: async (): Promise<SalesReport> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/sales`);
    if (!res.ok) throw new Error('Failed to fetch sales report');
    return res.json();
  },

  getInventoryReport: async (): Promise<InventoryReport> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/inventory`);
    if (!res.ok) throw new Error('Failed to fetch inventory report');
    return res.json();
  },

  getFinanceReport: async (): Promise<FinanceReport> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/finance`);
    if (!res.ok) throw new Error('Failed to fetch finance report');
    return res.json();
  },

  getCustomersReport: async (): Promise<CustomersReport> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/customers`);
    if (!res.ok) throw new Error('Failed to fetch customers report');
    return res.json();
  },

  exportReport: async (type: 'sales' | 'inventory' | 'finance' | 'customers', format: 'pdf' | 'excel') => {
    window.open(`${API_BASE_URL}/${type}/export?format=${format}`);
  }
};
