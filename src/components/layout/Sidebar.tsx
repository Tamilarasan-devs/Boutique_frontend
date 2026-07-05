import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
  ChevronLeft,
  X,
  Crown,
  Scissors,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_PAGES } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

interface SidebarItem {
  title: string;
  path?: string;
  icon: React.ReactNode;
  children?: SidebarItem[];
  category?: string;
  items?: SidebarItem[];
}

const menuItems: SidebarItem[] = [
  { title: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-5 h-5" /> },
  {
    title: 'CRM', icon: <Users className="w-5 h-5" />,
    children: [
      { title: 'Leads', path: '/crm/leads', icon: <Users className="w-4 h-4" /> },
      { title: 'Customers', path: '/crm/customers', icon: <UserSquare2 className="w-4 h-4" /> },
      { title: 'Appointments', path: '/crm/appointments', icon: <CalendarDays className="w-4 h-4" /> },
      { title: 'Followups', path: '/crm/followups', icon: <CalendarDays className="w-4 h-4" /> },
    ]
  },
  {
    title: 'Measurements', path: '/measurements', icon: <Ruler className="w-5 h-5" />,
  },
  // {
  //   title: 'Design Library', icon: <Layers className="w-5 h-5" />,
  //   children: [
  //     { title: 'Library', path: '/designs/library', icon: <Layers className="w-4 h-4" /> },
  //     { title: 'Upload', path: '/designs/upload', icon: <Layers className="w-4 h-4" /> },
  //   ]
  // },
  {
    title: 'Orders', icon: <ShoppingCart className="w-5 h-5" />,
    children: [
      { title: 'Quotations', path: '/orders/quotations', icon: <ShoppingCart className="w-4 h-4" /> },
      { title: 'Orders', path: '/orders/list', icon: <ShoppingCart className="w-4 h-4" /> },
      { title: 'Production', path: '/orders/production', icon: <Factory className="w-4 h-4" /> },
      // { title: 'Trial', path: '/orders/trial', icon: <ShoppingCart className="w-4 h-4" /> },
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
      // { title: 'Stock', path: '/inventory/stock', icon: <PackageSearch className="w-4 h-4" /> },
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
      // { title: 'Tailors', path: '/staff/tailors', icon: <UserSquare2 className="w-4 h-4" /> },
      { title: 'Attendance', path: '/staff/attendance', icon: <CalendarDays className="w-4 h-4" /> },
    ]
  },
  {
    title: 'Marketing', icon: <Megaphone className="w-5 h-5" />,
    children: [
      { title: 'Campaigns', path: '/marketing/campaigns', icon: <Megaphone className="w-4 h-4" /> },
      { title: 'Whatsapp', path: '/marketing/whatsapp', icon: <Megaphone className="w-4 h-4" /> },
      { title: 'Email', path: '/marketing/email', icon: <Megaphone className="w-4 h-4" /> },
      // { title: 'SMS', path: '/marketing/sms', icon: <Megaphone className="w-4 h-4" /> },
      { title: 'Loyalty', path: '/marketing/loyalty', icon: <Megaphone className="w-4 h-4" /> },
    ]
  },
  {
    title: 'Admin',
    icon: <Settings className="w-5 h-5" />,
    children: [
      { title: 'Billing & Plan', path: '/billing/pricing', icon: <CreditCard className="w-4 h-4" /> },
      { title: 'Settings', path: '/settings', icon: <Settings className="w-4 h-4" /> }
    ]
  }
];

const bottomMenuItems: SidebarItem[] = [];

// Role display config
const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  manager: 'Manager',
  sales_staff: 'Sales Staff',
  tailor: 'Tailor',
  receptionist: 'Receptionist',
};

export interface SidebarProps {
  className?: string;
  /** Mobile: whether the overlay drawer is visible */
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  collapsed?: boolean;
  onCollapseToggle?: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  className, 
  mobileOpen, 
  onMobileClose, 
  collapsed: controlledCollapsed,
  onCollapseToggle 
}) => {
  const { user, logout } = useAuth();
  const { companySettings } = useSettings();
  const navigate = useNavigate();
  const [localCollapsed, setLocalCollapsed] = useState(false);
  const collapsed = controlledCollapsed !== undefined ? controlledCollapsed : localCollapsed;
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/auth/login', { replace: true });
  };

  // Filter menu items based on the current user's role
  const allowedPaths = user ? ROLE_PAGES[user.role] || [] : [];
  const isPathAllowed = (path?: string) => {
    if (!path) return true;
    if (allowedPaths.includes('*')) return true;
    return allowedPaths.some(p => path === p || path.startsWith(p + '/') || p.startsWith(path));
  };

  const filteredMenuItems = menuItems
    .map(item => {
      if (item.children) {
        const visibleChildren = item.children.filter(c => isPathAllowed(c.path));
        if (visibleChildren.length === 0) return null;
        return { ...item, children: visibleChildren };
      }
      return isPathAllowed(item.path) ? item : null;
    })
    .filter(Boolean) as SidebarItem[];

  const toggleMenu = (title: string) => {
    if (collapsed) {
      if (onCollapseToggle) {
        onCollapseToggle(false);
      } else {
        setLocalCollapsed(false);
      }
    }
    setOpenMenus(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const isRouteActive = (path?: string, children?: SidebarItem[]) => {
    if (path && location.pathname === path) return true;
    if (children) return children.some(c => c.path && location.pathname.startsWith(c.path));
    return false;
  };

  const handleToggleCollapse = () => {
    if (onCollapseToggle) {
      onCollapseToggle(!collapsed);
    } else {
      setLocalCollapsed(!localCollapsed);
    }
  };

  const renderMenuItem = (item: SidebarItem) => {
    const isActive = isRouteActive(item.path, item.children);
    const isOpen = openMenus[item.title] || (isActive && !collapsed);

    if (item.children) {
      return (
        <div key={item.title} className="mb-0.5">
          <button
            onClick={() => toggleMenu(item.title)}
            className={clsx(
              'w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors group',
              isActive ? 'bg-blue-600/10 text-blue-600' : 'text-slate-800 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            <div className="flex items-center min-w-0">
              <span className={clsx('flex-shrink-0', isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600')}>
                {item.icon}
              </span>
              {!collapsed && <span className="ml-3 text-sm font-semibold truncate">{item.title}</span>}
            </div>
            {!collapsed && (
              <span className="text-slate-400 flex-shrink-0">
                {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </span>
            )}
          </button>
          {!collapsed && isOpen && (
            <div className="mt-0.5 ml-4 border-l-2 border-slate-100 pl-2 space-y-0.5">
              {item.children.map(child => (
                <NavLink
                  key={child.title}
                  to={child.path!}
                  onClick={onMobileClose}
                  className={({ isActive }) => clsx(
                    'flex items-center px-3 py-2 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/20'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  <span className="mr-2.5 opacity-70">{child.icon}</span>
                  {child.title}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        key={item.title}
        to={item.path!}
        onClick={onMobileClose}
        className={({ isActive }) => clsx(
          'flex items-center px-3 py-2.5 rounded-xl transition-colors mb-0.5 group',
          isActive
            ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20'
            : 'text-slate-800 hover:bg-slate-100 hover:text-slate-900'
        )}
      >
        <span className={clsx('flex-shrink-0', location.pathname === item.path ? 'text-white' : 'text-slate-400 group-hover:text-slate-600')}>
          {item.icon}
        </span>
        {!collapsed && <span className="ml-3 text-sm font-semibold">{item.title}</span>}
      </NavLink>
    );
  };

  const sidebarContent = (
    <aside className={clsx(
      'flex flex-col bg-white border-r border-slate-200 shadow-sm h-full transition-all duration-300',
      collapsed ? 'w-20' : 'w-64',
    )}>
      {/* Logo + Collapse toggle */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 flex-shrink-0 relative">
        {/* Logo area */}
        <div className="px-4 py-5 flex items-center gap-3">
          <div className="w-9 h-9 bg-[#1C2430] rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
            <Scissors className="w-4 h-4 text-[#C1652F]" />
          </div>
          <span
            className={clsx(
              'font-serif font-bold text-lg text-[#1C2430] whitespace-nowrap tracking-tight transition-all duration-300',
              collapsed && !mobileOpen ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
            )}
          >
            {companySettings?.name || 'Boutique CRM'}
          </span>
        </div>
        {collapsed && (
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center mx-auto shadow-sm">
            <span className="text-white font-black text-base">B</span>
          </div>
        )}
        {/* Mobile close */}
        {onMobileClose && (
          <button onClick={onMobileClose} className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 absolute right-3">
            <X className="w-4 h-4" />
          </button>
        )}
        {/* Desktop collapse */}
        {!onMobileClose && (
          <button
            onClick={handleToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors absolute -right-3 bg-white border border-slate-200 shadow-sm"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Menu items */}
      <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">
        {filteredMenuItems.map(renderMenuItem)}
      </div>

      {/* User Profile + Logout */}
      <div className="p-2.5 border-t border-slate-200 bg-slate-50/60 flex-shrink-0 space-y-1">
        {user && !collapsed && (
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#C1652F]/10 border border-[#C1652F]/20 text-[#C1652F] flex items-center justify-center font-bold text-xs flex-shrink-0">
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                {user.role === 'owner' && <Crown className="w-2.5 h-2.5 text-[#C99A3E]" />}
                {ROLE_LABELS[user.role]}
              </p>
            </div>
          </div>
        )}
        {user && collapsed && (
          <div className="flex justify-center mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#C1652F]/10 border border-[#C1652F]/20 text-[#C1652F] flex items-center justify-center font-bold text-xs">
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2.5 rounded-xl transition-colors text-slate-600 hover:bg-red-50 hover:text-red-600 group"
        >
          <span className="flex-shrink-0 text-slate-400 group-hover:text-red-500">
            <LogOut className="w-5 h-5" />
          </span>
          {!collapsed && <span className="ml-3 text-sm font-semibold">Logout</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar — always visible on lg+ */}
      <div className={clsx('hidden lg:flex flex-shrink-0 z-20 relative h-full', className)}>
        {sidebarContent}
      </div>

      {/* Mobile overlay drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onMobileClose} />
          {/* Drawer */}
          <div className="relative z-50 w-72 flex-shrink-0 animate-slide-right h-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
