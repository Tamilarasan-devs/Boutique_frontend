import React from 'react';

export interface CheckboxProps {
  className?: string;
  children?: React.ReactNode;
}

const Checkbox: React.FC<CheckboxProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'Checkbox Component'}
    </div>
  );
};

export default Checkbox;
