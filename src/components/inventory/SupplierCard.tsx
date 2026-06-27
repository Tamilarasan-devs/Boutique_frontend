import React from 'react';

export interface SupplierCardProps {
  className?: string;
  children?: React.ReactNode;
}

const SupplierCard: React.FC<SupplierCardProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'SupplierCard Component'}
    </div>
  );
};

export default SupplierCard;
