import React from 'react';

export interface HeaderProps {
  className?: string;
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'Header Component'}
    </div>
  );
};

export default Header;
