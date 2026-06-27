import React from 'react';

export interface PaymentFormProps {
  className?: string;
  children?: React.ReactNode;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'PaymentForm Component'}
    </div>
  );
};

export default PaymentForm;
