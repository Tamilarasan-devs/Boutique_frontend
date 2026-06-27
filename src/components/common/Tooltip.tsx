import React from 'react';

export interface TooltipProps {
  className?: string;
  children?: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'Tooltip Component'}
    </div>
  );
};

export default Tooltip;
