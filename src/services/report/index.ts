import { api } from '../api';
import type { ApiResponse } from '../../types';
import { buildQueryString } from '../../utils';

type ReportParams = {
  dateFrom?: string;
  dateTo?: string;
  branch?: string;
  groupBy?: 'day' | 'week' | 'month';
};

export interface SalesReportData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topCustomers: Array<{ name: string; spend: number }>;
  chartData: Array<{ label: string; value: number }>;
}

export interface InventoryReportData {
  totalItems: number;
  lowStockItems: number;
  totalValue: number;
  categoryBreakdown: Array<{ category: string; count: number; value: number }>;
}

export interface FinanceReportData {
  totalRevenue: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  pendingReceivables: number;
  chartData: Array<{ label: string; revenue: number; expenses: number }>;
}

export const reportService = {
  getSalesReport: (params: ReportParams = {}): Promise<ApiResponse<SalesReportData>> =>
    api.get<SalesReportData>(`/reports/sales?${buildQueryString(params)}`),

  getInventoryReport: (params: ReportParams = {}): Promise<ApiResponse<InventoryReportData>> =>
    api.get<InventoryReportData>(`/reports/inventory?${buildQueryString(params)}`),

  getFinanceReport: (params: ReportParams = {}): Promise<ApiResponse<FinanceReportData>> =>
    api.get<FinanceReportData>(`/reports/finance?${buildQueryString(params)}`),

  exportReport: (type: 'sales' | 'inventory' | 'finance' | 'customers', format: 'pdf' | 'excel'): Promise<Blob> =>
    fetch(`/api/reports/${type}/export?format=${format}`).then(r => r.blob()),
};