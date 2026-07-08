import { fetchWithAuth } from './client';
import { API_BASE_URL } from '@/constants';

export interface AttendanceRecord {
  id?: number;
  attendance_id?: number;
  employee_id: number;
  employee_name?: string;
  employee_role?: string;
  employee_phone?: string;
  employee_status?: string;
  date: string;
  check_in?: string;
  check_out?: string;
  status?: 'Login' | 'Absent' | 'Half-Day' | 'Late';
  notes?: string;
  created_at?: string;
}

export interface AttendanceSummary {
  employee_id: number;
  employee_name: string;
  employee_role: string;
  present_days: number;
  absent_days: number;
  half_days: number;
  late_days: number;
  total_marked: number;
}

export const attendanceApi = {
  // Get all attendance records with optional filters
  getAttendance: async (filters: {
    date?: string;
    employee_id?: number;
    status?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<AttendanceRecord[]> => {
    const params = new URLSearchParams();
    if (filters.date) params.append('date', filters.date);
    if (filters.employee_id) params.append('employee_id', String(filters.employee_id));
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const response = await fetchWithAuth(`${API_BASE_URL}/attendance?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch attendance');
    return await response.json();
  },

  // Get all employees + their attendance status for a specific date
  getAttendanceByDate: async (date: string): Promise<AttendanceRecord[]> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/attendance/by-date?date=${date}`);
    if (!response.ok) throw new Error('Failed to fetch attendance by date');
    return await response.json();
  },

  // Mark/upsert a single attendance record
  markAttendance: async (data: {
    employee_id: number;
    date?: string;
    check_in?: string;
    check_out?: string;
    status?: string;
    notes?: string;
  }): Promise<{ message: string; attendance: AttendanceRecord }> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to mark attendance');
    }
    return await response.json();
  },

  // Bulk mark all active employees for a date
  bulkMarkAttendance: async (data: {
    date?: string;
    status?: string;
    records?: Array<{ employee_id: number; status?: string; check_in?: string; check_out?: string; notes?: string }>;
  }): Promise<{ message: string; count: number; attendance: AttendanceRecord[] }> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/attendance/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to bulk mark attendance');
    return await response.json();
  },

  // Update an existing attendance record
  updateAttendance: async (
    id: number,
    data: { check_in?: string; check_out?: string; status?: string; notes?: string }
  ): Promise<{ message: string; attendance: AttendanceRecord }> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/attendance/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update attendance');
    return await response.json();
  },

  // Delete an attendance record
  deleteAttendance: async (id: number): Promise<{ message: string }> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/attendance/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete attendance');
    return await response.json();
  },

  // Get monthly summary per employee
  getAttendanceSummary: async (month?: string, employee_id?: number): Promise<AttendanceSummary[]> => {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (employee_id) params.append('employee_id', String(employee_id));

    const response = await fetchWithAuth(`${API_BASE_URL}/attendance/summary?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch attendance summary');
    return await response.json();
  },
};
