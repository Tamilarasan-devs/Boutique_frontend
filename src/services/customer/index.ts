import { api } from '../api';
import type { Customer, ApiResponse, PaginationMeta } from '../../types';
import { buildQueryString } from '../../utils';

type CustomerListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
};

interface CustomerListResponse {
  customers: Customer[];
  meta: PaginationMeta;
}

export const customerService = {
  getAll: (params: CustomerListParams = {}): Promise<ApiResponse<CustomerListResponse>> =>
    api.get<CustomerListResponse>(`/customers?${buildQueryString(params)}`),

  getById: (id: string): Promise<ApiResponse<Customer>> =>
    api.get<Customer>(`/customers/${id}`),

  create: (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Customer>> =>
    api.post<Customer>('/customers', data),

  update: (id: string, data: Partial<Customer>): Promise<ApiResponse<Customer>> =>
    api.put<Customer>(`/customers/${id}`, data),

  delete: (id: string): Promise<ApiResponse<null>> =>
    api.delete<null>(`/customers/${id}`),
};