import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';

// ─── Types ────────────────────────────────────────────────────────────────────
export type UserRole = 'owner' | 'manager' | 'sales_staff' | 'tailor' | 'receptionist';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: Record<string, 'Full' | 'Read' | 'None'>;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
}

// ─── Module to Routes Mapping ────────────────────────────────────────────────
export const MODULE_ROUTES: Record<string, string[]> = {
  'Dashboard': ['/'],
  'CRM': ['/crm'],
  'Orders': ['/orders/quotations', '/orders/list', '/orders/trial', '/orders/delivery'],
  'Production': ['/orders/production'], // Specific sub-route of orders
  'Measurements': ['/measurements'],
  'Inventory': ['/inventory'],
  'Billing': ['/billing'],
  'Staff Management': ['/staff'],
  'Marketing': ['/marketing'],
  'Admin Settings': ['/settings', '/profile'],
};

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: restore session from localStorage
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('boutique_token');
      const stored = localStorage.getItem('boutique_user');
      if (token && stored) {
        try {
          setUser(JSON.parse(stored));
          // Verify token is still valid
          await authApi.getMe();
        } catch {
          localStorage.removeItem('boutique_token');
          localStorage.removeItem('boutique_user');
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: userData } = await authApi.login({ email, password });
    localStorage.setItem('boutique_token', token);
    localStorage.setItem('boutique_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('boutique_token');
    localStorage.removeItem('boutique_user');
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (...roles: UserRole[]) => !!user && roles.includes(user.role),
    [user]
  );

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
