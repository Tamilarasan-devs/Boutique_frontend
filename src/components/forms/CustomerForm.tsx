import React from 'react';

export interface CustomerFormProps {
  className?: string;
  children?: React.ReactNode;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'CustomerForm Component'}
    </div>
  );
};

export default CustomerForm;
