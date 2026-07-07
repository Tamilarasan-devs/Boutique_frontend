import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { ToastProvider, ThemeProvider, AuthProvider, SettingsProvider } from './context';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ThemeProvider>
          <ToastProvider>
            <React.Suspense
              fallback={
                <div className="flex h-screen w-screen items-center justify-center bg-[#F4F3F8]">
                  <div className="flex flex-col items-center gap-3 text-[#16132D]/40">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#7209B7]" />
                    <p className="text-sm font-medium font-serif">Loading Boutique CRM…</p>
                  </div>
                </div>
              }
            >
              <RouterProvider router={router} />
            </React.Suspense>
          </ToastProvider>
        </ThemeProvider>
      </SettingsProvider>
    </AuthProvider>
  );
};

export default App;
