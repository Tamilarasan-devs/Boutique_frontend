import React from 'react';

export interface MeasurementFormProps {
  className?: string;
  children?: React.ReactNode;
}

const MeasurementForm: React.FC<MeasurementFormProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'MeasurementForm Component'}
    </div>
  );
};

export default MeasurementForm;
