import React from 'react';

export interface ProductCardProps {
  className?: string;
  children?: React.ReactNode;
}

const ProductCard: React.FC<ProductCardProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'ProductCard Component'}
    </div>
  );
};

export default ProductCard;
