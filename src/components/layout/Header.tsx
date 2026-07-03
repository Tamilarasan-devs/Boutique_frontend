import React, { Dispatch, SetStateAction } from 'react';
import { Menu } from 'lucide-react';

export interface HeaderProps {
  className?: string;
  children?: React.ReactNode;
  sidebarOpen?: boolean;
  setSidebarOpen?: Dispatch<SetStateAction<boolean>>;
}

const Header: React.FC<HeaderProps> = ({ className, children, sidebarOpen, setSidebarOpen }) => {
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
    </div>
  );
};

export default Header;
