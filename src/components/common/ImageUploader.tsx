import React from 'react';

export interface ImageUploaderProps {
  className?: string;
  children?: React.ReactNode;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'ImageUploader Component'}
    </div>
  );
};

export default ImageUploader;
