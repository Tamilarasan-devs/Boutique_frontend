import { fetchWithAuth } from './client';
import { API_BASE_URL } from '@/constants';

export const customerApi = {
  getCustomers: async (page?: number, limit?: number) => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/customers?page=${page || 1}&limit=${limit || 20}`);
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      const result = await response.json();
      return Array.isArray(result) ? result : (result.data || result.customers || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  },

  addCustomer: async (customerData: any) => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to add customer');
      }
      return await response.json();
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    }
  },

  updateCustomer: async (id: string, customerData: any) => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/customers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update customer');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  },

  deleteCustomer: async (id: string) => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/customers/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete customer');
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  },
};
