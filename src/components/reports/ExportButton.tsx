import React from 'react';

export interface ExportButtonProps {
  className?: string;
  children?: React.ReactNode;
}

const ExportButton: React.FC<ExportButtonProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'ExportButton Component'}
    </div>
  );
};

export default ExportButton;
