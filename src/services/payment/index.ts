import { api } from '../api';
import type { Invoice, ApiResponse, PaginationMeta } from '../../types';
import { buildQueryString } from '../../utils';

type PaymentListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
};

interface PaymentListResponse {
  invoices: Invoice[];
  meta: PaginationMeta;
}

export const paymentService = {
  getInvoices: (params: PaymentListParams = {}): Promise<ApiResponse<PaymentListResponse>> =>
    api.get<PaymentListResponse>(`/billing/invoices?${buildQueryString(params)}`),

  getInvoiceById: (id: string): Promise<ApiResponse<Invoice>> =>
    api.get<Invoice>(`/billing/invoices/${id}`),

  createInvoice: (data: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>): Promise<ApiResponse<Invoice>> =>
    api.post<Invoice>('/billing/invoices', data),

  recordPayment: (
    invoiceId: string,
    amount: number,
    method: string,
    notes?: string
  ): Promise<ApiResponse<Invoice>> =>
    api.post<Invoice>(`/billing/invoices/${invoiceId}/payments`, { amount, method, notes }),

  sendInvoice: (id: string): Promise<ApiResponse<null>> =>
    api.post<null>(`/billing/invoices/${id}/send`, {}),

  voidInvoice: (id: string): Promise<ApiResponse<null>> =>
    api.patch<null>(`/billing/invoices/${id}/void`, {}),
};