import React from 'react';

export interface ReportCardProps {
  className?: string;
  children?: React.ReactNode;
}

const ReportCard: React.FC<ReportCardProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'ReportCard Component'}
    </div>
  );
};

export default ReportCard;
