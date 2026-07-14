import React, { useState, useEffect } from 'react';
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
import { useAuth, MODULE_ROUTES } from '../../context/AuthContext';
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
      // { title: 'Appointments', path: '/crm/appointments', icon: <CalendarDays className="w-4 h-4" /> },
      { title: 'Followups', path: '/crm/followups', icon: <CalendarDays className="w-4 h-4" /> },
    ]
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
      {
        title: 'Measurements', path: '/measurements', icon: <Ruler className="w-5 h-5" />,
      },
      { title: 'Orders', path: '/orders/list', icon: <ShoppingCart className="w-4 h-4" /> },
      { title: 'Production', path: '/orders/production', icon: <Factory className="w-4 h-4" /> },
      // { title: 'Trial', path: '/orders/trial', icon: <ShoppingCart className="w-4 h-4" /> },
      { title: 'Delivery', path: '/orders/delivery', icon: <Truck className="w-4 h-4" /> },
    ]
  },
  // {
  //   title: 'Inventory', icon: <PackageSearch className="w-5 h-5" />,
  //   children: [
  //     { title: 'Fabrics', path: '/inventory/fabrics', icon: <PackageSearch className="w-4 h-4" /> },
  //     { title: 'Accessories', path: '/inventory/accessories', icon: <PackageSearch className="w-4 h-4" /> },
  //     { title: 'Suppliers', path: '/inventory/suppliers', icon: <Truck className="w-4 h-4" /> },
  //     { title: 'Purchases', path: '/inventory/purchases', icon: <PackageSearch className="w-4 h-4" /> },
  //     // { title: 'Stock', path: '/inventory/stock', icon: <PackageSearch className="w-4 h-4" /> },
  //   ]
  // },
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
      // { title: 'Loyalty', path: '/marketing/loyalty', icon: <Megaphone className="w-4 h-4" /> },
    ]
  },
  {
    title: 'Admin',
    icon: <Settings className="w-5 h-5" />,
    children: [
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
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    menuItems.forEach(item => {
      if (item.children) {
        const isActive = item.children.some(c => c.path && window.location.pathname.startsWith(c.path));
        if (isActive) {
          initial[item.title] = true;
        }
      }
    });
    return initial;
  });

  useEffect(() => {
    menuItems.forEach(item => {
      if (item.children) {
        const isActive = item.children.some(c => c.path && location.pathname.startsWith(c.path));
        if (isActive) {
          setOpenMenus(prev => ({ ...prev, [item.title]: true }));
        }
      }
    });
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/auth/login', { replace: true });
  };

  // Filter menu items based on the current user's role permissions matrix
  const permissions = user?.permissions || {};
  
  const isPathAllowed = (path?: string) => {
    if (!path) return true;
    if (user?.role === 'owner') return true;

    // Check each module in the permissions matrix
    for (const [moduleName, accessLevel] of Object.entries(permissions)) {
      if (accessLevel === 'None') continue; // Only Read or Full grants access to the route
      
      const routes = MODULE_ROUTES[moduleName] || [];
      const matches = routes.some(r => path === r || path.startsWith(r + '/') || r.startsWith(path));
      if (matches) return true;
    }
    return false;
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
    const isOpen = !!openMenus[item.title];

    if (item.children) {
      return (
        <div key={item.title} className="mb-0.5 relative z-10">
          <button
            onClick={() => toggleMenu(item.title)}
            className={clsx(
              'w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors group',
              isActive
                ? 'bg-[#252048] text-white font-semibold'
                : 'text-[#A5A1B8] hover:bg-[#252048] hover:text-white'
            )}
          >
            <div className="flex items-center min-w-0">
              <span className={clsx('flex-shrink-0 transition-colors', isActive ? 'text-[#A855F7]' : 'text-[#A5A1B8] group-hover:text-white')}>
                {item.icon}
              </span>
              {!collapsed && <span className="ml-3 text-sm font-semibold truncate">{item.title}</span>}
            </div>
            {!collapsed && (
              <span className="text-[#A5A1B8] group-hover:text-white flex-shrink-0">
                {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </span>
            )}
          </button>
          {!collapsed && isOpen && (
            <div className="mt-0.5 ml-4 border-l-2 border-[#252048] pl-2 space-y-0.5">
              {item.children.map(child => (
                <NavLink
                  key={child.title}
                  to={child.path!}
                  onClick={onMobileClose}
                  className={({ isActive }) => clsx(
                    'flex items-center px-3 py-2 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-gradient-to-r from-[#A855F7] to-[#7E22CE] text-white font-semibold shadow-sm'
                      : 'text-[#A5A1B8] hover:bg-[#252048] hover:text-white'
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
          'flex items-center px-3 py-2.5 rounded-xl transition-colors mb-0.5 group relative z-10',
          isActive
            ? 'bg-gradient-to-r from-[#A855F7] to-[#7E22CE] text-white font-semibold shadow-md shadow-[#7E22CE]/20'
            : 'text-[#A5A1B8] hover:bg-[#252048] hover:text-white'
        )}
      >
        <span className={clsx('flex-shrink-0 transition-colors', location.pathname === item.path ? 'text-white' : 'text-[#A5A1B8] group-hover:text-white')}>
          {item.icon}
        </span>
        {!collapsed && <span className="ml-3 text-sm font-semibold">{item.title}</span>}
      </NavLink>
    );
  };

  const sidebarContent = (
    <aside className={clsx(
      'flex flex-col bg-[#151226] border-r border-[#252048] shadow-sm h-full transition-all duration-300 relative overflow-hidden',
      collapsed ? 'w-20' : 'w-64',
    )}>
      {/* Logo + Collapse toggle */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-[#252048] flex-shrink-0 relative z-10">
        {/* Logo area */}
        <div className="px-4 py-5 flex items-center gap-3">
          <div className="w-9 h-9 bg-[#252048] rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-[#37306B]">
            <Scissors className="w-4 h-4 text-[#A855F7]" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-serif font-bold text-base text-white whitespace-nowrap tracking-tight">
                {companySettings?.name || "Your Boutique"}
              </span>
              <span className="text-[10px] font-bold text-[#A855F7] uppercase tracking-widest leading-none mt-0.5">
                CRM
              </span>
            </div>
          )}
        </div>
        {collapsed && (
          <div className="w-8 h-8 bg-gradient-to-r from-[#A855F7] to-[#7E22CE] rounded-xl flex items-center justify-center mx-auto shadow-sm">
            <span className="text-white font-black text-base">B</span>
          </div>
        )}
        {/* Mobile close */}
        {onMobileClose && (
          <button onClick={onMobileClose} className="lg:hidden p-1.5 rounded-lg text-[#A5A1B8] hover:bg-[#252048] hover:text-white absolute right-3">
            <X className="w-4 h-4" />
          </button>
        )}
        {/* Desktop collapse */}
        {!onMobileClose && (
          <button
            onClick={handleToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-[#A5A1B8] hover:text-white hover:bg-[#252048] transition-colors absolute -right-3 bg-[#151226] border border-[#252048] shadow-sm z-30"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Menu items */}
      <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5 relative z-10">
        {filteredMenuItems.map(renderMenuItem)}
      </div>

      {/* Animated flowers in the background */}
      {!collapsed && (
        <div className="sidebar-flowers-container pointer-events-none absolute bottom-0 left-0 w-full h-[260px] overflow-hidden opacity-85 z-0 select-none">
          <div className="flowers">
            <div className="flower flower--1">
              <div className="flower__leafs flower__leafs--1">
                <div className="flower__leaf flower__leaf--1"></div>
                <div className="flower__leaf flower__leaf--2"></div>
                <div className="flower__leaf flower__leaf--3"></div>
                <div className="flower__leaf flower__leaf--4"></div>
                <div className="flower__white-circle"></div>

                <div className="flower__light flower__light--1"></div>
                <div className="flower__light flower__light--2"></div>
                <div className="flower__light flower__light--3"></div>
                <div className="flower__light flower__light--4"></div>
                <div className="flower__light flower__light--5"></div>
                <div className="flower__light flower__light--6"></div>
                <div className="flower__light flower__light--7"></div>
                <div className="flower__light flower__light--8"></div>
              </div>
              <div className="flower__line">
                <div className="flower__line__leaf flower__line__leaf--1"></div>
                <div className="flower__line__leaf flower__line__leaf--2"></div>
                <div className="flower__line__leaf flower__line__leaf--3"></div>
                <div className="flower__line__leaf flower__line__leaf--4"></div>
                <div className="flower__line__leaf flower__line__leaf--5"></div>
                <div className="flower__line__leaf flower__line__leaf--6"></div>
              </div>
            </div>

            <div className="flower flower--2">
              <div className="flower__leafs flower__leafs--2">
                <div className="flower__leaf flower__leaf--1"></div>
                <div className="flower__leaf flower__leaf--2"></div>
                <div className="flower__leaf flower__leaf--3"></div>
                <div className="flower__leaf flower__leaf--4"></div>
                <div className="flower__white-circle"></div>

                <div className="flower__light flower__light--1"></div>
                <div className="flower__light flower__light--2"></div>
                <div className="flower__light flower__light--3"></div>
                <div className="flower__light flower__light--4"></div>
                <div className="flower__light flower__light--5"></div>
                <div className="flower__light flower__light--6"></div>
                <div className="flower__light flower__light--7"></div>
                <div className="flower__light flower__light--8"></div>
              </div>
              <div className="flower__line">
                <div className="flower__line__leaf flower__line__leaf--1"></div>
                <div className="flower__line__leaf flower__line__leaf--2"></div>
                <div className="flower__line__leaf flower__line__leaf--3"></div>
                <div className="flower__line__leaf flower__line__leaf--4"></div>
              </div>
            </div>

            <div className="flower flower--3">
              <div className="flower__leafs flower__leafs--3">
                <div className="flower__leaf flower__leaf--1"></div>
                <div className="flower__leaf flower__leaf--2"></div>
                <div className="flower__leaf flower__leaf--3"></div>
                <div className="flower__leaf flower__leaf--4"></div>
                <div className="flower__white-circle"></div>

                <div className="flower__light flower__light--1"></div>
                <div className="flower__light flower__light--2"></div>
                <div className="flower__light flower__light--3"></div>
                <div className="flower__light flower__light--4"></div>
                <div className="flower__light flower__light--5"></div>
                <div className="flower__light flower__light--6"></div>
                <div className="flower__light flower__light--7"></div>
                <div className="flower__light flower__light--8"></div>
              </div>
              <div className="flower__line">
                <div className="flower__line__leaf flower__line__leaf--1"></div>
                <div className="flower__line__leaf flower__line__leaf--2"></div>
                <div className="flower__line__leaf flower__line__leaf--3"></div>
                <div className="flower__line__leaf flower__line__leaf--4"></div>
              </div>
            </div>

            <div className="grow-ans" style={{ "--d": "1.2s" } as React.CSSProperties}>
              <div className="flower__g-long">
                <div className="flower__g-long__top"></div>
                <div className="flower__g-long__bottom"></div>
              </div>
            </div>

            <div className="growing-grass">
              <div className="flower__grass flower__grass--1">
                <div className="flower__grass--top"></div>
                <div className="flower__grass--bottom"></div>
                <div className="flower__grass__leaf flower__grass__leaf--1"></div>
                <div className="flower__grass__leaf flower__grass__leaf--2"></div>
                <div className="flower__grass__leaf flower__grass__leaf--3"></div>
                <div className="flower__grass__leaf flower__grass__leaf--4"></div>
                <div className="flower__grass__leaf flower__grass__leaf--5"></div>
                <div className="flower__grass__leaf flower__grass__leaf--6"></div>
                <div className="flower__grass__leaf flower__grass__leaf--7"></div>
                <div className="flower__grass__leaf flower__grass__leaf--8"></div>
                <div className="flower__grass__overlay"></div>
              </div>
            </div>

            <div className="growing-grass">
              <div className="flower__grass flower__grass--2">
                <div className="flower__grass--top"></div>
                <div className="flower__grass--bottom"></div>
                <div className="flower__grass__leaf flower__grass__leaf--1"></div>
                <div className="flower__grass__leaf flower__grass__leaf--2"></div>
                <div className="flower__grass__leaf flower__grass__leaf--3"></div>
                <div className="flower__grass__leaf flower__grass__leaf--4"></div>
                <div className="flower__grass__leaf flower__grass__leaf--5"></div>
                <div className="flower__grass__leaf flower__grass__leaf--6"></div>
                <div className="flower__grass__leaf flower__grass__leaf--7"></div>
                <div className="flower__grass__leaf flower__grass__leaf--8"></div>
                <div className="flower__grass__overlay"></div>
              </div>
            </div>

            <div className="grow-ans" style={{ "--d": "2.4s" } as React.CSSProperties}>
              <div className="flower__g-right flower__g-right--1">
                <div className="leaf"></div>
              </div>
            </div>

            <div className="grow-ans" style={{ "--d": "2.8s" } as React.CSSProperties}>
              <div className="flower__g-right flower__g-right--2">
                <div className="leaf"></div>
              </div>
            </div>

            <div className="grow-ans" style={{ "--d": "2.8s" } as React.CSSProperties}>
              <div className="flower__g-front">
                <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--1">
                  <div className="flower__g-front__leaf"></div>
                </div>
                <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--2">
                  <div className="flower__g-front__leaf"></div>
                </div>
                <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--3">
                  <div className="flower__g-front__leaf"></div>
                </div>
                <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--4">
                  <div className="flower__g-front__leaf"></div>
                </div>
                <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--5">
                  <div className="flower__g-front__leaf"></div>
                </div>
                <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--6">
                  <div className="flower__g-front__leaf"></div>
                </div>
                <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--7">
                  <div className="flower__g-front__leaf"></div>
                </div>
                <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--8">
                  <div className="flower__g-front__leaf"></div>
                </div>
                <div className="flower__g-front__line"></div>
              </div>
            </div>

            <div className="grow-ans" style={{ "--d": "3.2s" } as React.CSSProperties}>
              <div className="flower__g-fr">
                <div className="leaf"></div>
                <div className="flower__g-fr__leaf flower__g-fr__leaf--1"></div>
                <div className="flower__g-fr__leaf flower__g-fr__leaf--2"></div>
                <div className="flower__g-fr__leaf flower__g-fr__leaf--3"></div>
                <div className="flower__g-fr__leaf flower__g-fr__leaf--4"></div>
                <div className="flower__g-fr__leaf flower__g-fr__leaf--5"></div>
                <div className="flower__g-fr__leaf flower__g-fr__leaf--6"></div>
                <div className="flower__g-fr__leaf flower__g-fr__leaf--7"></div>
                <div className="flower__g-fr__leaf flower__g-fr__leaf--8"></div>
              </div>
            </div>

            <div className="long-g long-g--0">
              <div className="grow-ans" style={{ "--d": "3s" } as React.CSSProperties}>
                <div className="leaf leaf--0"></div>
              </div>
              <div className="grow-ans" style={{ "--d": "2.2s" } as React.CSSProperties}>
                <div className="leaf leaf--1"></div>
              </div>
              <div className="grow-ans" style={{ "--d": "3.4s" } as React.CSSProperties}>
                <div className="leaf leaf--2"></div>
              </div>
              <div className="grow-ans" style={{ "--d": "3.6s" } as React.CSSProperties}>
                <div className="leaf leaf--3"></div>
              </div>
            </div>

            <div className="long-g long-g--1">
              <div className="grow-ans" style={{ "--d": "3.6s" } as React.CSSProperties}>
                <div className="leaf leaf--0"></div>
              </div>
              <div className="grow-ans" style={{ "--d": "3.8s" } as React.CSSProperties}>
                <div className="leaf leaf--1"></div>
              </div>
              <div className="grow-ans" style={{ "--d": "4s" } as React.CSSProperties}>
                <div className="leaf leaf--2"></div>
              </div>
              <div className="grow-ans" style={{ "--d": "4.2s" } as React.CSSProperties}>
                <div className="leaf leaf--3"></div>
              </div>
            </div>

            <div className="long-g long-g--2">
              <div className="grow-ans" style={{ "--d": "4s" } as React.CSSProperties}>
                <div className="leaf leaf--0"></div>
              </div>
              <div className="grow-ans" style={{ "--d": "4.2s" } as React.CSSProperties}>
                <div className="leaf leaf--1"></div>
              </div>
              <div className="grow-ans" style={{ "--d": "4.4s" } as React.CSSProperties}>
                <div className="leaf leaf--2"></div>
              </div>
              <div className="grow-ans" style={{ "--d": "4.6s" } as React.CSSProperties}>
                <div className="leaf leaf--3"></div>
              </div>
            </div>

            <div className="long-g long-g--3">
              <div className="grow-ans" style={{ "--d": "4s" } as React.CSSProperties}>
                <div className="leaf leaf--0"></div>
              </div>
              <div className="grow-ans" style={{ "--d": "4.2s" } as React.CSSProperties}>
                <div className="leaf leaf--1"></div>
              </div>
              <div className="grow-ans" style={{ "--d": "3s" } as React.CSSProperties}>
                <div className="leaf leaf--2"></div>
              </div>
              <div className="grow-ans" style={{ "--d": "3.6s" } as React.CSSProperties}>
                <div className="leaf leaf--3"></div>
              </div>
            </div>

            <div className="long-g long-g--4">
              <div className="grow-ans" style={{ "--d": "4s" } as React.CSSProperties}>
                <div className="leaf leaf--0"></div>
              </div>
              <div className="grow-ans" style={{ "--d": "4.2s" } as React.CSSProperties}>
                <div className="leaf leaf--1"></div>
              </div>
              <div className="grow-ans" style={{ "--d": "3s" } as React.CSSProperties}>
                <div className="leaf leaf--2"></div>
              </div>
              <div className="grow-ans" style={{ "--d": "3.6s" } as React.CSSProperties}>
                <div className="leaf leaf--3"></div>
              </div>
            </div>

            <div className="long-g long-g--5">
              <div className="grow-ans" style={{ "--d": "4s" } as React.CSSProperties}>
                <div className="leaf leaf--0"></div>
              </div>
              <div className="grow-ans" style={{ "--d": "4.2s" } as React.CSSProperties}>
                <div className="leaf leaf--1"></div>
              </div>
              <div className="grow-ans" style={{ "--d": "3s" } as React.CSSProperties}>
                <div className="leaf leaf--2"></div>
              </div>
              <div className="grow-ans" style={{ "--d": "3.6s" } as React.CSSProperties}>
                <div className="leaf leaf--3"></div>
              </div>
            </div>

            <div className="long-g long-g--6">
              <div className="grow-ans" style={{ "--d": "4.2s" } as React.CSSProperties}>
                <div className="leaf leaf--0"></div>
              </div>
              <div className="grow-ans" style={{ "--d": "4.4s" } as React.CSSProperties}>
                <div className="leaf leaf--1"></div>
              </div>
              <div className="grow-ans" style={{ "--d": "4.6s" } as React.CSSProperties}>
                <div className="leaf leaf--2"></div>
              </div>
              <div className="grow-ans" style={{ "--d": "4.8s" } as React.CSSProperties}>
                <div className="leaf leaf--3"></div>
              </div>
            </div>

            <div className="long-g long-g--7">
              <div className="grow-ans" style={{ "--d": "3s" } as React.CSSProperties}>
                <div className="leaf leaf--0"></div>
              </div>
              <div className="grow-ans" style={{ "--d": "3.2s" } as React.CSSProperties}>
                <div className="leaf leaf--1"></div>
              </div>
              <div className="grow-ans" style={{ "--d": "3.5s" } as React.CSSProperties}>
                <div className="leaf leaf--2"></div>
              </div>
              <div className="grow-ans" style={{ "--d": "3.6s" } as React.CSSProperties}>
                <div className="leaf leaf--3"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Profile + Logout */}
      <div className="p-2.5 border-t border-[#252048] bg-[#151226] flex-shrink-0 space-y-1 relative z-10">
        {user && !collapsed && (
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1 bg-[#252048]/30 border border-[#252048]/50 rounded-xl relative z-10">
            <div className="w-8 h-8 rounded-xl bg-[#7209B7]/20 border border-[#7209B7]/30 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 relative">
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              {/* Green online indicator */}
              <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#151226]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-[#A5A1B8] font-medium flex items-center gap-1">
                {user.role === 'owner' && <Crown className="w-2.5 h-2.5 text-amber-400" />}
                {ROLE_LABELS[user.role]}
              </p>
            </div>
          </div>
        )}
        {user && collapsed && (
          <div className="flex justify-center mb-1 relative z-10">
            <div className="w-8 h-8 rounded-xl bg-[#7209B7]/20 border border-[#7209B7]/30 text-white flex items-center justify-center font-bold text-xs relative">
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              {/* Green online indicator */}
              <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#151226]" />
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2.5 rounded-xl transition-colors text-[#A5A1B8] hover:bg-red-950/30 hover:text-red-400 group relative z-10"
        >
          <span className="flex-shrink-0 text-[#A5A1B8] group-hover:text-red-400">
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
