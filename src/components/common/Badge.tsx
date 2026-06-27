import React from 'react';

export interface BadgeProps {
  className?: string;
  children?: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'Badge Component'}
    </div>
  );
};

export default Badge;
