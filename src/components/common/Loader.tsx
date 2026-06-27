import React from 'react';

export interface LoaderProps {
  className?: string;
  children?: React.ReactNode;
}

const Loader: React.FC<LoaderProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'Loader Component'}
    </div>
  );
};

export default Loader;
