import fs from 'fs';
import path from 'path';

const basePath = path.join(process.cwd(), 'src');

const structure = {
  'assets/fonts': [],
  'assets/icons': [],
  'assets/images': [],
  'assets/illustrations': [],
  'components/common': ['Button', 'Input', 'Select', 'Checkbox', 'Radio', 'Switch', 'Textarea', 'Badge', 'Avatar', 'Tooltip', 'Popover', 'Dropdown', 'Accordion', 'Tabs', 'Modal', 'Drawer', 'Alert', 'Toast', 'Skeleton', 'Loader', 'Pagination', 'SearchBar', 'DatePicker', 'FileUpload', 'ImageUploader', 'EmptyState', 'ErrorState', 'ConfirmDialog'],
  'components/layout': ['Sidebar', 'Navbar', 'Header', 'Footer', 'Topbar', 'PageContainer', 'ContentWrapper', 'Breadcrumb', 'NotificationPanel', 'ProfileMenu'],
  'components/dashboard': ['StatCard', 'RevenueCard', 'SalesCard', 'ChartCard', 'RecentOrders', 'UpcomingDelivery', 'TaskCard', 'QuickActions'],
  'components/tables': ['DataTable', 'LeadTable', 'CustomerTable', 'OrderTable', 'InventoryTable', 'PaymentTable'],
  'components/forms': ['LeadForm', 'CustomerForm', 'MeasurementForm', 'QuotationForm', 'OrderForm', 'PaymentForm', 'SupplierForm', 'InventoryForm'],
  'components/crm': ['LeadCard', 'CustomerCard', 'CustomerTimeline', 'ActivityTimeline', 'FollowupCard'],
  'components/orders': ['OrderCard', 'ProductionCard', 'DeliveryCard', 'TrialCard'],
  'components/inventory': ['StockCard', 'ProductCard', 'SupplierCard'],
  'components/reports': ['ReportCard', 'FilterPanel', 'ExportButton'],
  'components/charts': ['LineChart', 'BarChart', 'PieChart', 'AreaChart'],
  'components/ui': [],
  'layouts': ['AuthLayout', 'DashboardLayout', 'SettingsLayout', 'ErrorLayout'],
  'pages/authentication': ['Login', 'ForgotPassword', 'ResetPassword'],
  'pages/dashboard': ['Dashboard'],
  'pages/crm/leads': ['Leads'],
  'pages/crm/customers': ['Customers'],
  'pages/crm/appointments': ['Appointments'],
  'pages/crm/followups': ['Followups'],
  'pages/orders/quotations': ['Quotations'],
  'pages/orders/orders': ['Orders'],
  'pages/orders/production': ['Production'],
  'pages/orders/trial': ['Trial'],
  'pages/orders/delivery': ['Delivery'],
  'pages/measurements/templates': ['Templates'],
  'pages/measurements/history': ['History'],
  'pages/designs/library': ['Library'],
  'pages/designs/upload': ['Upload'],
  'pages/inventory/fabrics': ['Fabrics'],
  'pages/inventory/accessories': ['Accessories'],
  'pages/inventory/suppliers': ['Suppliers'],
  'pages/inventory/purchases': ['Purchases'],
  'pages/inventory/stock': ['Stock'],
  'pages/billing/invoice': ['Invoice'],
  'pages/billing/payments': ['Payments'],
  'pages/billing/receipts': ['Receipts'],
  'pages/staff/employees': ['Employees'],
  'pages/staff/tailors': ['Tailors'],
  'pages/staff/attendance': ['Attendance'],
  'pages/reports/sales': ['SalesReport'],
  'pages/reports/inventory': ['InventoryReport'],
  'pages/reports/finance': ['FinanceReport'],
  'pages/reports/customers': ['CustomersReport'],
  'pages/marketing/campaigns': ['Campaigns'],
  'pages/marketing/whatsapp': ['Whatsapp'],
  'pages/marketing/email': ['Email'],
  'pages/marketing/sms': ['Sms'],
  'pages/marketing/loyalty': ['Loyalty'],
  'pages/settings/company': ['CompanySettings'],
  'pages/settings/users': ['UsersSettings'],
  'pages/settings/roles': ['RolesSettings'],
  'pages/settings/permissions': ['PermissionsSettings'],
  'pages/settings/taxes': ['TaxesSettings'],
  'pages/settings/general': ['GeneralSettings'],
  'pages/profile': ['Profile'],
  'hooks': [],
  'services/api': [],
  'services/auth': [],
  'services/customer': [],
  'services/order': [],
  'services/inventory': [],
  'services/payment': [],
  'services/report': [],
  'store': [],
  'context': [],
  'types': [],
  'constants': [],
  'utils': [],
  'validators': [],
  'routes': [],
  'styles': [],
  'data': [],
  'config': []
};

const tplComp = fs.readFileSync('template-component.txt', 'utf8');
const tplPage = fs.readFileSync('template-page.txt', 'utf8');
const tplLayout = fs.readFileSync('template-layout.txt', 'utf8');

function ensureDirSync(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function createIndexFile(dirPath, exportsList) {
  const indexPath = path.join(dirPath, 'index.ts');
  if (exportsList && exportsList.length > 0) {
    const content = exportsList.map(name => "export { default as " + name + " } from './" + name + "';").join('\\n') + '\\n';
    fs.writeFileSync(indexPath, content);
  } else {
    if (!fs.existsSync(indexPath)) {
      fs.writeFileSync(indexPath, '// Root export file\\n');
    }
  }
}

function createFile(dirPath, name, template) {
  const tsxPath = path.join(dirPath, name + ".tsx");
  const content = template.replace(/__NAME__/g, name);
  fs.writeFileSync(tsxPath, content);
}

Object.keys(structure).forEach(dir => {
  const dirPath = path.join(basePath, dir);
  ensureDirSync(dirPath);
  
  const items = structure[dir];
  if (items.length > 0) {
    if (dir.startsWith('components/')) {
      items.forEach(item => createFile(dirPath, item, tplComp));
    } else if (dir.startsWith('pages/')) {
      items.forEach(item => createFile(dirPath, item, tplPage));
    } else if (dir.startsWith('layouts')) {
      items.forEach(item => createFile(dirPath, item, tplLayout));
    }
    createIndexFile(dirPath, items);
  } else {
    createIndexFile(dirPath, []);
  }
});

console.log('Project structure generated successfully.');
