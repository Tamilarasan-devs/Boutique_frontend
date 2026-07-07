import React from 'react';

export interface InventoryFormProps {
  className?: string;
  children?: React.ReactNode;
}

const InventoryForm: React.FC<InventoryFormProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'InventoryForm Component'}
    </div>
  );
};

export default InventoryForm;
