import React from 'react';

export interface AccordionProps {
  className?: string;
  children?: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'Accordion Component'}
    </div>
  );
};

export default Accordion;
