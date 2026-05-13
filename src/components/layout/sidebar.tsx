'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Users,
  BellRing,
  ListChecks,
  ShieldAlert,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useWebSocketStore } from '@/store/useWebSocketStore';
import { AtlasMark } from '@/components/ui/atlas-mark';

interface NavItem {
  href?: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  disabled?: boolean;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { dashboard } = useTransactionStore();
  const { connected, latency } = useWebSocketStore();

  const flaggedCount = dashboard?.flaggedCount ?? 0;

  const monitorItems: NavItem[] = [
    { href: '/dashboard',    label: 'Dashboard',    icon: <LayoutDashboard size={14} /> },
    { href: '/transactions', label: 'Transactions', icon: <ArrowLeftRight size={14} />, badge: flaggedCount > 0 ? flaggedCount : undefined },
    { label: 'Customers', icon: <Users size={14} />, disabled: true },
    { label: 'Alerts',    icon: <BellRing size={14} />, disabled: true },
  ];

  const configureItems: NavItem[] = [
    { label: 'Rules',      icon: <ListChecks size={14} />,  disabled: true },
    { label: 'Sanctions',  icon: <ShieldAlert size={14} />, disabled: true },
    { label: 'Settings',   icon: <Settings size={14} />,    disabled: true },
  ];

  return (
    <aside
      className="flex h-full w-[220px] shrink-0 flex-col gap-6 border-r px-3 py-4"
      style={{
        background: 'var(--atlas-surface)',
        borderColor: 'var(--atlas-border)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 pt-1">
        <AtlasMark variant="on-blue" size={22} tile tileRadius={5} />
        <span className="text-[15px] font-semibold tracking-[-0.01em]"
          style={{ color: 'var(--atlas-text)' }}>
          Atlas
        </span>
        <span
          className="ml-auto font-mono text-[10px]"
          style={{ color: 'var(--atlas-text-3)' }}
        >v3.4</span>
      </div>

      {/* Monitor section */}
      <div>
        <p className="mb-[6px] px-[10px] font-mono text-[10px] font-semibold uppercase tracking-[.08em]"
          style={{ color: 'var(--atlas-text-4)' }}>
          Monitor
        </p>
        <nav className="flex flex-col gap-px">
          {monitorItems.map((item) => (
            <NavButton
              key={item.label}
              item={item}
              active={item.href === pathname}
              onClick={item.href && !item.disabled ? () => router.push(item.href!) : undefined}
            />
          ))}
        </nav>
      </div>

      {/* Configure section */}
      <div>
        <p className="mb-[6px] px-[10px] font-mono text-[10px] font-semibold uppercase tracking-[.08em]"
          style={{ color: 'var(--atlas-text-4)' }}>
          Configure
        </p>
        <nav className="flex flex-col gap-px">
          {configureItems.map((item) => (
            <NavButton key={item.label} item={item} active={false} />
          ))}
        </nav>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Live status */}
      <div
        className="flex items-center gap-2 rounded-[6px] px-[10px] py-2 font-mono text-[11px]"
        style={{ background: 'var(--atlas-surface-2)', color: 'var(--atlas-text-2)' }}
      >
        <span
          className={cn(
            'inline-block h-[6px] w-[6px] flex-shrink-0 rounded-full',
            connected ? 'animate-live-pulse' : 'opacity-30',
          )}
          style={{
            background: connected ? 'var(--atlas-status-ok)' : 'var(--atlas-text-3)',
            color: connected ? 'var(--atlas-status-ok)' : 'var(--atlas-text-3)',
          }}
        />
        <span>{connected ? 'Live · streaming' : 'Connecting…'}</span>
        {connected && (
          <span className="ml-auto opacity-60">{latency}ms</span>
        )}
      </div>
    </aside>
  );
}

function NavButton({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={item.disabled}
      className={cn(
        'flex w-full items-center gap-[9px] rounded-[6px] px-[10px] py-[7px] text-left text-[13.5px]',
        'transition-[background,color] duration-[120ms]',
        'disabled:cursor-default disabled:opacity-40',
        active
          ? 'font-medium'
          : 'cursor-pointer',
      )}
      style={{
        background: active ? 'var(--atlas-selected)' : 'transparent',
        color: active ? 'var(--atlas-text)' : 'var(--atlas-text-2)',
        border: 'none',
      }}
      onMouseEnter={(e) => {
        if (!active && !item.disabled) {
          e.currentTarget.style.background = 'var(--atlas-hover)';
          e.currentTarget.style.color = 'var(--atlas-text)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--atlas-text-2)';
        }
      }}
    >
      <span className="flex-shrink-0">{item.icon}</span>
      <span className="flex-1">{item.label}</span>
      {item.badge !== undefined && (
        <span
          key={item.badge}
          className="animate-badge-pop rounded-[3px] px-[5px] py-px font-mono text-[10.5px] font-semibold"
          style={{ background: 'var(--atlas-bg-err)', color: 'var(--atlas-status-err)' }}
        >
          {item.badge}
        </span>
      )}
    </button>
  );
}
