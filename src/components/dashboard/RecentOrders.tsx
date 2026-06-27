import React from 'react';

export interface RecentOrdersProps {
  className?: string;
  children?: React.ReactNode;
}

const RecentOrders: React.FC<RecentOrdersProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'RecentOrders Component'}
    </div>
  );
};

export default RecentOrders;
