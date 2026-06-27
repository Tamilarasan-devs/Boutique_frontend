import React from 'react';

export interface DrawerProps {
  className?: string;
  children?: React.ReactNode;
}

const Drawer: React.FC<DrawerProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'Drawer Component'}
    </div>
  );
};

export default Drawer;
