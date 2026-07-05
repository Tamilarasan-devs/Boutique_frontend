import { fetchWithAuth } from './client';
import { API_BASE_URL } from '@/constants';

export interface Employee {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  role: 'Tailor' | 'Receptionist' | 'Manager' | 'Other';
  salary: number;
  join_date: string;
  status: 'Active' | 'Inactive';
  address?: string;
  notes?: string;
  created_at: string;
  active_orders_count?: number;
  present_this_month?: number;
}

export interface EmployeeMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface EmployeeFilters {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const employeeApi = {
  getEmployees: async (filters: EmployeeFilters = {}): Promise<Employee[] | { employees: Employee[]; meta: EmployeeMeta }> => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.role) params.append('role', filters.role);
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const response = await fetchWithAuth(`${API_BASE_URL}/employees?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch employees');
    return await response.json();
  },

  getEmployeeById: async (id: number): Promise<Employee> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/employees/${id}`);
    if (!response.ok) throw new Error('Failed to fetch employee');
    return await response.json();
  },

  addEmployee: async (data: Partial<Employee>): Promise<{ message: string; employee: Employee }> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to add employee');
    }
    return await response.json();
  },

  updateEmployee: async (id: number, data: Partial<Employee>): Promise<{ message: string; employee: Employee }> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to update employee');
    }
    return await response.json();
  },

  deleteEmployee: async (id: number): Promise<{ message: string }> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/employees/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete employee');
    return await response.json();
  },
};
