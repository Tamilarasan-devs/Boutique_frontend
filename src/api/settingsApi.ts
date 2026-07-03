const API_BASE_URL = 'http://localhost:8080/api';

const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('boutique_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const settingsApi = {
  getCompanyProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/settings/company`, {
      headers: { 'Content-Type': 'application/json' }
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.message || 'Failed to fetch settings');
    return json;
  },
  
  updateCompanyProfile: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/settings/company`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.message || 'Failed to update settings');
    return json;
  }
};
