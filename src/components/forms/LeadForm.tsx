import React from 'react';

export interface LeadFormProps {
  className?: string;
  children?: React.ReactNode;
}

const LeadForm: React.FC<LeadFormProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'LeadForm Component'}
    </div>
  );
};

export default LeadForm;
