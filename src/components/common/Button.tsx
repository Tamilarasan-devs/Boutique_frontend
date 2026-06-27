import React from 'react';

export interface ButtonProps {
  className?: string;
  children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'Button Component'}
    </div>
  );
};

export default Button;
