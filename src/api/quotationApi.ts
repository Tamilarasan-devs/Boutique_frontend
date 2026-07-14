import { fetchWithAuth } from './client';
import { API_BASE_URL } from '@/constants';

export const quotationApi = {
  getQuotations: async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/quotations`);
    if (!response.ok) throw new Error('Failed to fetch quotations');
    return await response.json();
  },

  addQuotation: async (data: any) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/quotations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add quotation');
    return await response.json();
  },

  updateStatus: async (id: string, status: string) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/quotations/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update quotation status');
    return await response.json();
  },

  deleteQuotation: async (id: string) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/quotations/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete quotation');
    return await response.json();
  },

  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    // We cannot use fetchWithAuth directly because we need to let the browser set the Content-Type boundary for FormData
    const token = localStorage.getItem('boutique_token');
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });
    
    if (!response.ok) throw new Error('Failed to upload image');
    return await response.json();
  }
};
