import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => {
  const stored = localStorage.getItem('evidence-theme') as Theme | null;
  const initial = stored || 'light';
  document.documentElement.classList.toggle('dark', initial === 'dark');

  return {
    theme: initial,
    toggle: () =>
      set((state) => {
        const next = state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('evidence-theme', next);
        document.documentElement.classList.toggle('dark', next === 'dark');
        return { theme: next };
      }),
    setTheme: (theme) => {
      localStorage.setItem('evidence-theme', theme);
      document.documentElement.classList.toggle('dark', theme === 'dark');
      set({ theme });
    },
  };
});
