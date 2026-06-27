import React from 'react';

export interface AreaChartProps {
  className?: string;
  children?: React.ReactNode;
}

const AreaChart: React.FC<AreaChartProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'AreaChart Component'}
    </div>
  );
};

export default AreaChart;
