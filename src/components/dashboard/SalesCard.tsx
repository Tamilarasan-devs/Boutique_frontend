import React from 'react';

export interface SalesCardProps {
  className?: string;
  children?: React.ReactNode;
}

const SalesCard: React.FC<SalesCardProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'SalesCard Component'}
    </div>
  );
};

export default SalesCard;
