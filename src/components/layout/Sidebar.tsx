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
  LayoutTemplate,
  Menu
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
      { title: 'Order Tracking', path: '/orders/track', icon: <PackageSearch className="w-4 h-4" /> },
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
  const { navMode, toggleNavMode, sidebarCollapsed, toggleSidebar } = useUIStore();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (title: string) => {
    if (sidebarCollapsed) {
      toggleSidebar();
    }
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
          "fixed top-0 left-0 z-50 h-full bg-[#16132D] border-r border-white/[0.08] shadow-2xl transition-all duration-300 flex flex-col overflow-hidden text-white",
          sidebarCollapsed ? "w-20" : "w-72",
          navMode === 'sidebar' ? "md:static md:translate-x-0" : "md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className={clsx("flex items-center py-5 border-b border-white/[0.06]", sidebarCollapsed ? "justify-center px-0" : "justify-between px-6")}>
          {!sidebarCollapsed && <h2 className="text-xl font-serif font-bold text-white whitespace-nowrap tracking-wide">Aadai Plus</h2>}
          <div className="flex items-center gap-2">
            <button onClick={onMobileClose} className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white md:hidden transition-colors">
              <X className="w-5 h-5" />
            </button>
            <button onClick={toggleSidebar} className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white hidden md:block transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-1">
          {allowedItems.map((item, idx) => (
            <div key={idx}>
              {item.path ? (
                <NavLink
                  to={item.path}
                  onClick={onMobileClose}
                  title={sidebarCollapsed ? item.title : undefined}
                  className={({ isActive }) => clsx(
                    "flex items-center gap-3 px-3 py-3 rounded-xl transition-all cursor-pointer font-medium",
                    isActive ? "bg-[#7209B7] text-white shadow-lg shadow-[#7209B7]/30" : "text-white/60 hover:text-white hover:bg-white/10",
                    sidebarCollapsed && "justify-center"
                  )}
                >
                  <div className={clsx("shrink-0", "transition-transform duration-200")}>{item.icon}</div>
                  {!sidebarCollapsed && <span className="whitespace-nowrap truncate">{item.title}</span>}
                </NavLink>
              ) : (
                <>
                  <button
                    onClick={() => toggleMenu(item.title)}
                    title={sidebarCollapsed ? item.title : undefined}
                    className={clsx(
                      "w-full flex items-center px-3 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all font-medium",
                      sidebarCollapsed ? "justify-center" : "justify-between"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="shrink-0">{item.icon}</div>
                      {!sidebarCollapsed && <span className="whitespace-nowrap truncate">{item.title}</span>}
                    </div>
                    {!sidebarCollapsed && (
                      <ChevronDown className={clsx("w-4 h-4 shrink-0 transition-transform text-white/40 group-hover:text-white/80", expandedMenus[item.title] && "rotate-180")} />
                    )}
                  </button>
                  {expandedMenus[item.title] && item.children && !sidebarCollapsed && (
                    <div className="ml-11 mt-1 space-y-1 border-l-2 border-white/10 pl-4 py-1">
                      {item.children.map(child => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          onClick={onMobileClose}
                          className={({ isActive }) => clsx(
                            "flex items-center gap-3 py-2 px-3 rounded-lg transition-colors text-sm",
                            isActive ? "text-white font-bold bg-white/10" : "text-white/50 hover:text-white hover:bg-white/5"
                          )}
                        >
                          <span className="whitespace-nowrap truncate">{child.title}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        <div className={clsx("p-3 border-t border-white/[0.06] space-y-2", sidebarCollapsed ? "flex flex-col items-center" : "")}>
          <button
            onClick={toggleNavMode}
            title={sidebarCollapsed ? "Switch to Bottom Bar" : undefined}
            className={clsx(
              "w-full flex items-center rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors font-medium hidden md:flex",
              sidebarCollapsed ? "justify-center p-3" : "gap-3 px-4 py-3"
            )}
          >
            <LayoutTemplate className="w-5 h-5 shrink-0" />
            {!sidebarCollapsed && <span className="whitespace-nowrap truncate">Switch to Bottom Bar</span>}
          </button>
          <button
            onClick={handleLogout}
            title={sidebarCollapsed ? "Logout" : undefined}
            className={clsx(
              "w-full flex items-center rounded-xl text-rose-400 hover:text-white hover:bg-rose-500/80 transition-colors font-medium",
              sidebarCollapsed ? "justify-center p-3" : "gap-3 px-4 py-3"
            )}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
