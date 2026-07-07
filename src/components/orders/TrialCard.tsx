import React from 'react';

export interface TrialCardProps {
  className?: string;
  children?: React.ReactNode;
}

const TrialCard: React.FC<TrialCardProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'TrialCard Component'}
    </div>
  );
};

export default TrialCard;
