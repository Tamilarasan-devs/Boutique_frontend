import React, { Dispatch, SetStateAction } from 'react';
import { Menu, Bell, Calendar, LayoutTemplate } from 'lucide-react';
import { useUIStore } from '../../store';

export interface HeaderProps {
  className?: string;
  children?: React.ReactNode;
  sidebarOpen?: boolean;
  setSidebarOpen?: Dispatch<SetStateAction<boolean>>;
}

const Header: React.FC<HeaderProps> = ({ className, children, sidebarOpen, setSidebarOpen }) => {
  const { navMode, toggleNavMode } = useUIStore();

  return (
    <div className={`h-16 border-b border-slate-200 bg-white flex items-center px-4 justify-between z-10 ${className || ''}`}>
      <div className="flex items-center">
        {setSidebarOpen && (
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 mr-4 text-slate-500 hover:bg-slate-100 rounded-md md:hidden transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
        )}
        {children || <span className="font-semibold text-slate-800">Header</span>}
      </div>
      
      <div className="flex items-center gap-2 pr-2">
        <button 
          onClick={toggleNavMode}
          className="p-2 text-slate-500 hover:text-[#7209B7] hover:bg-[#7209B7]/10 rounded-full transition-colors hidden md:block" 
          title={`Switch to ${navMode === 'bottom' ? 'Sidebar' : 'Bottom Bar'}`}
        >
          <LayoutTemplate size={20} />
        </button>
        <button className="p-2 text-slate-500 hover:text-[#7209B7] hover:bg-[#7209B7]/10 rounded-full transition-colors relative" title="Calendar">
          <Calendar size={20} />
        </button>
        <button className="p-2 text-slate-500 hover:text-[#7209B7] hover:bg-[#7209B7]/10 rounded-full transition-colors relative" title="Notifications">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#F43F5E] rounded-full border-2 border-white"></span>
        </button>
      </div>
    </div>
  );
};

export default Header;
