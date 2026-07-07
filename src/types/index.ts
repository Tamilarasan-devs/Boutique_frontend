// ──────────────────────────────────────────────
// Global Application Types
// ──────────────────────────────────────────────

// ─── Auth & User ─────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'staff' | 'tailor';
  avatar?: string;
  branch?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ─── Common ──────────────────────────────────
export type Status = 'active' | 'inactive' | 'pending' | 'archived';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  meta?: PaginationMeta;
}

// ─── CRM ─────────────────────────────────────
export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  source: 'walk-in' | 'referral' | 'instagram' | 'whatsapp' | 'other';
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  notes?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  gender?: 'male' | 'female' | 'other';
  dob?: string;
  notes?: string;
  totalOrders?: number;
  totalSpend?: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Measurements ────────────────────────────
export interface Measurement {
  id: string;
  customerId: string;
  type: 'suit' | 'kurta' | 'lehenga' | 'saree' | 'other';
  values: Record<string, number>;
  notes?: string;
  takenBy?: string;
  takenAt: string;
}

// ─── Orders ──────────────────────────────────
export type OrderStatus =
  | 'draft'
  | 'confirmed'
  | 'in_production'
  | 'trial_scheduled'
  | 'trial_done'
  | 'ready'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id: string;
  name: string;
  type: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  status: OrderStatus;
  deliveryDate?: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Inventory ───────────────────────────────
export interface FabricItem {
  id: string;
  name: string;
  code: string;
  category: string;
  color: string;
  quantity: number;
  unit: 'meters' | 'yards';
  costPerUnit: number;
  supplierId?: string;
  reorderLevel: number;
  location?: string;
  updatedAt: string;
}

// ─── Staff ───────────────────────────────────
export interface Employee {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: string;
  department: string;
  joinDate: string;
  salary?: number;
  status: Status;
}

// ─── Billing ─────────────────────────────────
export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  orderId?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  dueDate?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  createdAt: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// ─── UI State ────────────────────────────────
export interface TableColumn<T = Record<string, unknown>> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
}