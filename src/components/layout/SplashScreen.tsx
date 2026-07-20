import React from 'react';
import logo from '../../assets/logo1.png';

export const SplashScreen: React.FC = () => {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #e8dcc4 0%, #d9cdb4 20%, #8a8791 45%, #3d3f56 70%, #1b1c30 100%)',
      }}
    >
      <div className="relative z-10 flex flex-col items-center justify-center animate-pulse duration-1000">
        <img
          src={logo}
          alt="Gesdemn Logo"
          className="w-48 md:w-64 h-auto object-contain drop-shadow-2xl"
        />
      </div>
    </div>
  );
};