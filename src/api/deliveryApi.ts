import { fetchWithAuth } from './client';
import { API_BASE_URL } from '@/constants';

export const deliveryApi = {
  getDeliveries: async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/deliveries`);
    if (!response.ok) throw new Error('Failed to fetch deliveries');
    return await response.json();
  },

  addDelivery: async (data: any) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/deliveries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add delivery');
    return await response.json();
  },

  updateStatus: async (id: string | number, status: string) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/deliveries/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update delivery status');
    return await response.json();
  },

  deleteDelivery: async (id: string | number) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/deliveries/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete delivery');
    return await response.json();
  },
};
