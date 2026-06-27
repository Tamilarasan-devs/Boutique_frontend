import React from 'react';

export interface PopoverProps {
  className?: string;
  children?: React.ReactNode;
}

const Popover: React.FC<PopoverProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'Popover Component'}
    </div>
  );
};

export default Popover;
