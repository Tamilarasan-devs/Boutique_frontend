import { fetchWithAuth } from './client';
import { API_BASE_URL as BASE } from '@/constants';
const API_BASE_URL = `${BASE}/billing`;

export const BILLING_EVENTS_URL = `${API_BASE_URL}/events`;

export interface InvoiceItemDetail {
  description: string;
  quantity: number;
  price: number;
  amount: number;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  order_id: number | null;
  quotation_id?: number | null;
  customer_name: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Draft';
  items: string | InvoiceItemDetail[];
  created_at: string;
}

export interface Payment {
  id: number;
  receipt_number: string;
  invoice_id: number;
  customer_name: string;
  amount: number;
  method: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';
  payment_date: string;
  note?: string;
  created_at: string;
}

export const billingApi = {
  getInvoices: async (): Promise<Invoice[]> => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/invoices`);
      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  },

  getInvoiceById: async (id: number): Promise<Invoice> => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/invoices/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch invoice details');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      throw error;
    }
  },

  createInvoice: async (invoiceData: Omit<Invoice, 'id' | 'invoice_number' | 'created_at'>): Promise<{ message: string; invoice: Invoice }> => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });
      if (!response.ok) {
        throw new Error('Failed to create invoice');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  },

  updateInvoiceStatus: async (id: number, status: Invoice['status']): Promise<{ message: string; invoice: Invoice }> => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/invoices/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error('Failed to update invoice status');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating invoice status:', error);
      throw error;
    }
  },

  deleteInvoice: async (id: number): Promise<{ message: string; invoice: Invoice }> => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/invoices/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete invoice');
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  },

  getPayments: async (): Promise<Payment[]> => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/payments`);
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  },

  recordPayment: async (paymentData: Omit<Payment, 'id' | 'receipt_number' | 'created_at'>): Promise<{ message: string; payment: Payment; invoice: Invoice }> => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });
      if (!response.ok) {
        throw new Error('Failed to record payment');
      }
      return await response.json();
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  },
};
