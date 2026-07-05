import { fetchWithAuth } from './client';
import { API_BASE_URL } from '@/constants';

export interface Lead {
  id: string; // Database ID
  lead_id: string; // UI display ID like LEAD-101
  name: string;
  phone: string;
  source: string;
  requirement: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Won' | 'Lost';
  value: string;
}

export const leadApi = {
  getLeads: async (): Promise<Lead[]> => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/leads`);
      if (!response.ok) throw new Error('Failed to fetch leads');
      return await response.json();
    } catch (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }
  },

  addLead: async (leadData: Omit<Lead, 'id'>): Promise<Lead> => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData),
      });
      if (!response.ok) throw new Error('Failed to add lead');
      return await response.json();
    } catch (error) {
      console.error('Error adding lead:', error);
      throw error;
    }
  },

  updateLeadStatus: async (id: string, status: Lead['status']): Promise<Lead> => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/leads/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update lead status');
      return await response.json();
    } catch (error) {
      console.error('Error updating lead status:', error);
      throw error;
    }
  },

  deleteLead: async (id: string): Promise<void> => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/leads/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete lead');
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }
  },
};
