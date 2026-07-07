import React from 'react';

export interface FooterProps {
  className?: string;
  children?: React.ReactNode;
}

const Footer: React.FC<FooterProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'Footer Component'}
    </div>
  );
};

export default Footer;
