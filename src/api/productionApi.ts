import { fetchWithAuth } from './client';
import { API_BASE_URL } from '@/constants';

export const productionApi = {
  getProduction: async (page?: number, limit?: number) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/production?page=${page || 1}&limit=${limit || 20}`);
    if (!response.ok) throw new Error('Failed to fetch production');
    const result = await response.json();
    return Array.isArray(result) ? result : (result.data || result.production || []);
  },

  addProduction: async (data: any) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/production`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add production item');
    return await response.json();
  },

  updateStage: async (id: string, stage: string) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/production/${id}/stage`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage }),
    });
    if (!response.ok) throw new Error('Failed to update production stage');
    return await response.json();
  },

  deleteProduction: async (id: string) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/production/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete production item');
    return await response.json();
  },
};
