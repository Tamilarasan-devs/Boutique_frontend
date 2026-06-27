import React from 'react';
import { Link, useRouteError, isRouteErrorResponse } from 'react-router-dom';

const ErrorLayout: React.FC = () => {
  const error = useRouteError();

  const is404 =
    isRouteErrorResponse(error) && error.status === 404;

  const title = is404 ? '404 – Page Not Found' : 'Oops! Something went wrong';
  const message = is404
    ? "The page you're looking for doesn't exist or has been moved."
    : "An unexpected error occurred. Please try again or contact support.";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Large error number */}
        <div className="text-[120px] font-black text-slate-200 leading-none select-none">
          {is404 ? '404' : '500'}
        </div>

        {/* Icon */}
        <div className="mt-2 mb-6 flex justify-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {is404 ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              )}
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-2">{title}</h1>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">{message}</p>

        <div className="flex items-center justify-center gap-3">
          <Link
            to="/"
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/30"
          >
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
          >
            Go Back
          </button>
        </div>

        {/* Branding */}
        <p className="mt-12 text-xs text-slate-400">
          Boutique CRM &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default ErrorLayout;
