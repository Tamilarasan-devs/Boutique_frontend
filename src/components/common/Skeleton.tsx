import React from 'react';

export interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

const Skeleton: React.FC<SkeletonProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'Skeleton Component'}
    </div>
  );
};

export default Skeleton;
