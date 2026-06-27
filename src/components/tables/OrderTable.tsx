import React from 'react';

export interface OrderTableProps {
  className?: string;
  children?: React.ReactNode;
}

const OrderTable: React.FC<OrderTableProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'OrderTable Component'}
    </div>
  );
};

export default OrderTable;
