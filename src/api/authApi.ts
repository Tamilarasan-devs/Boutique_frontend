import { fetchWithAuth } from './client';
import { API_BASE_URL } from '@/constants';


export const authApi = {
  // Check if owner has been registered yet (first-time setup)
  checkOwnerExists: async (): Promise<{ ownerExists: boolean }> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/auth/check-owner`);
    if (!response.ok) throw new Error('Failed to check owner status');
    return response.json();
  },

  // Register as the Owner (first time only)
  register: async (data: { name: string; email: string; password: string }) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error || 'Registration failed');
    return json;
  },

  // Login with email + password
  login: async (data: { email: string; password: string }) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error || 'Login failed');
    return json; // { token, user: { id, name, email, role } }
  },

  // Get current logged-in user profile
  getMe: async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/auth/me`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Unauthorized');
      }
      throw new Error('Failed to fetch profile');
    }
    return response.json();
  },

  // Owner: create a new staff user
  createUser: async (data: { name: string; email: string; password: string; role: string }) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/auth/create-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error || 'Failed to create user');
    return json;
  },

  // Owner: get all staff users
  getUsers: async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/auth/users`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  // Owner: update a staff user
  updateUser: async (id: string, data: { name?: string; role?: string; is_active?: boolean }) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/auth/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error || 'Failed to update user');
    return json;
  },

  // Owner: delete a staff user
  deleteUser: async (id: string) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/auth/users/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error || 'Failed to delete user');
    return json;
  },
};
