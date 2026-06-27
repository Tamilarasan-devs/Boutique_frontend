import React from 'react';

export interface ErrorStateProps {
  className?: string;
  children?: React.ReactNode;
}

const ErrorState: React.FC<ErrorStateProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'ErrorState Component'}
    </div>
  );
};

export default ErrorState;
