import { api } from '../api';
import type { Order, ApiResponse, PaginationMeta } from '../../types';
import { buildQueryString } from '../../utils';

type OrderListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  customerId?: string;
};

interface OrderListResponse {
  orders: Order[];
  meta: PaginationMeta;
}

export const orderService = {
  getAll: (params: OrderListParams = {}): Promise<ApiResponse<OrderListResponse>> =>
    api.get<OrderListResponse>(`/orders?${buildQueryString(params)}`),

  getById: (id: string): Promise<ApiResponse<Order>> =>
    api.get<Order>(`/orders/${id}`),

  create: (data: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Order>> =>
    api.post<Order>('/orders', data),

  update: (id: string, data: Partial<Order>): Promise<ApiResponse<Order>> =>
    api.put<Order>(`/orders/${id}`, data),

  updateStatus: (id: string, status: Order['status']): Promise<ApiResponse<Order>> =>
    api.patch<Order>(`/orders/${id}/status`, { status }),

  delete: (id: string): Promise<ApiResponse<null>> =>
    api.delete<null>(`/orders/${id}`),
};