import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login } from '@/lib/api';

interface User {
  name: string;
  role: string;
}

interface AuthState {
  signedIn: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;

  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      signedIn: false,
      user: null,
      token: null,
      loading: false,
      error: null,

      signIn: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const { token, user } = await login(email, password);
          set({ signedIn: true, user, token, loading: false });
        } catch (e) {
          set({ loading: false, error: (e as Error).message });
        }
      },

      signOut: () => {
        set({ signedIn: false, user: null, token: null, error: null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'atlas-auth',
      // Only persist the session, not loading/error UI state
      partialize: (state) => ({
        signedIn: state.signedIn,
        user: state.user,
        token: state.token,
      }),
    }
  )
);
