import { fetchWithAuth } from './client';
import { API_BASE_URL as BASE } from '@/constants';
const API_BASE = `${BASE}/inventory`;

const req = async (url: string, options: RequestInit = {}) => {
  const res = await fetchWithAuth(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
};

export const inventoryApi = {
  // --- Items (Fabrics + Accessories) ---
  getItems: () => req(`${API_BASE}/items`),
  getFabrics: async () => {
    const items = await req(`${API_BASE}/items`);
    return items.filter((i: any) => i.type === 'Fabric');
  },
  getAccessories: async () => {
    const items = await req(`${API_BASE}/items`);
    return items.filter((i: any) => i.type === 'Accessory');
  },
  addItem: (data: any) => req(`${API_BASE}/items`, { method: 'POST', body: JSON.stringify(data) }),
  updateItem: (id: number, data: any) => req(`${API_BASE}/items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteItem: (id: number) => req(`${API_BASE}/items/${id}`, { method: 'DELETE' }),

  // --- Suppliers ---
  getSuppliers: () => req(`${API_BASE}/suppliers`),
  addSupplier: (data: any) => req(`${API_BASE}/suppliers`, { method: 'POST', body: JSON.stringify(data) }),
  updateSupplier: (id: number, data: any) => req(`${API_BASE}/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSupplier: (id: number) => req(`${API_BASE}/suppliers/${id}`, { method: 'DELETE' }),

  // --- Purchases ---
  getPurchases: () => req(`${API_BASE}/purchases`),
  addPurchase: (data: any) => req(`${API_BASE}/purchases`, { method: 'POST', body: JSON.stringify(data) }),
  updatePurchase: (id: number, data: any) => req(`${API_BASE}/purchases/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePurchase: (id: number) => req(`${API_BASE}/purchases/${id}`, { method: 'DELETE' }),
  updatePurchaseStatus: (id: number, status: string) =>
    req(`${API_BASE}/purchases/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // --- Stock Ledger ---
  getStockLedger: () => req(`${API_BASE}/stock-ledger`),
  addStockLog: (data: any) => req(`${API_BASE}/stock-ledger`, { method: 'POST', body: JSON.stringify(data) }),
};
