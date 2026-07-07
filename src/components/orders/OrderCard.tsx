import React from 'react';

export interface OrderCardProps {
  className?: string;
  children?: React.ReactNode;
}

const OrderCard: React.FC<OrderCardProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'OrderCard Component'}
    </div>
  );
};

export default OrderCard;
