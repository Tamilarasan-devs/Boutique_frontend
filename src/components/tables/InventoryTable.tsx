import React from 'react';

export interface InventoryTableProps {
  className?: string;
  children?: React.ReactNode;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'InventoryTable Component'}
    </div>
  );
};

export default InventoryTable;
