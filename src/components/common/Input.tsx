import React from 'react';

export interface InputProps {
  className?: string;
  children?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'Input Component'}
    </div>
  );
};

export default Input;
