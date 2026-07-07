import React from 'react';

export interface TaskCardProps {
  className?: string;
  children?: React.ReactNode;
}

const TaskCard: React.FC<TaskCardProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'TaskCard Component'}
    </div>
  );
};

export default TaskCard;
