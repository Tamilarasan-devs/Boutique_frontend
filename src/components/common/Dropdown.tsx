import React from 'react';

export interface DropdownProps {
  className?: string;
  children?: React.ReactNode;
}

const Dropdown: React.FC<DropdownProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'Dropdown Component'}
    </div>
  );
};

export default Dropdown;
