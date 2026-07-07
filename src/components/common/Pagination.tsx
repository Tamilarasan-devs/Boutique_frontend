import React from 'react';

export interface PaginationProps {
  className?: string;
  children?: React.ReactNode;
}

const Pagination: React.FC<PaginationProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'Pagination Component'}
    </div>
  );
};

export default Pagination;
