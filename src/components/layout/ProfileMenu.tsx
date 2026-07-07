import React from 'react';

export interface ProfileMenuProps {
  className?: string;
  children?: React.ReactNode;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ className, children }) => {
  return (
    <div className={className || ''}>
      {children || 'ProfileMenu Component'}
    </div>
  );
};

export default ProfileMenu;
