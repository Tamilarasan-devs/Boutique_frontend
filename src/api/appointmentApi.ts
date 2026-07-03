const API_BASE_URL = 'http://localhost:8080/api';

export const appointmentApi = {
  getAppointments: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments`);
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },

  addAppointment: async (appointmentData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });
      if (!response.ok) {
        throw new Error('Failed to add appointment');
      }
      return await response.json();
    } catch (error) {
      console.error('Error adding appointment:', error);
      throw error;
    }
  },

  updateAppointmentStatus: async (id: string, status: string) => {
    try {
      // Remove APT- prefix if present for backend compat
      const numericId = id.replace('APT-', '');
      const response = await fetch(`${API_BASE_URL}/appointments/${numericId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error('Failed to update appointment status');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  },

  deleteAppointment: async (id: string) => {
    try {
      const numericId = id.replace('APT-', '');
      const response = await fetch(`${API_BASE_URL}/appointments/${numericId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete appointment');
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  },
};
