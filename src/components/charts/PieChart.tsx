import React from 'react';

export interface PieChartProps {
  className?: string;
  children?: React.ReactNode;
}

const PieChart: React.FC<PieChartProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'PieChart Component'}
    </div>
  );
};

export default PieChart;
