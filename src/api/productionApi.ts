import { fetchWithAuth } from './client';
import { API_BASE_URL } from '@/constants';

export const productionApi = {
  getProduction: async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/production`);
    if (!response.ok) throw new Error('Failed to fetch production');
    return await response.json();
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
    const numericId = id.replace('PRD-', '');
    const response = await fetchWithAuth(`${API_BASE_URL}/production/${numericId}/stage`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage }),
    });
    if (!response.ok) throw new Error('Failed to update production stage');
    return await response.json();
  },

  deleteProduction: async (id: string) => {
    const numericId = id.replace('PRD-', '');
    const response = await fetchWithAuth(`${API_BASE_URL}/production/${numericId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete production item');
    return await response.json();
  },
};
