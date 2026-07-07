import React from 'react';

export interface SupplierFormProps {
  className?: string;
  children?: React.ReactNode;
}

const SupplierForm: React.FC<SupplierFormProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'SupplierForm Component'}
    </div>
  );
};

export default SupplierForm;
