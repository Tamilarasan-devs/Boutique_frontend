import React from 'react';

export interface RadioProps {
  className?: string;
  children?: React.ReactNode;
}

const Radio: React.FC<RadioProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'Radio Component'}
    </div>
  );
};

export default Radio;
