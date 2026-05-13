import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  dark: boolean;
  sidebarCollapsed: boolean;

  toggleTheme: () => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      dark: true,
      sidebarCollapsed: false,

      toggleTheme: () => set((s) => ({ dark: !s.dark })),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    }),
    {
      name: 'atlas-ui',
      partialize: (s) => ({ dark: s.dark, sidebarCollapsed: s.sidebarCollapsed }),
    }
  )
);
