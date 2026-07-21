import { fetchWithAuth } from './client';
import { API_BASE_URL } from '@/constants';

export interface EmailLog {
  id: number;
  to_email: string;
  to_name?: string;
  subject: string;
  message: string;
  template_name?: string;
  status: 'sent' | 'failed';
  error_message?: string;
  sender_email?: string;
  sent_at: string;
}

export interface EmailStats {
  total_sent: number;
  successful: number;
  failed: number;
  sent_today: number;
}

export const emailLogApi = {
  // Log an email after sending via EmailJS
  logEmail: async (data: {
    to_email: string;
    to_name?: string;
    subject: string;
    message: string;
    template_name?: string;
    status?: 'sent' | 'failed';
    error_message?: string;
  }): Promise<{ message: string; log: EmailLog }> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/email/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to log email');
    }
    return await response.json();
  },

  // Get all email logs
  getLogs: async (filters: { search?: string; status?: string; page?: number; limit?: number } = {}): Promise<EmailLog[] | { logs: EmailLog[]; meta: any }> => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));
    const response = await fetchWithAuth(`${API_BASE_URL}/email/logs?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch email logs');
    return await response.json();
  },

  // Get stats
  getStats: async (): Promise<EmailStats> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/email/stats`);
    if (!response.ok) throw new Error('Failed to fetch email stats');
    return await response.json();
  },

  // Delete a log
  deleteLog: async (id: number): Promise<{ message: string }> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/email/logs/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete email log');
    return await response.json();
  },
};
