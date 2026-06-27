import React from 'react';

export interface AlertProps {
  className?: string;
  children?: React.ReactNode;
}

const Alert: React.FC<AlertProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'Alert Component'}
    </div>
  );
};

export default Alert;
