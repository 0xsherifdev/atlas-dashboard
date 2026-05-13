import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ActiveView = 'dashboard' | 'transactions';

interface UIState {
  dark: boolean;
  view: ActiveView;
  sidebarCollapsed: boolean;

  toggleTheme: () => void;
  setView: (v: ActiveView) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      dark: true,
      view: 'dashboard',
      sidebarCollapsed: false,

      toggleTheme: () => set((s) => ({ dark: !s.dark })),
      setView: (view) => set({ view }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    }),
    {
      name: 'atlas-ui',
      partialize: (s) => ({ dark: s.dark, sidebarCollapsed: s.sidebarCollapsed }),
    }
  )
);
