import React from 'react';

export interface NotificationPanelProps {
  className?: string;
  children?: React.ReactNode;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'NotificationPanel Component'}
    </div>
  );
};

export default NotificationPanel;
