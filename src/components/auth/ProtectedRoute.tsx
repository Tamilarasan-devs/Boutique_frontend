import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole, MODULE_ROUTES } from '../../context/AuthContext';
import { Scissors } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
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
    );
  }

  // Not logged in → redirect to login
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Owner bypasses all role checks
  if (user.role === 'owner') {
    return <>{children}</>;
  }

  const permissions = user.permissions || {};
  
  const isPathAllowed = () => {
    if (user.role === 'owner') return true;

    // Check each module in the permissions matrix
    for (const [moduleName, accessLevel] of Object.entries(permissions)) {
      if (accessLevel === 'None') continue;
      
      const routes = MODULE_ROUTES[moduleName] || [];
      const matches = routes.some(r => location.pathname === r || location.pathname.startsWith(r + '/'));
      if (matches) return true;
    }
    return false;
  };

  if (!isPathAllowed()) {
    return <AccessDenied />;
  }

  // Additional role check if caller specified allowed roles explicitly
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <AccessDenied />;
  }

  return <>{children}</>;
};

const AccessDenied: React.FC = () => (
  <div className="flex h-full min-h-screen items-center justify-center bg-[#F4F3F8] p-8">
    <div className="text-center max-w-sm">
      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#F43F5E]/10 border border-[#F43F5E]/15 flex items-center justify-center">
        <span className="text-3xl">🔒</span>
      </div>
      <h2 className="text-2xl font-serif font-semibold text-[#16132D] mb-2">Access Restricted</h2>
      <p className="text-sm text-[#16132D]/55 mb-6">
        You don't have permission to access this page. Please contact your boutique owner to request access.
      </p>
      <a
        href="/"
        className="inline-block px-6 py-2.5 bg-[#16132D] hover:bg-[#2a3545] text-[#F4F3F8] rounded-xl text-sm font-semibold transition shadow-md shadow-[#16132D]/10"
      >
        Back to Dashboard
      </a>
    </div>
  </div>
);

export default ProtectedRoute;
