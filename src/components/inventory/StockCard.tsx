import React from 'react';

export interface StockCardProps {
  className?: string;
  children?: React.ReactNode;
}

const StockCard: React.FC<StockCardProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'StockCard Component'}
    </div>
  );
};

export default StockCard;
