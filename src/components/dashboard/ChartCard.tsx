import React from 'react';

export interface ChartCardProps {
  className?: string;
  children?: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'ChartCard Component'}
    </div>
  );
};

export default ChartCard;
