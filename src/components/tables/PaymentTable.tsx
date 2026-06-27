import React from 'react';

export interface PaymentTableProps {
  className?: string;
  children?: React.ReactNode;
}

const PaymentTable: React.FC<PaymentTableProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'PaymentTable Component'}
    </div>
  );
};

export default PaymentTable;
