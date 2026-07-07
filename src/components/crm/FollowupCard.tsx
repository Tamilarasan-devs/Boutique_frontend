import React from 'react';

export interface FollowupCardProps {
  className?: string;
  children?: React.ReactNode;
}

const FollowupCard: React.FC<FollowupCardProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'FollowupCard Component'}
    </div>
  );
};

export default FollowupCard;
