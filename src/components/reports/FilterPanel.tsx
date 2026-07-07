import React from 'react';

export interface FilterPanelProps {
  className?: string;
  children?: React.ReactNode;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'FilterPanel Component'}
    </div>
  );
};

export default FilterPanel;
