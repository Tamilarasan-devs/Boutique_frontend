import React, { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Layouts
const AuthLayout = lazy(() => import('../layouts/AuthLayout'));
const DashboardLayout = lazy(() => import('../layouts/DashboardLayout'));
const SettingsLayout = lazy(() => import('../layouts/SettingsLayout'));
const ErrorLayout = lazy(() => import('../layouts/ErrorLayout'));

// Auth Pages
const Login = lazy(() => import('../pages/authentication/Login'));
const Register = lazy(() => import('../pages/authentication/Register'));
const ForgotPassword = lazy(() => import('../pages/authentication/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/authentication/ResetPassword'));

// Dashboard
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));

// CRM Pages
const Leads = lazy(() => import('../pages/crm/leads/Leads'));
const Appointments = lazy(() => import('../pages/crm/appointments/Appointments'));
const Followups = lazy(() => import('../pages/crm/followups/Followups'));

// Orders Pages
const Quotations = lazy(() => import('../pages/orders/quotations/Quotations'));
const Orders = lazy(() => import('../pages/orders/orders/Orders'));
const Production = lazy(() => import('../pages/orders/production/Production'));
const Trial = lazy(() => import('../pages/orders/trial/Trial'));
const Delivery = lazy(() => import('../pages/orders/delivery/Delivery'));

// Measurements
const Measurements = lazy(() => import('../pages/measurements/Measurements'));

// Designs
const Library = lazy(() => import('../pages/designs/library/Library'));
const Upload = lazy(() => import('../pages/designs/upload/Upload'));

// Inventory
const Fabrics = lazy(() => import('../pages/inventory/fabrics/Fabrics'));
const Accessories = lazy(() => import('../pages/inventory/accessories/Accessories'));
const Suppliers = lazy(() => import('../pages/inventory/suppliers/Suppliers'));
const Purchases = lazy(() => import('../pages/inventory/purchases/Purchases'));
const Stock = lazy(() => import('../pages/inventory/stock/Stock'));

// Billing
const Invoice = lazy(() => import('../pages/billing/invoice/Invoice'));
const Payments = lazy(() => import('../pages/billing/payments/Payments'));
const Pricing = lazy(() => import('../pages/billing/Pricing'));

// Staff
const Employees = lazy(() => import('../pages/staff/employees/Employees'));
const Tailors = lazy(() => import('../pages/staff/tailors/Tailors'));
const Attendance = lazy(() => import('../pages/staff/attendance/Attendance'));

// Marketing
const Campaigns = lazy(() => import('../pages/marketing/campaigns/Campaigns'));
const Whatsapp = lazy(() => import('../pages/marketing/whatsapp/Whatsapp'));
const Email = lazy(() => import('../pages/marketing/email/Email'));
const Sms = lazy(() => import('../pages/marketing/sms/Sms'));
const Loyalty = lazy(() => import('../pages/marketing/loyalty/Loyalty'));

// Settings
const CompanySettings = lazy(() => import('../pages/settings/company/CompanySettings'));
const UsersSettings = lazy(() => import('../pages/settings/users/UsersSettings'));
const RolesSettings = lazy(() => import('../pages/settings/roles/RolesSettings'));
const PermissionsSettings = lazy(() => import('../pages/settings/permissions/PermissionsSettings'));
const TaxesSettings = lazy(() => import('../pages/settings/taxes/TaxesSettings'));
const LoyaltySettings = lazy(() => import('../pages/settings/loyalty/LoyaltySettings'));

const Profile = lazy(() => import('../pages/profile/Profile'));

// Helper: wrap element in ProtectedRoute
const P = (element: React.ReactElement) => (
  <ProtectedRoute>{element}</ProtectedRoute>
);

export const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
      { path: 'reset-password', element: <ResetPassword /> },
      { index: true, element: <Navigate to="login" replace /> }
    ]
  },
  {
    path: '/',
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Dashboard /> },

      // CRM
      { path: 'crm/leads', element: <Leads /> },
      { path: 'crm/appointments', element: <Appointments /> },
      { path: 'crm/followups', element: <Followups /> },

      // Orders
      { path: 'orders/quotations', element: <Quotations /> },
      { path: 'orders/list', element: <Orders /> },
      { path: 'orders/production', element: <Production /> },
      { path: 'orders/trial', element: <Trial /> },
      { path: 'orders/delivery', element: <Delivery /> },

      // Measurements
      { path: 'measurements', element: <Measurements /> },

      // Designs
      { path: 'designs/library', element: <Library /> },
      { path: 'designs/upload', element: <Upload /> },

      // Inventory
      { path: 'inventory/fabrics', element: <Fabrics /> },
      { path: 'inventory/accessories', element: <Accessories /> },
      { path: 'inventory/suppliers', element: <Suppliers /> },
      { path: 'inventory/purchases', element: <Purchases /> },
      { path: 'inventory/stock', element: <Stock /> },

      // Billing
      { path: 'billing/invoice', element: <Invoice /> },
      { path: 'billing/payments', element: <Payments /> },
      { path: 'billing/pricing', element: P(<Pricing />) },

      // Staff (owner/manager only)
      { path: 'staff/employees', element: P(<Employees />) },
      { path: 'staff/tailors', element: P(<Tailors />) },
      { path: 'staff/attendance', element: P(<Attendance />) },

      // Marketing
      { path: 'marketing/campaigns', element: <Campaigns /> },
      { path: 'marketing/whatsapp', element: <Whatsapp /> },
      { path: 'marketing/email', element: <Email /> },
      { path: 'marketing/sms', element: <Sms /> },
      { path: 'marketing/loyalty', element: <Loyalty /> },

      // Profile
      { path: 'profile', element: <Profile /> },
    ]
  },
  {
    path: '/settings',
    element: <ProtectedRoute allowedRoles={['owner']}><SettingsLayout /></ProtectedRoute>,
    children: [
      { path: 'company', element: <CompanySettings /> },
      { path: 'users', element: <UsersSettings /> },
      { path: 'roles', element: <RolesSettings /> },
      { path: 'permissions', element: <PermissionsSettings /> },
      { path: 'taxes', element: <TaxesSettings /> },
      { path: 'loyalty', element: <LoyaltySettings /> },
      { index: true, element: <Navigate to="company" replace /> }
    ]
  },
  {
    path: '*',
    element: <ErrorLayout />
  }
]);
