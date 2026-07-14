import { fetchWithAuth } from './client';
import { API_BASE_URL } from '../constants';

export interface MarketingCampaign {
  id: string;
  boutique_id: number;
  name: string;
  channel: string;
  audience_count: number;
  status: 'Draft' | 'Running' | 'Completed' | 'Paused';
  subject: string;
  body: string;
  open_rate: number;
  sent_at: string;
  created_at: string;
  updated_at: string;
}

export const campaignApi = {
  // Get all campaigns
  getCampaigns: async (): Promise<MarketingCampaign[]> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/campaigns`);
    if (!response.ok) throw new Error('Failed to fetch campaigns');
    return await response.json();
  },

  // Get audiences
  getCampaignAudiences: async (): Promise<{ customers: string[], leads: string[], followups: string[] }> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/campaigns/audiences`);
    if (!response.ok) throw new Error('Failed to fetch audiences');
    return await response.json();
  },

  // Create a new campaign
  createCampaign: async (data: {
    name: string;
    channel?: string;
    audience_count: number;
    status?: string;
    subject: string;
    body: string;
  }): Promise<MarketingCampaign> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to create campaign');
    }
    
    return await response.json();
  },

  // Delete a campaign
  deleteCampaign: async (id: string): Promise<{ message: string }> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/campaigns/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to delete campaign');
    }
    
    return await response.json();
  }
};
