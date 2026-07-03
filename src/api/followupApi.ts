const API_BASE_URL = 'http://localhost:8080/api';

export const followupApi = {
  getFollowups: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/followups`);
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
      const response = await fetch(`${API_BASE_URL}/followups`, {
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
      const numericId = id.replace('FOL-', '');
      const response = await fetch(`${API_BASE_URL}/followups/${numericId}/status`, {
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
};
