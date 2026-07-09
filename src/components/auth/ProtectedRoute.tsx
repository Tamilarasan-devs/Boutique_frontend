import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole, MODULE_ROUTES } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F4F3F8]">
        <div className="flex flex-col items-center gap-3 text-[#16132D]/50">
          <Loader2 className="w-8 h-8 animate-spin text-[#7209B7]" />
          <p className="text-sm font-semibold font-serif">Loading…</p>
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
