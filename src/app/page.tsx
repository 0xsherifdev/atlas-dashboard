'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { AppShell } from '@/components/layout/app-shell';
import { LoginForm } from '@/components/auth/login-form';
import { useUIStore } from '@/store/useUIStore';

export default function Home() {
  const { signedIn } = useAuthStore();
  const { dark } = useUIStore();

  if (!signedIn) {
    return (
      <div className={dark ? 'dark' : ''} style={{ height: '100vh', background: 'var(--atlas-bg)' }}>
        <LoginForm />
      </div>
    );
  }

  return <AppShell />;
}
