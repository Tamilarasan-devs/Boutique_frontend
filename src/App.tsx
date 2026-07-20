import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { ToastProvider, ThemeProvider, AuthProvider, SettingsProvider, ConfirmProvider } from './context';
import { Toaster } from 'sonner';

import { SplashScreen } from './components/layout/SplashScreen';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ThemeProvider>
          <ToastProvider>
            <ConfirmProvider>
              <React.Suspense
                fallback={<SplashScreen />}
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
