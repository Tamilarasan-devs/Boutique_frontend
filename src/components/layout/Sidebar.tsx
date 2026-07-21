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
  Menu,
  Sparkles
} from 'lucide-react';
import { useAuth, MODULE_ROUTES } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useUIStore } from '../../store';
import logo from '../../assets/logo1.png';

interface SidebarItem {
  title: string;
  path?: string;
  icon: React.ReactNode;
  children?: { title: string; path: string; icon: React.ReactNode; }[];
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

const menuSections: SidebarSection[] = [
  {
    title: 'MAIN',
    items: [
      { title: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-5 h-5" /> },
    ]
  },
  {
    title: 'BUSINESS',
    items: [
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
        title: 'Products', icon: <PackageSearch className="w-5 h-5" />,
        children: [
          { title: 'Product Upload', path: '/products/upload', icon: <PackageSearch className="w-4 h-4" /> },
          { title: 'Product List', path: '/products/list', icon: <PackageSearch className="w-4 h-4" /> },
          { title: 'POS Billing', path: '/billing/pos', icon: <ShoppingCart className="w-4 h-4" /> },
          { title: 'Bill List', path: '/billing/product-bills', icon: <Receipt className="w-4 h-4" /> },
        ]
      },
    ]
  },
  {
    title: 'OPERATIONS',
    items: [
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
    ]
  },
  {
    title: 'SYSTEM',
    items: [
      {
        title: 'Admin', icon: <Settings className="w-5 h-5" />,
        children: [
          { title: 'Settings', path: '/settings', icon: <Settings className="w-4 h-4" /> }
        ]
      }
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
  const { companySettings } = useSettings();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const displayLogo = companySettings?.logo_url || companySettings?.logoUrl || logo;
  const companyName = companySettings?.name || 'Aadai Plus';

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

  const allowedSections = menuSections.map(section => {
    const items = section.items.map(item => {
      if (item.path) {
        return isPathAllowed(item.path) ? item : null;
      }
      if (item.children) {
        const allowedChildren = item.children.filter(child => isPathAllowed(child.path));
        return allowedChildren.length > 0 ? { ...item, children: allowedChildren } : null;
      }
      return null;
    }).filter(Boolean) as SidebarItem[];
    
    return { ...section, items };
  }).filter(section => section.items.length > 0);

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
          "fixed top-0 left-0 z-50 h-full bg-gradient-to-b from-[var(--primary-hex)] to-slate-900 border-r border-[var(--accent-hex)]/10 shadow-2xl transition-all duration-300 flex flex-col overflow-hidden text-white relative",
          sidebarCollapsed ? "w-20" : "w-72",
          navMode === 'sidebar' ? "md:static md:translate-x-0" : "md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Subtle glow effect */}
        <div className="absolute top-0 left-0 w-full h-48 bg-white/[0.02] blur-3xl rounded-full pointer-events-none" />

        {/* Header */}
        <div className={clsx("flex items-center py-6 border-b border-white/5 bg-white/5 backdrop-blur-md relative z-10", sidebarCollapsed ? "justify-center px-0" : "justify-between px-6")}>
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white rounded-xl shadow-sm shrink-0">
                <img src={displayLogo} alt="Logo" className="w-8 h-8 object-cover rounded-lg" />
              </div>
              <div className="flex flex-col min-w-0">
                <h2 className="text-[17px] font-bold text-white tracking-wide leading-none truncate">{companyName}</h2>
                <span className="text-[10px] uppercase tracking-widest text-[var(--accent-hex)] font-semibold mt-1">Workspace</span>
              </div>
            </div>
          ) : (
            <div className="p-1.5 bg-white rounded-xl shadow-sm">
              <img src={displayLogo} alt="Logo" className="w-8 h-8 object-cover rounded-lg" />
            </div>
          )}
          
          {!sidebarCollapsed && (
            <div className="flex items-center gap-1">
              <button onClick={onMobileClose} className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white md:hidden transition-colors">
                <X className="w-4 h-4" />
              </button>
              <button onClick={toggleSidebar} className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white hidden md:block transition-colors">
                <Menu className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-4 space-y-6 scrollbar-hide relative z-10">
          {allowedSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-3 mb-2 flex items-center gap-2">
                  <span className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-white/40">{section.title}</span>
                </div>
              )}
              {section.items.map((item, idx) => (
                <div key={idx}>
                  {item.path ? (
                    <NavLink
                      to={item.path}
                      onClick={onMobileClose}
                      title={sidebarCollapsed ? item.title : undefined}
                      className={({ isActive }) => clsx(
                        "flex items-center gap-3 px-3 py-3 rounded-xl transition-all cursor-pointer font-semibold group relative overflow-hidden",
                        isActive ? "bg-[var(--accent-hex)] text-[var(--primary-hex)] shadow-lg shadow-[var(--accent-hex)]/20" : "text-white/70 hover:text-white hover:bg-white/10",
                        sidebarCollapsed && "justify-center"
                      )}
                    >
                      <div className={clsx("shrink-0 transition-transform duration-300 group-hover:scale-110")}>{item.icon}</div>
                      {!sidebarCollapsed && <span className="whitespace-nowrap truncate">{item.title}</span>}
                    </NavLink>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleMenu(item.title)}
                        title={sidebarCollapsed ? item.title : undefined}
                        className={clsx(
                          "w-full flex items-center px-3 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all font-semibold group",
                          sidebarCollapsed ? "justify-center" : "justify-between"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="shrink-0 transition-transform duration-300 group-hover:scale-110">{item.icon}</div>
                          {!sidebarCollapsed && <span className="whitespace-nowrap truncate">{item.title}</span>}
                        </div>
                        {!sidebarCollapsed && (
                          <ChevronDown className={clsx("w-4 h-4 shrink-0 transition-transform text-white/40 group-hover:text-white", expandedMenus[item.title] && "rotate-180")} />
                        )}
                      </button>
                      {expandedMenus[item.title] && item.children && !sidebarCollapsed && (
                        <div className="ml-11 mt-1 mb-2 space-y-1 border-l border-white/10 pl-4 py-1">
                          {item.children.map(child => (
                            <NavLink
                              key={child.path}
                              to={child.path}
                              onClick={onMobileClose}
                              className={({ isActive }) => clsx(
                                "flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors text-sm font-medium",
                                isActive ? "text-[var(--accent-hex)] font-bold bg-[var(--accent-hex)]/10" : "text-white/50 hover:text-white hover:bg-white/5"
                              )}
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
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
          ))}
        </div>

        {/* User Profile Footer */}
        <div className="border-t border-white/5 bg-black/20 p-4 relative z-10">
          {!sidebarCollapsed && user && (
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--accent-hex)] to-white flex items-center justify-center shadow-inner shrink-0">
                <span className="text-[var(--primary-hex)] font-bold text-sm">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-white truncate">{user.name}</span>
                <span className="text-[10px] uppercase tracking-wider text-white/50 truncate">{user.role}</span>
              </div>
            </div>
          )}

          <div className={clsx("flex gap-2", sidebarCollapsed ? "flex-col" : "")}>
            <button
              onClick={toggleNavMode}
              title={sidebarCollapsed ? "Switch to Bottom Bar" : undefined}
              className={clsx(
                "flex-1 flex items-center justify-center rounded-xl text-white/60 hover:text-[var(--accent-hex)] hover:bg-[var(--accent-hex)]/10 transition-colors font-medium hidden md:flex",
                sidebarCollapsed ? "p-3" : "py-2.5 px-2 gap-2"
              )}
            >
              <LayoutTemplate className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && <span className="text-xs">Bottom Bar</span>}
            </button>
            <button
              onClick={handleLogout}
              title={sidebarCollapsed ? "Logout" : undefined}
              className={clsx(
                "flex-1 flex items-center justify-center rounded-xl text-rose-400/80 hover:text-white hover:bg-rose-500 transition-colors font-medium",
                sidebarCollapsed ? "p-3" : "py-2.5 px-2 gap-2"
              )}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && <span className="text-xs">Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
