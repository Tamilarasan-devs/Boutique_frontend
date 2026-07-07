import React from 'react';

export interface FileUploadProps {
  className?: string;
  children?: React.ReactNode;
}

const FileUpload: React.FC<FileUploadProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'FileUpload Component'}
    </div>
  );
};

export default FileUpload;
