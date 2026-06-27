import React from 'react';

export interface SelectProps {
  className?: string;
  children?: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'Select Component'}
    </div>
  );
};

export default Select;
