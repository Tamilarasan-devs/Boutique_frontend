import { fetchWithAuth } from './client';
import { API_BASE_URL } from '@/constants';

export const measurementHistoryApi = {
  getHistory: async (page?: number, limit?: number) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/measurement-history?page=${page || 1}&limit=${limit || 20}`);
    if (!response.ok) throw new Error('Failed to fetch history');
    return await response.json();
  },
  
  createHistory: async (data: any) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/measurement-history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create history');
    return await response.json();
  },
  
  updateHistory: async (id: number | string, data: any) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/measurement-history/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update history');
    return await response.json();
  },
  
  deleteHistory: async (id: number | string) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/measurement-history/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete history');
    return await response.json();
  }
};
