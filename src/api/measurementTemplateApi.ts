import { fetchWithAuth } from './client';
import { API_BASE_URL } from '@/constants';

export const measurementTemplateApi = {
  getTemplates: async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/measurement-templates`);
    if (!response.ok) throw new Error('Failed to fetch templates');
    return await response.json();
  },
  
  createTemplate: async (data: any) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/measurement-templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create template');
    return await response.json();
  },
  
  updateTemplate: async (id: number | string, data: any) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/measurement-templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update template');
    return await response.json();
  },
  
  deleteTemplate: async (id: number | string) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/measurement-templates/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete template');
    return await response.json();
  }
};
