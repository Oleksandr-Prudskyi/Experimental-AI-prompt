import { create } from 'zustand';

interface SidebarState {
  isOpen: boolean;
  open: () => void;
  toggle: () => void;
  close: () => void;
  adminCollapsed: boolean;
  toggleAdmin: () => void;
}

const storedCollapsed = typeof window !== 'undefined'
  ? localStorage.getItem('evidence-nav-collapsed') === 'true'
  : false;

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  close: () => set({ isOpen: false }),
  adminCollapsed: storedCollapsed,
  toggleAdmin: () => set((s) => {
    const next = !s.adminCollapsed;
    localStorage.setItem('evidence-nav-collapsed', String(next));
    return { adminCollapsed: next };
  }),
}));
