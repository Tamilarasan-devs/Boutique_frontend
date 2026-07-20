import { fetchWithAuth } from './client';
import { API_BASE_URL } from '@/constants';

export const FOLLOWUP_EVENTS_URL = `${API_BASE_URL}/followups/events`;

export const followupApi = {
  getFollowups: async (page?: number, limit?: number) => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/followups?page=${page || 1}&limit=${limit || 20}`);
      if (!response.ok) {
        throw new Error('Failed to fetch followups');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching followups:', error);
      throw error;
    }
  },

  addFollowup: async (followupData: any) => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/followups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(followupData),
      });
      if (!response.ok) {
        throw new Error('Failed to add followup');
      }
      return await response.json();
    } catch (error) {
      console.error('Error adding followup:', error);
      throw error;
    }
  },

  updateFollowupStatus: async (id: string, status: string) => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/followups/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error('Failed to update followup status');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating followup status:', error);
      throw error;
    }
  },

  updateFollowup: async (id: string, data: any) => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/followups/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend error:', errorData);
        throw new Error(`Failed to update followup: ${errorData.details || errorData.error}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating followup:', error);
      throw error;
    }
  },

  deleteFollowup: async (id: string) => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/followups/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete followup');
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting followup:', error);
      throw error;
    }
  },
};
