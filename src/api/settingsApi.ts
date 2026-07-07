import { fetchWithAuth } from './client';
import { API_BASE_URL } from '@/constants';


export const settingsApi = {
  getCompanyProfile: async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/settings/company`, {
      headers: { 'Content-Type': 'application/json' }
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.message || 'Failed to fetch settings');
    return json;
  },
  
  updateCompanyProfile: async (data: any) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/settings/company`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.message || 'Failed to update settings');
    return json;
  }
};
