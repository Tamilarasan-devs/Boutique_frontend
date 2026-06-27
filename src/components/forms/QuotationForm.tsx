import React from 'react';

export interface QuotationFormProps {
  className?: string;
  children?: React.ReactNode;
}

const QuotationForm: React.FC<QuotationFormProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'QuotationForm Component'}
    </div>
  );
};

export default QuotationForm;
