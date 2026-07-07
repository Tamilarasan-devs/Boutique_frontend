import React from 'react';

export interface ContentWrapperProps {
  className?: string;
  children?: React.ReactNode;
}

const ContentWrapper: React.FC<ContentWrapperProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'ContentWrapper Component'}
    </div>
  );
};

export default ContentWrapper;
