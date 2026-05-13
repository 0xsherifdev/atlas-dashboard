'use client';

import { Search, Sun, Moon, RefreshCw, Bell } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { initials } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { AtlasMark } from '@/components/ui/atlas-mark';

export function Topbar() {
  const { dark, toggleTheme, view } = useUIStore();
  const { loadDashboard, loadTransactions } = useTransactionStore();
  const { user } = useAuthStore();

  const handleRefresh = () => {
    loadDashboard();
    loadTransactions();
  };

  const name = user?.name ?? 'Sherifdeen Adebayo';
  const role = user?.role ?? 'Senior Analyst';
  const pageTitle = view === 'dashboard' ? 'Overview' : 'Transactions';

  return (
    <div
      className="border-b"
      style={{ background: 'var(--atlas-surface)', borderColor: 'var(--atlas-border)' }}
    >
      {/* ── Mobile header ─────────────────────────────────────────────── */}
      <div className="flex md:hidden min-h-14 items-center gap-3 px-4">
        <AtlasMark variant="on-blue" size={20} tile tileRadius={4} />
        <span
          className="flex-1 text-[17px] font-semibold tracking-[-0.01em]"
          style={{ color: 'var(--atlas-text)' }}
        >
          {pageTitle}
        </span>
        <IconButton onClick={toggleTheme} title={dark ? 'Switch to light' : 'Switch to dark'}>
          {dark ? <Sun size={14} /> : <Moon size={14} />}
        </IconButton>
        <IconButton title="Notifications">
          <Bell size={14} />
          <span
            className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full"
            style={{ background: 'var(--atlas-status-err)', boxShadow: '0 0 0 2px var(--atlas-surface)' }}
          />
        </IconButton>
      </div>

      {/* ── Desktop header ────────────────────────────────────────────── */}
      <div className="hidden md:flex min-h-14 items-center gap-3 px-6">
        {/* Search */}
        <div
          className="flex max-w-[480px] flex-1 items-center gap-2 rounded-[7px] border px-[10px] py-[6px] text-[13px]"
          style={{
            background: 'var(--atlas-bg)',
            borderColor: 'var(--atlas-border)',
            color: 'var(--atlas-text-2)',
          }}
        >
          <Search size={13} className="flex-shrink-0 opacity-60" />
          <input
            placeholder="Search transactions, customers, refs…"
            className="flex-1 border-0 bg-transparent text-[13px] outline-none"
            style={{ color: 'var(--atlas-text)' }}
            readOnly
          />
          <span
            className="rounded-[3px] border px-[5px] py-px font-mono text-[10.5px]"
            style={{
              background: 'var(--atlas-surface-2)',
              borderColor: 'var(--atlas-border)',
              color: 'var(--atlas-text-3)',
            }}
          >⌘K</span>
        </div>

        <div className="flex-1" />

        {/* Theme toggle */}
        <IconButton onClick={toggleTheme} title={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
          {dark ? <Sun size={14} /> : <Moon size={14} />}
        </IconButton>

        {/* Refresh */}
        <IconButton onClick={handleRefresh} title="Refresh data">
          <RefreshCw size={14} />
        </IconButton>

        {/* Notifications */}
        <IconButton title="Notifications">
          <Bell size={14} />
          <span
            className="absolute right-[6px] top-[6px] h-[6px] w-[6px] rounded-full"
            style={{
              background: 'var(--atlas-status-err)',
              boxShadow: '0 0 0 2px var(--atlas-surface)',
            }}
          />
        </IconButton>

        {/* Profile */}
        <div
          className="flex cursor-pointer items-center gap-2 rounded-[18px] border pl-1 pr-[10px] py-1"
          style={{
            background: 'var(--atlas-surface)',
            borderColor: 'var(--atlas-border)',
          }}
        >
          <span
            className="inline-grid h-6 w-6 place-items-center rounded-full font-mono text-[10px] font-bold"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: '#fff',
            }}
          >
            {initials(name)}
          </span>
          <div className="text-[12.5px] leading-tight">
            <div className="font-medium" style={{ color: 'var(--atlas-text)' }}>{name}</div>
            <div className="font-mono text-[10.5px]" style={{ color: 'var(--atlas-text-3)' }}>{role}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconButton({
  onClick,
  title,
  children,
}: {
  onClick?: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="relative inline-grid h-8 w-8 place-items-center rounded-[6px] border transition-[background,color] duration-[120ms] cursor-pointer"
      style={{
        background: 'var(--atlas-surface)',
        borderColor: 'var(--atlas-border)',
        color: 'var(--atlas-text-2)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--atlas-hover)';
        e.currentTarget.style.color = 'var(--atlas-text)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--atlas-surface)';
        e.currentTarget.style.color = 'var(--atlas-text-2)';
      }}
    >
      {children}
    </button>
  );
}
