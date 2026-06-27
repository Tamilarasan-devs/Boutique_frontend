import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  Ruler, 
  Layers, 
  ShoppingCart, 
  Factory, 
  PackageSearch, 
  Truck, 
  Receipt, 
  CreditCard, 
  UserSquare2, 
  BarChart3, 
  Megaphone, 
  Settings, 
  LogOut,
  ChevronDown,
  ChevronRight,
  Menu,
  ChevronLeft
} from 'lucide-react';

interface SidebarItem {
  title: string;
  path?: string;
  icon: React.ReactNode;
  children?: SidebarItem[];
}

const menuItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    path: '/',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    title: 'CRM',
    icon: <Users className="w-5 h-5" />,
    children: [
      { title: 'Leads', path: '/crm/leads', icon: <Users className="w-4 h-4" /> },
      { title: 'Customers', path: '/crm/customers', icon: <UserSquare2 className="w-4 h-4" /> },
      { title: 'Appointments', path: '/crm/appointments', icon: <CalendarDays className="w-4 h-4" /> },
      { title: 'Followups', path: '/crm/followups', icon: <CalendarDays className="w-4 h-4" /> },
    ]
  },
  {
    title: 'Measurements',
    icon: <Ruler className="w-5 h-5" />,
    children: [
      { title: 'Templates', path: '/measurements/templates', icon: <Ruler className="w-4 h-4" /> },
      { title: 'History', path: '/measurements/history', icon: <Ruler className="w-4 h-4" /> },
    ]
  },
  {
    title: 'Design Library',
    icon: <Layers className="w-5 h-5" />,
    children: [
      { title: 'Library', path: '/designs/library', icon: <Layers className="w-4 h-4" /> },
      { title: 'Upload', path: '/designs/upload', icon: <Layers className="w-4 h-4" /> },
    ]
  },
  {
    title: 'Orders',
    icon: <ShoppingCart className="w-5 h-5" />,
    children: [
      { title: 'Quotations', path: '/orders/quotations', icon: <ShoppingCart className="w-4 h-4" /> },
      { title: 'Orders', path: '/orders/list', icon: <ShoppingCart className="w-4 h-4" /> },
      { title: 'Production', path: '/orders/production', icon: <Factory className="w-4 h-4" /> },
      { title: 'Trial', path: '/orders/trial', icon: <ShoppingCart className="w-4 h-4" /> },
      { title: 'Delivery', path: '/orders/delivery', icon: <Truck className="w-4 h-4" /> },
    ]
  },
  {
    title: 'Inventory',
    icon: <PackageSearch className="w-5 h-5" />,
    children: [
      { title: 'Fabrics', path: '/inventory/fabrics', icon: <PackageSearch className="w-4 h-4" /> },
      { title: 'Accessories', path: '/inventory/accessories', icon: <PackageSearch className="w-4 h-4" /> },
      { title: 'Suppliers', path: '/inventory/suppliers', icon: <Truck className="w-4 h-4" /> },
      { title: 'Purchases', path: '/inventory/purchases', icon: <PackageSearch className="w-4 h-4" /> },
      { title: 'Stock', path: '/inventory/stock', icon: <PackageSearch className="w-4 h-4" /> },
    ]
  },
  {
    title: 'Billing',
    icon: <Receipt className="w-5 h-5" />,
    children: [
      { title: 'Invoice', path: '/billing/invoice', icon: <Receipt className="w-4 h-4" /> },
      { title: 'Payments', path: '/billing/payments', icon: <CreditCard className="w-4 h-4" /> },
      { title: 'Receipts', path: '/billing/receipts', icon: <Receipt className="w-4 h-4" /> },
    ]
  },
  {
    title: 'Staff',
    icon: <UserSquare2 className="w-5 h-5" />,
    children: [
      { title: 'Employees', path: '/staff/employees', icon: <UserSquare2 className="w-4 h-4" /> },
      { title: 'Tailors', path: '/staff/tailors', icon: <UserSquare2 className="w-4 h-4" /> },
      { title: 'Attendance', path: '/staff/attendance', icon: <CalendarDays className="w-4 h-4" /> },
    ]
  },
  {
    title: 'Reports',
    icon: <BarChart3 className="w-5 h-5" />,
    children: [
      { title: 'Sales', path: '/reports/sales', icon: <BarChart3 className="w-4 h-4" /> },
      { title: 'Inventory', path: '/reports/inventory', icon: <BarChart3 className="w-4 h-4" /> },
      { title: 'Finance', path: '/reports/finance', icon: <BarChart3 className="w-4 h-4" /> },
      { title: 'Customers', path: '/reports/customers', icon: <BarChart3 className="w-4 h-4" /> },
    ]
  },
  {
    title: 'Marketing',
    icon: <Megaphone className="w-5 h-5" />,
    children: [
      { title: 'Campaigns', path: '/marketing/campaigns', icon: <Megaphone className="w-4 h-4" /> },
      { title: 'Whatsapp', path: '/marketing/whatsapp', icon: <Megaphone className="w-4 h-4" /> },
      { title: 'Email', path: '/marketing/email', icon: <Megaphone className="w-4 h-4" /> },
      { title: 'SMS', path: '/marketing/sms', icon: <Megaphone className="w-4 h-4" /> },
      { title: 'Loyalty', path: '/marketing/loyalty', icon: <Megaphone className="w-4 h-4" /> },
    ]
  },
];

const bottomMenuItems: SidebarItem[] = [
  {
    title: 'Settings',
    path: '/settings',
    icon: <Settings className="w-5 h-5" />
  },
  {
    title: 'Logout',
    path: '/auth/login',
    icon: <LogOut className="w-5 h-5" />
  }
];

export interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const location = useLocation();

  const toggleMenu = (title: string) => {
    if (collapsed) {
      setCollapsed(false);
    }
    setOpenMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const isRouteActive = (path?: string, children?: SidebarItem[]) => {
    if (path && location.pathname === path) return true;
    if (children) {
      return children.some(child => child.path && location.pathname.startsWith(child.path));
    }
    return false;
  };

  const renderMenuItem = (item: SidebarItem) => {
    const isActive = isRouteActive(item.path, item.children);
    const isOpen = openMenus[item.title] || (isActive && !collapsed);

    if (item.children) {
      return (
        <div key={item.title} className="mb-1">
          <button
            onClick={() => toggleMenu(item.title)}
            className={clsx(
              "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors group",
              isActive 
                ? "bg-blue-600/10 text-blue-600" 
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <div className="flex items-center">
              <span className={clsx("flex-shrink-0", isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")}>
                {item.icon}
              </span>
              {!collapsed && (
                <span className="ml-3 text-sm font-medium">{item.title}</span>
              )}
            </div>
            {!collapsed && (
              <span className="text-slate-400">
                {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </span>
            )}
          </button>
          
          {!collapsed && isOpen && (
            <div className="mt-1 ml-4 border-l border-slate-200 pl-2 space-y-1">
              {item.children.map(child => {
                const isChildActive = child.path === location.pathname;
                return (
                  <NavLink
                    key={child.title}
                    to={child.path!}
                    className={({ isActive }) => clsx(
                      "flex items-center px-3 py-2 rounded-lg text-sm transition-colors",
                      isActive 
                        ? "bg-blue-600 text-white font-medium" 
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <span className="mr-3 opacity-70">{child.icon}</span>
                    {child.title}
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        key={item.title}
        to={item.path!}
        className={({ isActive }) => clsx(
          "flex items-center px-3 py-2.5 rounded-lg transition-colors mb-1 group",
          isActive 
            ? "bg-blue-600 text-white font-medium shadow-md shadow-blue-500/20" 
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        )}
      >
        <span className={clsx("flex-shrink-0", location.pathname === item.path ? "text-white" : "text-slate-400 group-hover:text-slate-600")}>
          {item.icon}
        </span>
        {!collapsed && <span className="ml-3 text-sm">{item.title}</span>}
      </NavLink>
    );
  };

  return (
    <aside 
      className={clsx(
        "flex flex-col bg-white border-r border-slate-200 transition-all duration-300 z-20 shadow-sm",
        collapsed ? "w-20" : "w-64",
        className
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200">
        {!collapsed && (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-lg font-bold text-slate-800 tracking-tight">Boutique CRM</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-lg">B</span>
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors absolute -right-3 bg-white border border-slate-200 shadow-sm"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
        <div className="space-y-1">
          {menuItems.map(renderMenuItem)}
        </div>
      </div>

      <div className="p-3 border-t border-slate-200 bg-slate-50">
        {bottomMenuItems.map(renderMenuItem)}
      </div>
    </aside>
  );
};

export default Sidebar;
