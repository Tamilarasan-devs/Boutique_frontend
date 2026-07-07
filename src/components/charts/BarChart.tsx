import React from 'react';

export interface BarChartProps {
  className?: string;
  children?: React.ReactNode;
}

const BarChart: React.FC<BarChartProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'BarChart Component'}
    </div>
  );
};

export default BarChart;
