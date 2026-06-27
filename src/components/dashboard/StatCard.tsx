import React from 'react';

export interface StatCardProps {
  className?: string;
  children?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'StatCard Component'}
    </div>
  );
};

export default StatCard;
