import React from 'react';

export interface LineChartProps {
  className?: string;
  children?: React.ReactNode;
}

const LineChart: React.FC<LineChartProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'LineChart Component'}
    </div>
  );
};

export default LineChart;
