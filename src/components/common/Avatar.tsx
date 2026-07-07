import React from 'react';

export interface AvatarProps {
  className?: string;
  children?: React.ReactNode;
}

const Avatar: React.FC<AvatarProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'Avatar Component'}
    </div>
  );
};

export default Avatar;
