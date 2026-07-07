import React from 'react';

export interface ModalProps {
  className?: string;
  children?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'Modal Component'}
    </div>
  );
};

export default Modal;
