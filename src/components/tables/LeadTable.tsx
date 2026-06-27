import React from 'react';

export interface LeadTableProps {
  className?: string;
  children?: React.ReactNode;
}

const LeadTable: React.FC<LeadTableProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'LeadTable Component'}
    </div>
  );
};

export default LeadTable;
