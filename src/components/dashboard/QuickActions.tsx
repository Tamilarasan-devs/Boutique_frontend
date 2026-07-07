import React from 'react';

export interface QuickActionsProps {
  className?: string;
  children?: React.ReactNode;
}

const QuickActions: React.FC<QuickActionsProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'QuickActions Component'}
    </div>
  );
};

export default QuickActions;
