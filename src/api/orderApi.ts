import { fetchWithAuth } from './client';
import { API_BASE_URL } from '@/constants';

export const orderApi = {
  getOrders: async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/orders`);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  addOrder: async (orderData: any) => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) {
        throw new Error('Failed to add order');
      }
      return await response.json();
    } catch (error) {
      console.error('Error adding order:', error);
      throw error;
    }
  },

  updateOrderStatus: async (id: string, status: string) => {
    try {
      const numericId = id.replace('ORD-', '');
      const response = await fetchWithAuth(`${API_BASE_URL}/orders/${numericId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  deleteOrder: async (id: string) => {
    try {
      const numericId = id.replace('ORD-', '');
      const response = await fetchWithAuth(`${API_BASE_URL}/orders/${numericId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete order');
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  },

  convertFromQuotation: async (quotationId: string) => {
    const numericId = quotationId.replace('QOT-', '');
    const response = await fetchWithAuth(`${API_BASE_URL}/orders/from-quotation/${numericId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to convert quotation to order');
    return await response.json();
  },
};
