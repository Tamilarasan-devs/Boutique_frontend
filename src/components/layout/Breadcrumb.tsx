import React from 'react';

export interface BreadcrumbProps {
  className?: string;
  children?: React.ReactNode;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'Breadcrumb Component'}
    </div>
  );
};

export default Breadcrumb;
