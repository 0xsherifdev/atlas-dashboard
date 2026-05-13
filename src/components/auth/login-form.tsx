'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ShieldCheck, KeyRound, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';
import { AtlasMark } from '@/components/ui/atlas-mark';

export function LoginForm() {
  const { signIn, loading, error, clearError } = useAuthStore();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const next: typeof fieldErrors = {};
    if (!email) next.email = 'Email is required';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) next.email = 'Enter a valid email address';
    if (!password) next.password = 'Password is required';
    else if (password.length < 8) next.password = 'Password must be at least 8 characters';
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;
    await signIn(email, password);
    // Navigate on success — signIn sets signedIn to true, error stays null
    if (!useAuthStore.getState().error) {
      router.push('/dashboard');
    }
  };

  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden"
      style={{ background: 'var(--atlas-bg)' }}
    >
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0"
          style={{
            background: `
              radial-gradient(900px 600px at 78% 22%, color-mix(in srgb, #3b82f6 10%, transparent), transparent 60%),
              radial-gradient(700px 500px at 12% 88%, color-mix(in srgb, #3b82f6 6%, transparent), transparent 60%)
            `,
          }}
        />
        {/* Hairline grid texture */}
        <div className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `
              linear-gradient(var(--atlas-border) 1px, transparent 1px),
              linear-gradient(90deg, var(--atlas-border) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, #000 30%, transparent 80%)',
            maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, #000 30%, transparent 80%)',
          }}
        />
      </div>

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-100 rounded-[14px] px-9 py-9 pb-8"
        style={{
          background: 'var(--atlas-surface)',
          border: '1px solid var(--atlas-border)',
          boxShadow: 'var(--atlas-shadow-lg)',
        }}
      >
        {/* Brand */}
        <div className="mb-6 flex items-center gap-2.25">
          <AtlasMark variant="on-blue" size={26} tile tileRadius={6} />
          <span className="text-[15px] font-semibold tracking-[-0.01em]"
            style={{ color: 'var(--atlas-text)' }}>
            Atlas Monitor
          </span>
          <span
            className="ml-auto rounded-[3px] px-1.5 py-px font-mono text-[10.5px]"
            style={{ background: 'var(--atlas-surface-2)', color: 'var(--atlas-text-3)' }}
          >v3.4</span>
        </div>

        <h1 className="mb-1 text-[22px] font-semibold tracking-[-0.02em]"
          style={{ color: 'var(--atlas-text)' }}>
          Sign in
        </h1>
        <p className="mb-6 text-[13px]" style={{ color: 'var(--atlas-text-2)' }}>
          Continue to your monitoring workspace.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="mb-3 flex flex-col gap-1.5">
            <label htmlFor="email"
              className="font-mono text-[11px] uppercase tracking-[.06em]"
              style={{ color: 'var(--atlas-text-2)' }}>
              Work email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="tolu@yourbank.ng"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                'h-9.5 w-full rounded-[7px] border px-3 text-[13.5px] outline-none',
                'transition-all duration-120',
                'focus:shadow-[0_0_0_3px_color-mix(in_srgb,#3b82f6_18%,transparent)]',
                fieldErrors.email ? 'border-(--atlas-status-err)' : 'border-(--atlas-border-2)',
              )}
              style={{
                background: 'var(--atlas-bg)',
                color: 'var(--atlas-text)',
                ['--tw-ring-color' as string]: 'color-mix(in srgb, #3b82f6 18%, transparent)',
              }}
            />
            {fieldErrors.email && (
              <p className="font-mono text-[11.5px]" style={{ color: 'var(--atlas-status-err)' }}>
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="mb-4 flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[.06em]"
              style={{ color: 'var(--atlas-text-2)' }}
            >
              <span>Password</span>
              <a
                href="#"
                className="normal-case tracking-normal"
                style={{ color: 'var(--atlas-text-3)', textDecoration: 'none', fontSize: 11 }}
                onClick={(e) => e.preventDefault()}
              >
                Forgot?
              </a>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  'h-[38px] w-full rounded-[7px] border px-3 pr-10 text-[13.5px] outline-none',
                  'transition-all duration-[120ms]',
                  'focus:shadow-[0_0_0_3px_color-mix(in_srgb,#3b82f6_18%,transparent)]',
                  fieldErrors.password ? 'border-(--atlas-status-err)' : 'border-(--atlas-border-2)',
                )}
                style={{
                  background: 'var(--atlas-bg)',
                  color: 'var(--atlas-text)',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 grid place-items-center"
                style={{ color: 'var(--atlas-text-3)', background: 'transparent', border: 0, cursor: 'pointer' }}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="font-mono text-[11.5px]" style={{ color: 'var(--atlas-status-err)' }}>
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Server error */}
          {error && (
            <div
              className="mb-3 flex items-center gap-2 rounded-[7px] px-3 py-[9px] text-[12.5px]"
              style={{ background: 'var(--atlas-bg-err)', color: 'var(--atlas-status-err)' }}
            >
              <AlertTriangle size={14} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={cn(
              'mt-1 flex h-10 w-full items-center justify-center gap-2',
              'rounded-[7px] text-[14px] font-medium',
              'transition-all duration-[120ms]',
              'disabled:cursor-not-allowed disabled:opacity-70',
            )}
            style={{
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <>
                <span
                  className="inline-block h-[14px] w-[14px] rounded-full border-2 border-current border-r-transparent"
                  style={{ animation: 'spin .8s linear infinite' }}
                />
                Verifying…
              </>
            ) : 'Sign in'}
          </button>
        </form>

        {/* Divider */}
        <div className="my-[18px] flex items-center gap-[10px]"
          style={{ color: 'var(--atlas-text-4)', fontSize: 10.5, fontFamily: "'Geist Mono', monospace" }}>
          <span className="flex-1 h-px" style={{ background: 'var(--atlas-border)' }} />
          <span>OR</span>
          <span className="flex-1 h-px" style={{ background: 'var(--atlas-border)' }} />
        </div>

        {/* SSO / Passkey */}
        <div className="flex gap-2">
          {[
            { label: 'SSO', icon: <ShieldCheck size={14} /> },
            { label: 'Passkey', icon: <KeyRound size={14} /> },
          ].map(({ label, icon }) => (
            <button
              key={label}
              type="button"
              title="Coming soon"
              className={cn(
                'flex flex-1 items-center justify-center gap-[6px] rounded-[6px] text-[13px] font-medium h-9',
                'border border-(--atlas-border) bg-(--atlas-surface) text-(--atlas-text)',
                'hover:bg-(--atlas-hover) transition-colors duration-[120ms] cursor-pointer',
              )}
            >
              {icon}{label}
            </button>
          ))}
        </div>

        {/* Hint */}
        <p className="mt-4 text-center font-mono text-[11px]" style={{ color: 'var(--atlas-text-3)' }}>
          Tip — type{' '}
          <code
            className="rounded-[3px] px-[5px] py-px"
            style={{ background: 'var(--atlas-surface-2)' }}
          >wrongpass</code>
          {' '}as the password to see the error state.
        </p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-[18px] left-0 right-0 z-10 flex justify-center gap-4 font-mono text-[11px]"
        style={{ color: 'var(--atlas-text-3)' }}>
        {['SOC 2 Type II', 'ISO 27001', 'PCI DSS L1', 'NDPR compliant'].map((s, i) => (
          <span key={i} className="flex items-center gap-[5px]">
            <span className="inline-block w-1 h-1 rounded-full opacity-50 bg-current" />
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
