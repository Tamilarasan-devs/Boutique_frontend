import React from 'react';

export interface LeadCardProps {
  className?: string;
  children?: React.ReactNode;
}

const LeadCard: React.FC<LeadCardProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'LeadCard Component'}
    </div>
  );
};

export default LeadCard;
