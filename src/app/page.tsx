'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { AppShell } from '@/components/layout/app-shell';
import { LoginForm } from '@/components/auth/login-form';
import { useUIStore } from '@/store/useUIStore';

export default function Home() {
  const { signedIn, _hasHydrated } = useAuthStore();
  const { dark } = useUIStore();

  // Don't render until Zustand has rehydrated from localStorage —
  // prevents the login form flashing briefly on refresh when already signed in.
  if (!_hasHydrated) return null;

  if (!signedIn) {
    return (
      <div className={dark ? 'dark' : ''} style={{ height: '100dvh', background: 'var(--atlas-bg)', color: 'var(--atlas-text)' }}>
        <LoginForm />
      </div>
    );
  }

  return <AppShell />;
}
