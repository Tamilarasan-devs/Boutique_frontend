import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Ruler,
  ShoppingCart,
  Factory,
  PackageSearch,
  Truck,
  Receipt,
  CreditCard,
  UserSquare2,
  Megaphone,
  Settings,
  X,
  LogOut,
  ChevronDown,
  LayoutTemplate
} from 'lucide-react';
import { useAuth, MODULE_ROUTES } from '../../context/AuthContext';
import { useUIStore } from '../../store';

interface SidebarItem {
  title: string;
  path?: string;
  icon: React.ReactNode;
  children?: { title: string; path: string; icon: React.ReactNode; }[];
}

const menuItems: SidebarItem[] = [
  { title: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-5 h-5" /> },
  {
    title: 'CRM', icon: <Users className="w-5 h-5" />,
    children: [
      { title: 'Leads', path: '/crm/leads', icon: <Users className="w-4 h-4" /> },
      { title: 'Followups', path: '/crm/followups', icon: <CalendarDays className="w-4 h-4" /> },
    ]
  },
  {
    title: 'Orders', icon: <ShoppingCart className="w-5 h-5" />,
    children: [
      { title: 'Quotations', path: '/orders/quotations', icon: <ShoppingCart className="w-4 h-4" /> },
      { title: 'Measurements', path: '/measurements', icon: <Ruler className="w-4 h-4" /> },
      { title: 'Orders', path: '/orders/list', icon: <ShoppingCart className="w-4 h-4" /> },
      { title: 'Production', path: '/orders/production', icon: <Factory className="w-4 h-4" /> },
      { title: 'Delivery', path: '/orders/delivery', icon: <Truck className="w-4 h-4" /> },
    ]
  },
  {
    title: 'Inventory', icon: <PackageSearch className="w-5 h-5" />,
    children: [
      { title: 'Fabrics', path: '/inventory/fabrics', icon: <PackageSearch className="w-4 h-4" /> },
      { title: 'Accessories', path: '/inventory/accessories', icon: <PackageSearch className="w-4 h-4" /> },
      { title: 'Suppliers', path: '/inventory/suppliers', icon: <Truck className="w-4 h-4" /> },
      { title: 'Purchases', path: '/inventory/purchases', icon: <PackageSearch className="w-4 h-4" /> },
    ]
  },
  {
    title: 'Billing', icon: <Receipt className="w-5 h-5" />,
    children: [
      { title: 'Invoices', path: '/billing/invoice', icon: <Receipt className="w-4 h-4" /> },
      { title: 'Payments', path: '/billing/payments', icon: <CreditCard className="w-4 h-4" /> },
    ]
  },
  {
    title: 'Staff', icon: <UserSquare2 className="w-5 h-5" />,
    children: [
      { title: 'Employees', path: '/staff/employees', icon: <UserSquare2 className="w-4 h-4" /> },
      { title: 'Attendance', path: '/staff/attendance', icon: <CalendarDays className="w-4 h-4" /> },
    ]
  },
  {
    title: 'Marketing', icon: <Megaphone className="w-5 h-5" />,
    children: [
      { title: 'Customers', path: '/marketing/customers', icon: <Users className="w-4 h-4" /> },
      { title: 'Campaigns', path: '/marketing/campaigns', icon: <Megaphone className="w-4 h-4" /> },
      { title: 'Whatsapp', path: '/marketing/whatsapp', icon: <Megaphone className="w-4 h-4" /> },
      { title: 'Email', path: '/marketing/email', icon: <Megaphone className="w-4 h-4" /> },
    ]
  },
  {
    title: 'Products', icon: <PackageSearch className="w-5 h-5" />,
    children: [
      { title: 'Product Upload', path: '/products/upload', icon: <PackageSearch className="w-4 h-4" /> },
      { title: 'Product List', path: '/products/list', icon: <PackageSearch className="w-4 h-4" /> },
      { title: 'POS Billing', path: '/billing/pos', icon: <ShoppingCart className="w-4 h-4" /> },
      { title: 'Bill List', path: '/billing/product-bills', icon: <Receipt className="w-4 h-4" /> },
    ]
  },
  {
    title: 'Admin', icon: <Settings className="w-5 h-5" />,
    children: [
      { title: 'Settings', path: '/settings', icon: <Settings className="w-4 h-4" /> }
    ]
  }
];

export interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onMobileClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { navMode, toggleNavMode } = useUIStore();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (title: string) => {
    setExpandedMenus(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/login', { replace: true });
  };

  const permissions = user?.permissions || {};
  const isPathAllowed = (path?: string) => {
    if (!path) return true;
    if (user?.role === 'owner') return true;
    for (const [moduleName, accessLevel] of Object.entries(permissions)) {
      if (accessLevel === 'None') continue;
      const routes = MODULE_ROUTES[moduleName] || [];
      const matches = routes.some(r => path === r || path.startsWith(r + '/') || r.startsWith(path));
      if (matches) return true;
    }
    return false;
  };

  const allowedItems = menuItems.filter(item => {
    if (item.path) return isPathAllowed(item.path);
    if (item.children) {
      item.children = item.children.filter(child => isPathAllowed(child.path));
      return item.children.length > 0;
    }
    return false;
  });

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar Drawer */}
      <aside 
        className={clsx(
          "fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-[#16132D]/[0.08] shadow-2xl transition-transform duration-300 flex flex-col",
          navMode === 'sidebar' ? "md:static md:translate-x-0" : "md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#16132D]/[0.06]">
          <h2 className="text-xl font-serif font-bold text-[#16132D]">Atelier</h2>
          <button onClick={onMobileClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
          {allowedItems.map((item, idx) => (
            <div key={idx}>
              {item.path ? (
                <NavLink
                  to={item.path}
                  onClick={onMobileClose}
                  className={({ isActive }) => clsx(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-medium",
                    isActive ? "bg-[#7209B7]/10 text-[#7209B7]" : "text-[#16132D]/70 hover:bg-[#F4F3F8]"
                  )}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </NavLink>
              ) : (
                <>
                  <button
                    onClick={() => toggleMenu(item.title)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-[#16132D]/70 hover:bg-[#F4F3F8] transition-all font-medium"
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.title}</span>
                    </div>
                    <ChevronDown className={clsx("w-4 h-4 transition-transform", expandedMenus[item.title] && "rotate-180")} />
                  </button>
                  {expandedMenus[item.title] && item.children && (
                    <div className="ml-11 mt-1 space-y-1 border-l-2 border-slate-100 pl-4 py-1">
                      {item.children.map(child => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          onClick={onMobileClose}
                          className={({ isActive }) => clsx(
                            "flex items-center gap-3 py-2 px-3 rounded-lg transition-colors text-sm",
                            isActive ? "text-[#7209B7] font-semibold bg-[#7209B7]/5" : "text-[#16132D]/60 hover:text-[#16132D]"
                          )}
                        >
                          {child.title}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-[#16132D]/[0.06] space-y-2">
          <button
            onClick={toggleNavMode}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-[#7209B7] hover:bg-[#7209B7]/5 transition-colors font-medium hidden md:flex"
          >
            <LayoutTemplate className="w-5 h-5" />
            <span>Switch to Bottom Bar</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500/80 hover:text-red-500 hover:bg-red-50 transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
