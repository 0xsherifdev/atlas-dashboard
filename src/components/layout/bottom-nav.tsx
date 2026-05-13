'use client';

import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ArrowLeftRight, AlertTriangle, User } from 'lucide-react';
import { useTransactionStore } from '@/store/useTransactionStore';

interface NavItem {
  href: string | null;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { dashboard } = useTransactionStore();
  const flaggedCount = dashboard?.flaggedCount ?? 0;

  const items: NavItem[] = [
    { href: '/dashboard',    label: 'HOME',   icon: <LayoutDashboard size={20} /> },
    { href: '/transactions', label: 'TXNS',   icon: <ArrowLeftRight size={20} />, badge: flaggedCount > 0 ? flaggedCount : undefined },
    { href: null,            label: 'ALERTS', icon: <AlertTriangle size={20} /> },
    { href: null,            label: 'ME',     icon: <User size={20} /> },
  ];

  return (
    <nav
      className="flex border-t"
      style={{ background: 'var(--atlas-surface)', borderColor: 'var(--atlas-border)' }}
    >
      {items.map(({ href, label, icon, badge }) => (
        <button
          key={label}
          onClick={href ? () => router.push(href) : undefined}
          disabled={!href}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            paddingTop: 10,
            paddingBottom: 10,
            background: 'transparent',
            border: 'none',
            cursor: href ? 'pointer' : 'default',
            color: pathname === href ? 'var(--atlas-text)' : 'var(--atlas-text-3)',
            opacity: !href ? 0.4 : 1,
            fontFamily: "'Geist Mono', ui-monospace, Menlo, monospace",
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
          }}
        >
          <span className="relative">
            {icon}
            {badge !== undefined && (
              <span
                className="absolute -right-1 -top-1 inline-grid h-4 w-4 place-items-center rounded-full font-mono text-[8px] font-bold"
                style={{ background: 'var(--atlas-status-err)', color: '#fff' }}
              >{badge > 9 ? '9+' : badge}</span>
            )}
          </span>
          {label}
        </button>
      ))}
    </nav>
  );
}
