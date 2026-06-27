import React from 'react';

export interface EmptyStateProps {
  className?: string;
  children?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'EmptyState Component'}
    </div>
  );
};

export default EmptyState;
