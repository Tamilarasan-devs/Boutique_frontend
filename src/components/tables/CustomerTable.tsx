import React from 'react';

export interface CustomerTableProps {
  className?: string;
  children?: React.ReactNode;
}

const CustomerTable: React.FC<CustomerTableProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'CustomerTable Component'}
    </div>
  );
};

export default CustomerTable;
