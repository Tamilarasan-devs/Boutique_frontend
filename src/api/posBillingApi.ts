import { fetchWithAuth, PaginatedResponse } from './client';
import { API_BASE_URL as BASE } from '@/constants';
const API_BASE_URL = `${BASE}`;
export interface PosBill {
  id: number;
  bill_number: string;
  customer_name: string;
  customer_phone?: string;
  bill_date: string;
  total_amount: number;
  status: string;
  items: any;
}



export const posBillingApi = {
  getPosBills: async (page?: number, limit?: number): Promise<PaginatedResponse<PosBill[]>> => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/pos-billing/bills?page=${page || 1}&limit=${limit || 20}`);
      if (!response.ok) {
        throw new Error('Failed to fetch POS bills');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching POS bills:', error);
      throw error;
    }
  },

  createPosBill: async (billData: Omit<PosBill, 'id' | 'bill_number'>): Promise<{ message: string; bill: PosBill }> => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/pos-billing/bills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(billData),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.details || errData.error || 'Failed to create POS bill');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating POS bill:', error);
      throw error;
    }
  }
};
