import React from 'react';

export interface UpcomingDeliveryProps {
  className?: string;
  children?: React.ReactNode;
}

const UpcomingDelivery: React.FC<UpcomingDeliveryProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'UpcomingDelivery Component'}
    </div>
  );
};

export default UpcomingDelivery;
