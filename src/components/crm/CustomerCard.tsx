import React from 'react';

export interface CustomerCardProps {
  className?: string;
  children?: React.ReactNode;
}

const CustomerCard: React.FC<CustomerCardProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'CustomerCard Component'}
    </div>
  );
};

export default CustomerCard;
