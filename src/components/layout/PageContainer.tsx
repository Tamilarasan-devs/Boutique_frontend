import React from 'react';

export interface PageContainerProps {
  className?: string;
  children?: React.ReactNode;
}

const PageContainer: React.FC<PageContainerProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'PageContainer Component'}
    </div>
  );
};

export default PageContainer;
