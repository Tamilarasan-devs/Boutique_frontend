import React from 'react';

export interface TextareaProps {
  className?: string;
  children?: React.ReactNode;
}

const Textarea: React.FC<TextareaProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'Textarea Component'}
    </div>
  );
};

export default Textarea;
