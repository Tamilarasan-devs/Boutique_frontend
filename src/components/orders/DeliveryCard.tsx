import React from 'react';

export interface DeliveryCardProps {
  className?: string;
  children?: React.ReactNode;
}

const DeliveryCard: React.FC<DeliveryCardProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'DeliveryCard Component'}
    </div>
  );
};

export default DeliveryCard;
