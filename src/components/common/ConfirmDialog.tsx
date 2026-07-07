import React from 'react';

export interface ConfirmDialogProps {
  className?: string;
  children?: React.ReactNode;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'ConfirmDialog Component'}
    </div>
  );
};

export default ConfirmDialog;
