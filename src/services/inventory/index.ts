import { api } from '../api';
import type { FabricItem, ApiResponse, PaginationMeta } from '../../types';
import { buildQueryString } from '../../utils';

type InventoryListParams = {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  supplierId?: string;
  lowStock?: boolean;
};

interface InventoryListResponse {
  items: FabricItem[];
  meta: PaginationMeta;
}

export const inventoryService = {
  getFabrics: (params: InventoryListParams = {}): Promise<ApiResponse<InventoryListResponse>> =>
    api.get<InventoryListResponse>(`/inventory/fabrics?${buildQueryString(params)}`),

  getFabricById: (id: string): Promise<ApiResponse<FabricItem>> =>
    api.get<FabricItem>(`/inventory/fabrics/${id}`),

  createFabric: (data: Omit<FabricItem, 'id' | 'updatedAt'>): Promise<ApiResponse<FabricItem>> =>
    api.post<FabricItem>('/inventory/fabrics', data),

  updateFabric: (id: string, data: Partial<FabricItem>): Promise<ApiResponse<FabricItem>> =>
    api.put<FabricItem>(`/inventory/fabrics/${id}`, data),

  deleteFabric: (id: string): Promise<ApiResponse<null>> =>
    api.delete<null>(`/inventory/fabrics/${id}`),

  adjustStock: (id: string, quantity: number, type: 'in' | 'out', reason?: string): Promise<ApiResponse<FabricItem>> =>
    api.post<FabricItem>(`/inventory/fabrics/${id}/stock-adjustment`, { quantity, type, reason }),
};