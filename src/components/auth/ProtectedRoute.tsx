import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole, MODULE_ROUTES } from '../../context/AuthContext';
import { Loader2, Scissors } from 'lucide-react';
import { SplashScreen } from '../layout/SplashScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <SplashScreen />;
  }

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Super admin has access to everything
  if (user.role === 'super_admin') {
    return <>{children}</>;
  }

  // Owner has access to everything within their boutique
  if (user.role === 'owner') {
    return <>{children}</>;
  }

  // Check role-based access if specific roles are required
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Determine current module based on path
  const currentPath = location.pathname;
  let requiredModule: string | null = null;

  for (const [moduleName, routes] of Object.entries(MODULE_ROUTES)) {
    if (routes.some(route => currentPath.startsWith(route))) {
      requiredModule = moduleName;
      break;
    }
  }

  // Check module-specific permissions
  if (requiredModule && user.permissions) {
    const accessLevel = user.permissions[requiredModule];
    
    // If no access level is defined or it's 'None', deny access
    if (!accessLevel || accessLevel === 'None') {
      return <Navigate to="/" replace />;
    }

    // For editing/creating, we might want to check for 'Write' access
    // This can be expanded based on specific route needs
    const requiresWrite = currentPath.includes('/new') || currentPath.includes('/edit');
    if (requiresWrite && accessLevel === 'Read') {
      // Could redirect to a "Not Authorized" page instead
      return <Navigate to={currentPath.split('/new')[0].split('/edit')[0]} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
