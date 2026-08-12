import { create } from 'zustand';
import type { User } from '@evidence/shared';

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  setInitializing: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isInitializing: true,
  setAuth: (accessToken, user) => set({ accessToken, user, isAuthenticated: true, isInitializing: false }),
  logout: () => set({ accessToken: null, user: null, isAuthenticated: false, isInitializing: false }),
  setInitializing: (isInitializing) => set({ isInitializing }),
}));
