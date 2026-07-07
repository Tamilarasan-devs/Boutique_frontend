import React from 'react';

export interface DataTableProps {
  className?: string;
  children?: React.ReactNode;
}

const DataTable: React.FC<DataTableProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'DataTable Component'}
    </div>
  );
};

export default DataTable;
