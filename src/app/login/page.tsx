'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  const { signedIn, _hasHydrated } = useAuthStore();
  const { dark } = useUIStore();
  const router = useRouter();

  useEffect(() => {
    if (_hasHydrated && signedIn) {
      router.replace('/dashboard');
    }
  }, [_hasHydrated, signedIn, router]);

  if (!_hasHydrated || signedIn) return null;

  return (
    <div
      className={dark ? 'dark' : ''}
      style={{ height: '100dvh', background: 'var(--atlas-bg)', color: 'var(--atlas-text)' }}
    >
      <LoginForm />
    </div>
  );
}
