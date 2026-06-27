import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { ToastProvider, ThemeProvider } from './context';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <React.Suspense
          fallback={
            <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
                <p className="text-sm font-medium">Loading Boutique CRM…</p>
              </div>
            </div>
          }
        >
          <RouterProvider router={router} />
        </React.Suspense>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
