import { useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth.store';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1';

export function useAuthInit() {
  const isInitializing = useAuthStore((s) => s.isInitializing);

  useEffect(() => {
    let cancelled = false;

    async function tryRestore() {
      try {
        const res = await axios.post(`${API_BASE}/auth/refresh`, {}, { withCredentials: true });
        if (cancelled) return;
        const { accessToken, user } = res.data.data;
        useAuthStore.getState().setAuth(accessToken, user);
      } catch {
        if (cancelled) return;
        useAuthStore.getState().logout();
      }
    }

    tryRestore();

    return () => { cancelled = true; };
  }, []);

  return isInitializing;
}
