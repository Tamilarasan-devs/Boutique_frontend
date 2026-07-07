// ─── App-wide constants ──────────────────────────────────────────────────────

export const APP_NAME = 'Boutique CRM';
export const APP_VERSION = '1.0.0';

// ─── Pagination ──────────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// ─── Lead sources ────────────────────────────────────────────────────────────
export const LEAD_SOURCES = [
  { label: 'Walk-in', value: 'walk-in' },
  { label: 'Referral', value: 'referral' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'WhatsApp', value: 'whatsapp' },
  { label: 'Other', value: 'other' },
] as const;

// ─── Lead statuses ────────────────────────────────────────────────────────────
export const LEAD_STATUSES = [
  { label: 'New', value: 'new' },
  { label: 'Contacted', value: 'contacted' },
  { label: 'Qualified', value: 'qualified' },
  { label: 'Converted', value: 'converted' },
  { label: 'Lost', value: 'lost' },
] as const;

// ─── Order statuses ───────────────────────────────────────────────────────────
export const ORDER_STATUSES = [
  { label: 'Draft', value: 'draft' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'In Production', value: 'in_production' },
  { label: 'Trial Scheduled', value: 'trial_scheduled' },
  { label: 'Trial Done', value: 'trial_done' },
  { label: 'Ready', value: 'ready' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
] as const;

// ─── Invoice statuses ─────────────────────────────────────────────────────────
export const INVOICE_STATUSES = [
  { label: 'Draft', value: 'draft' },
  { label: 'Sent', value: 'sent' },
  { label: 'Paid', value: 'paid' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Cancelled', value: 'cancelled' },
] as const;

// ─── User roles ───────────────────────────────────────────────────────────────
export const USER_ROLES = [
  { label: 'Super Admin', value: 'superadmin' },
  { label: 'Admin', value: 'admin' },
  { label: 'Staff', value: 'staff' },
  { label: 'Tailor', value: 'tailor' },
] as const;

// ─── Measurement types ────────────────────────────────────────────────────────
export const MEASUREMENT_TYPES = [
  { label: 'Suit', value: 'suit' },
  { label: 'Kurta', value: 'kurta' },
  { label: 'Lehenga', value: 'lehenga' },
  { label: 'Saree', value: 'saree' },
  { label: 'Other', value: 'other' },
] as const;

// ─── Date format ─────────────────────────────────────────────────────────────
export const DATE_FORMAT = 'dd MMM yyyy';
export const DATETIME_FORMAT = 'dd MMM yyyy, hh:mm a';

// ─── API Base ─────────────────────────────────────────────────────────────────
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';


// ─── Routes ───────────────────────────────────────────────────────────────────
export const ROUTES = {
  // Auth
  AUTH_LOGIN: '/auth/login',
  AUTH_FORGOT: '/auth/forgot-password',
  AUTH_RESET: '/auth/reset-password',

  // Dashboard
  DASHBOARD: '/',

  // CRM
  CRM_LEADS: '/crm/leads',
  CRM_CUSTOMERS: '/crm/customers',
  CRM_APPOINTMENTS: '/crm/appointments',
  CRM_FOLLOWUPS: '/crm/followups',

  // Orders
  ORDERS_QUOTATIONS: '/orders/quotations',
  ORDERS_LIST: '/orders/list',
  ORDERS_PRODUCTION: '/orders/production',
  ORDERS_TRIAL: '/orders/trial',
  ORDERS_DELIVERY: '/orders/delivery',

  // Inventory
  INVENTORY_FABRICS: '/inventory/fabrics',
  INVENTORY_ACCESSORIES: '/inventory/accessories',
  INVENTORY_SUPPLIERS: '/inventory/suppliers',
  INVENTORY_PURCHASES: '/inventory/purchases',
  INVENTORY_STOCK: '/inventory/stock',

  // Billing
  BILLING_INVOICE: '/billing/invoice',
  BILLING_PAYMENTS: '/billing/payments',
  BILLING_RECEIPTS: '/billing/receipts',

  // Staff
  STAFF_EMPLOYEES: '/staff/employees',
  STAFF_TAILORS: '/staff/tailors',
  STAFF_ATTENDANCE: '/staff/attendance',

  // Reports
  REPORTS_SALES: '/reports/sales',
  REPORTS_INVENTORY: '/reports/inventory',
  REPORTS_FINANCE: '/reports/finance',
  REPORTS_CUSTOMERS: '/reports/customers',

  // Marketing
  MARKETING_CAMPAIGNS: '/marketing/campaigns',
  MARKETING_WHATSAPP: '/marketing/whatsapp',
  MARKETING_EMAIL: '/marketing/email',
  MARKETING_SMS: '/marketing/sms',
  MARKETING_LOYALTY: '/marketing/loyalty',

  // Settings
  SETTINGS_GENERAL: '/settings/general',
  SETTINGS_COMPANY: '/settings/company',
  SETTINGS_USERS: '/settings/users',
  SETTINGS_ROLES: '/settings/roles',
  SETTINGS_PERMISSIONS: '/settings/permissions',
  SETTINGS_TAXES: '/settings/taxes',

  // Profile
  PROFILE: '/profile',
} as const;