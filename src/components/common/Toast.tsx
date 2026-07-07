import React from 'react';

export interface ToastProps {
  className?: string;
  children?: React.ReactNode;
}

const Toast: React.FC<ToastProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'Toast Component'}
    </div>
  );
};

export default Toast;
