import { fetchWithAuth } from './client';
import { API_BASE_URL } from '@/constants';

export const trialApi = {
  getTrials: async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/trials`);
    if (!response.ok) throw new Error('Failed to fetch trials');
    return await response.json();
  },

  addTrial: async (data: any) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/trials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add trial');
    return await response.json();
  },

  updateStatus: async (id: string, status: string, alteration_notes?: string) => {
    const body: any = { status };
    if (alteration_notes !== undefined) body.alteration_notes = alteration_notes;
    const response = await fetchWithAuth(`${API_BASE_URL}/trials/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error('Failed to update trial status');
    return await response.json();
  },

  deleteTrial: async (id: string) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/trials/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete trial');
    return await response.json();
  },
};
