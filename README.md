# Boutique CRM/ERP – Frontend Architecture

> Enterprise-grade, feature-based React + TypeScript SPA scaffolded for 60–100 screens and future expansion into a multi-branch SaaS platform.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Routing | React Router v6 (lazy + Suspense) |
| State | Zustand (persist middleware) |
| Icons | Lucide React |
| Utilities | clsx, tailwind-merge |

---

## Folder Structure

```
src/
├── assets/           # fonts, icons, images, illustrations
├── components/
│   ├── common/       # ~28 atomic UI components (Button, Modal, etc.)
│   ├── layout/       # Sidebar, Navbar, Header, Breadcrumb, etc.
│   ├── dashboard/    # StatCard, ChartCard, RecentOrders, etc.
│   ├── tables/       # DataTable, LeadTable, OrderTable, etc.
│   ├── forms/        # LeadForm, CustomerForm, OrderForm, etc.
│   ├── crm/          # LeadCard, CustomerTimeline, etc.
│   ├── orders/       # OrderCard, ProductionCard, DeliveryCard, etc.
│   ├── inventory/    # StockCard, ProductCard, SupplierCard
│   ├── reports/      # ReportCard, FilterPanel, ExportButton
│   ├── charts/       # LineChart, BarChart, PieChart, AreaChart
│   └── ui/           # (free-form shared UI)
├── layouts/
│   ├── AuthLayout.tsx
│   ├── DashboardLayout.tsx  ← Sidebar + Navbar wired here
│   ├── SettingsLayout.tsx
│   └── ErrorLayout.tsx
├── pages/
│   ├── authentication/  Login · ForgotPassword · ResetPassword
│   ├── dashboard/       Dashboard
│   ├── crm/             Leads · Customers · Appointments · Followups
│   ├── orders/          Quotations · Orders · Production · Trial · Delivery
│   ├── measurements/    Templates · History
│   ├── designs/         Library · Upload
│   ├── inventory/       Fabrics · Accessories · Suppliers · Purchases · Stock
│   ├── billing/         Invoice · Payments · Receipts
│   ├── staff/           Employees · Tailors · Attendance
│   ├── reports/         Sales · Inventory · Finance · Customers
│   ├── marketing/       Campaigns · Whatsapp · Email · SMS · Loyalty
│   ├── settings/        Company · Users · Roles · Permissions · Taxes · General
│   └── profile/         Profile
├── hooks/               useDebounce · usePagination · useToggle · useSearch · …
├── services/
│   ├── api/             Base fetch client (auth-header injection)
│   ├── auth/            login · logout · me · forgotPassword
│   ├── customer/        CRUD
│   ├── order/           CRUD + updateStatus
│   ├── inventory/       CRUD + adjustStock
│   ├── payment/         invoices · recordPayment · sendInvoice
│   └── report/          salesReport · inventoryReport · financeReport · export
├── store/               Zustand stores: useAuthStore · useUIStore · useNotificationStore
├── context/             ToastProvider · ThemeProvider (+ useToast / useTheme hooks)
├── types/               Global TS interfaces: User, Lead, Customer, Order, Invoice, …
├── constants/           Routes map, status options, pagination defaults, API_BASE_URL
├── utils/               cn, formatCurrency, formatDate, getInitials, buildQueryString, …
├── validators/          required, email, phone, GST, PAN, minLength, composeValidators
├── routes/              Centralized createBrowserRouter with lazy pages + route guards
├── styles/              (for future CSS modules or global overrides)
├── data/                (for mock data during development)
├── config/              (for env-driven feature flags, runtime config)
├── App.tsx              Root: ThemeProvider → ToastProvider → RouterProvider
└── main.tsx             React DOM entry
```

---

## Routing Strategy

Routes are split into three concern areas:

| Zone | Layout | Path | Guard |
|---|---|---|---|
| Public | `AuthLayout` | `/auth/*` | Redirect if authed |
| Private | `DashboardLayout` | `/*` | Redirect if unauthed *(wire guard when auth is ready)* |
| Settings | `SettingsLayout` | `/settings/*` | Admin-only |

Every page is **lazy-loaded** via `React.lazy()` + `Suspense`, keeping the initial JS bundle minimal.

---

## Sidebar Features

- ✅ Full nested navigation (CRM → Leads, Customers, Appointments, Followups)
- ✅ Active state highlighting (parent + active child)
- ✅ Collapse mode (icon-only, toggle with chevron button)
- ✅ Auto-expands parent when a child route is active
- ✅ Lucide React icons throughout
- ✅ Smooth 300ms CSS transition on collapse
- ✅ Overflow-y scroll for tall menus

---

## Navbar Features

- ✅ Global search bar
- ✅ Quick Add button
- ✅ Language switcher placeholder
- ✅ Theme toggle (dark/light)
- ✅ Notifications panel with unread badge + dismiss
- ✅ Profile dropdown (My Profile → Settings → Support → Sign Out)

---

## State Management (Zustand)

| Store | State |
|---|---|
| `useAuthStore` | `user`, `token`, `isAuthenticated`, persisted to localStorage |
| `useUIStore` | `sidebarCollapsed`, `darkMode`, persisted |
| `useNotificationStore` | in-app notifications queue, unread count |

---

## Naming Conventions

- **Components** → `PascalCase` (e.g., `CustomerCard.tsx`)
- **Functions / hooks** → `camelCase` (e.g., `useDebounce`, `formatCurrency`)
- **Folders** → `kebab-case` or flat `camelCase`
- **Types/Interfaces** → `PascalCase` (e.g., `interface Order {}`)
- **Constants** → `SCREAMING_SNAKE_CASE` (e.g., `API_BASE_URL`)

---

## Running the Project

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Lint
npm run lint
```

---

## Future Expansion

The architecture is designed to accommodate:
- **Multi-branch SaaS**: branch field already present on `User` type; API can be parameterized per-branch.
- **Micro-frontends**: feature modules (CRM, Orders, Inventory) are fully self-contained and can be extracted.
- **Role-based access control**: `USER_ROLES` constant + `user.role` ready; wire route guards and component-level checks.
- **Dark mode**: `ThemeProvider` toggles `dark` class on `<html>`; Tailwind dark-variant classes can be added component-by-component.
- **Internationalisation**: language button in Navbar is ready for `react-i18next` integration.
