import React from 'react';

export interface TopbarProps {
  className?: string;
  children?: React.ReactNode;
}

const Topbar: React.FC<TopbarProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'Topbar Component'}
    </div>
  );
};

export default Topbar;
