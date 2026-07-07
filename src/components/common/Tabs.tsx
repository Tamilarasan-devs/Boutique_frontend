import React from 'react';

export interface TabsProps {
  className?: string;
  children?: React.ReactNode;
}

const Tabs: React.FC<TabsProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'Tabs Component'}
    </div>
  );
};

export default Tabs;
