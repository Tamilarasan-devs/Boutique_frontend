import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

// ─── Auth Store ──────────────────────────────────────────────────────────────
interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) =>
        set({ user, token, isAuthenticated: true }),
      clearAuth: () =>
        set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: 'boutique-auth' }
  )
);

// ─── UI Store ────────────────────────────────────────────────────────────────
interface UIStore {
  sidebarCollapsed: boolean;
  darkMode: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleDarkMode: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      darkMode: false,
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),
      toggleDarkMode: () =>
        set((s) => ({ darkMode: !s.darkMode })),
    }),
    { name: 'boutique-ui' }
  )
);

// ─── Notification Store ──────────────────────────────────────────────────────
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

interface NotificationStore {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>()((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (n) =>
    set((s) => {
      const newN: AppNotification = {
        ...n,
        id: crypto.randomUUID(),
        read: false,
        createdAt: new Date().toISOString(),
      };
      return {
        notifications: [newN, ...s.notifications],
        unreadCount: s.unreadCount + 1,
      };
    }),
  markAsRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, s.unreadCount - 1),
    })),
  markAllAsRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));