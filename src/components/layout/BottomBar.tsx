import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
  LayoutTemplate
} from 'lucide-react';
import { useAuth, MODULE_ROUTES } from '../../context/AuthContext';
import { useUIStore } from '../../store';

interface BottomBarItem {
  title: string;
  path?: string;
  icon: React.ReactNode;
  children?: { title: string; path: string; icon: React.ReactNode; }[];
}

const menuItems: BottomBarItem[] = [
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

const BottomBar: React.FC = () => {
  const { user, logout } = useAuth();
  const { navMode, toggleNavMode } = useUIStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const mainElement = document.querySelector('main');
    if (!mainElement) return;

    const handleScroll = () => {
      const currentScrollY = mainElement.scrollTop;
      
      if (currentScrollY > lastScrollY && currentScrollY > 20) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection('up');
      }
      setLastScrollY(currentScrollY);
    };

    mainElement.addEventListener('scroll', handleScroll, { passive: true });
    return () => mainElement.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Determine permissions
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

  const handleLogout = () => {
    logout();
    navigate('/auth/login', { replace: true });
  };

  const isItemActive = (item: BottomBarItem) => {
    if (item.path && location.pathname === item.path) return true;
    if (item.children) {
      return item.children.some(child => location.pathname.startsWith(child.path));
    }
    return false;
  };

  return (
    <>
      {/* Main Bottom Bar (macOS Dock) */}
      <div 
        className={clsx(
          "fixed bottom-4 left-1/2 -translate-x-1/2 z-40 hidden",
          navMode === 'bottom' && "md:flex",
          "bg-[var(--primary-hex)]/90 backdrop-blur-xl border border-white/10 shadow-lg rounded-2xl p-2",
          "transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform text-white",
          scrollDirection === 'down' ? "translate-y-32" : "translate-y-0"
        )}
      >
        <div className="flex items-end justify-center mac-dock px-2">
          {allowedItems.map((item, index) => {
            const isActive = isItemActive(item);
            
            return (
              <div key={index} className="mac-dock-wrapper relative flex flex-col items-center justify-end h-full group">
                {/* Hover Popup Menu for Sub-items (Above Icon) */}
                {item.children && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 bg-[var(--primary-hex)]/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 z-50 transform origin-bottom scale-95 group-hover:scale-100 flex flex-col gap-1">
                    <div className="px-3 pb-2 pt-1 mb-1 border-b border-white/10">
                      <h3 className="text-xs font-serif font-bold text-white/90">{item.title}</h3>
                    </div>
                    {item.children.map(child => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={({ isActive: childActive }) => clsx(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-xs font-medium cursor-pointer",
                          childActive 
                            ? "bg-[var(--accent-hex)]/20 text-[var(--accent-hex)]" 
                            : "text-white/70 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        <div className={clsx("w-4 h-4", location.pathname.startsWith(child.path) ? "text-[var(--accent-hex)]" : "text-white/50")}>
                          {child.icon}
                        </div>
                        {child.title}
                      </NavLink>
                    ))}
                    {/* Triangle pointer pointing down */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[var(--primary-hex)]/95 backdrop-blur-xl border-b border-r border-white/10 rotate-45" />
                  </div>
                )}

                {/* Dock Button */}
                <button
                  onClick={() => {
                    if (item.path) {
                      navigate(item.path);
                    }
                  }}
                  className={clsx(
                    "mac-dock-item flex flex-col items-center justify-center min-w-[64px] h-[64px] gap-1 rounded-xl mx-0.5 cursor-pointer relative bg-transparent",
                    isActive ? "text-[var(--accent-hex)]" : "text-white/50 group-hover:text-white"
                  )}
                >
                  <div className="w-6 h-6 flex items-center justify-center">
                    {item.icon}
                  </div>
                  
                  <span className={clsx(
                    "mac-dock-label text-[9px] font-bold tracking-wide mt-0.5 max-w-full truncate px-1 transition-opacity duration-200 opacity-100"
                  )}>
                    {item.title}
                  </span>

                  {/* Active Indicator dot */}
                  {isActive && (
                    <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-[var(--accent-hex)] shadow-[0_0_8px_var(--accent-hex)]" />
                  )}
                </button>
              </div>
            );
          })}
          
          {/* Layout Toggle & Logout Button */}
          <div className="w-[1px] h-10 bg-white/10 mx-3 flex-shrink-0 self-center" />
          
          <div className="mac-dock-wrapper relative flex flex-col items-center justify-end h-full group">
            <button
              onClick={toggleNavMode}
              className="mac-dock-item flex flex-col items-center justify-center min-w-[64px] h-[64px] gap-1 rounded-xl mx-0.5 text-[var(--accent-hex)] group-hover:opacity-90 cursor-pointer bg-transparent"
            >
              <div className="w-6 h-6 flex items-center justify-center transition-transform duration-200">
                <LayoutTemplate className="w-5 h-5" />
              </div>
              <span className="mac-dock-label text-[9px] font-bold tracking-wide mt-0.5 opacity-100 transition-opacity duration-200">Sidebar</span>
            </button>
          </div>

          <div className="mac-dock-wrapper relative flex flex-col items-center justify-end h-full group">
            <button
              onClick={handleLogout}
              className="mac-dock-item flex flex-col items-center justify-center min-w-[64px] h-[64px] gap-1 rounded-xl mx-0.5 text-red-400 group-hover:text-red-400 cursor-pointer bg-transparent"
            >
              <div className="w-6 h-6 flex items-center justify-center transition-transform duration-200">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="mac-dock-label text-[9px] font-bold tracking-wide mt-0.5 opacity-100 transition-opacity duration-200">Logout</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Global CSS for macOS dock effect */}
      <style dangerouslySetInnerHTML={{__html: `
        .mac-dock-wrapper {
          /* Group behavior */
        }
        .mac-dock-item {
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          transform-origin: bottom center;
        }
        .mac-dock-wrapper:hover .mac-dock-item {
          transform: scale(1.4) translateY(-10px);
          z-index: 50;
          margin: 0 0.75rem;
          background: rgba(255, 255, 255, 0.15) !important;
          box-shadow: 0 10px 20px rgba(0,0,0,0.4);
        }
        .mac-dock-wrapper:has(+ .mac-dock-wrapper:hover) .mac-dock-item,
        .mac-dock-wrapper:hover + .mac-dock-wrapper .mac-dock-item {
          transform: scale(1.15) translateY(-4px);
          margin: 0 0.25rem;
          z-index: 40;
        }
        .mac-dock-wrapper:hover .mac-dock-label {
          opacity: 1 !important;
        }
      `}} />
    </>
  );
};

export default BottomBar;
