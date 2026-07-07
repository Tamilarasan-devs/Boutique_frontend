import React from 'react';

export interface OrderFormProps {
  className?: string;
  children?: React.ReactNode;
}

const OrderForm: React.FC<OrderFormProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'OrderForm Component'}
    </div>
  );
};

export default OrderForm;
