import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { ToastProvider, ThemeProvider, AuthProvider, SettingsProvider, ConfirmProvider } from './context';
import { Toaster } from 'sonner';

import { Scissors } from 'lucide-react';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ThemeProvider>
          <ToastProvider>
            <ConfirmProvider>
              <React.Suspense
                fallback={
                  <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#16132D] z-[9999]">
                    <div className="relative flex flex-col items-center justify-center animate-pulse duration-1000">
                      <div className="absolute inset-0 bg-[#7209B7] blur-3xl opacity-20 rounded-full w-32 h-32 m-auto animate-ping" />
                      <div className="w-20 h-20 bg-gradient-to-br from-[#7209B7] to-[#8338EC] rounded-2xl flex items-center justify-center shadow-lg shadow-[#7209B7]/30 mb-6 relative z-10 transform transition-transform hover:scale-105">
                        <Scissors className="w-10 h-10 text-white" />
                      </div>
                      <h1 className="text-3xl font-bold text-white font-serif tracking-tight">GESDEMN</h1>
                      <p className="text-[#F4F3F8]/50 text-sm tracking-widest uppercase font-semibold mt-2">Boutique CRM</p>
                      
                      <div className="mt-8 flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#7209B7] animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 rounded-full bg-[#7209B7] animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 rounded-full bg-[#7209B7] animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                }
              >
                <RouterProvider router={router} />
                <Toaster position="top-right" richColors />
              </React.Suspense>
            </ConfirmProvider>
          </ToastProvider>
        </ThemeProvider>
      </SettingsProvider>
    </AuthProvider>
  );
};

export default App;
