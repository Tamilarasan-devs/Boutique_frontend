import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';

// ─── Types ────────────────────────────────────────────────────────────────────
export type UserRole = 'owner' | 'manager' | 'sales_staff' | 'tailor' | 'receptionist';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
}

// ─── Role hierarchy (what each role can access) ───────────────────────────────
export const ROLE_PAGES: Record<UserRole, string[]> = {
  owner: ['*'], // all pages
  manager: [
    '/', '/crm/leads', '/crm/customers', '/crm/appointments', '/crm/followups',
    '/orders/quotations', '/orders/list', '/orders/production', '/orders/trial', '/orders/delivery',
    '/measurements', '/designs/library', '/designs/upload',
    '/inventory/fabrics', '/inventory/accessories', '/inventory/suppliers', '/inventory/purchases', '/inventory/stock',
    '/billing/invoice', '/billing/payments', '/staff/employees', '/staff/attendance',
    '/marketing/campaigns', '/marketing/whatsapp', '/marketing/email', '/marketing/loyalty',
    '/profile'
  ],
  sales_staff: [
    '/', '/crm/leads', '/crm/customers', '/crm/appointments', '/crm/followups',
    '/orders/quotations', '/orders/list', '/orders/trial', '/orders/delivery',
    '/measurements', '/billing/invoice', '/billing/payments',
    '/marketing/whatsapp', '/marketing/email',
    '/profile'
  ],
  tailor: [
    '/', '/orders/list', '/orders/production', '/orders/trial', '/orders/delivery',
    '/measurements', '/inventory/fabrics', '/inventory/accessories', '/inventory/stock',
    '/profile'
  ],
  receptionist: [
    '/', '/crm/leads', '/crm/customers', '/crm/appointments', '/crm/followups',
    '/orders/quotations', '/orders/list', '/billing/invoice',
    '/profile'
  ],
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
