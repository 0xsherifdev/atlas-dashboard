import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { RiskLevel, TransactionStatus, Currency } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Currency formatters ──────────────────────────────────────────────────────

const CCY_SYM: Record<string, string> = {
  NGN: '₦', USD: '$', EUR: '€', GBP: '£', JPY: '¥', INR: '₹', BRL: 'R$',
};

export function fmtCcy(amount: number, ccy: Currency | string = 'NGN', short = false): string {
  const sym = CCY_SYM[ccy] ?? ccy + ' ';
  const isWhole = ccy === 'NGN' || ccy === 'JPY';

  if (short && Math.abs(amount) >= 1000) {
    const abs = Math.abs(amount);
    if (abs >= 1_000_000) return sym + (amount / 1_000_000).toFixed(amount >= 10_000_000 ? 1 : 2) + 'M';
    return sym + (amount / 1000).toFixed(amount >= 10_000 ? 1 : 2) + 'K';
  }

  return sym + amount.toLocaleString('en-US', isWhole
    ? { minimumFractionDigits: 0, maximumFractionDigits: 0 }
    : { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Time formatters ──────────────────────────────────────────────────────────

export function fmtTime(ts: number, ref = Date.now()): string {
  const diff = ref - ts;
  if (diff < 60_000)    return Math.max(1, Math.floor(diff / 1000)) + 's ago';
  if (diff < 3_600_000)  return Math.floor(diff / 60_000) + 'm ago';
  if (diff < 86_400_000) return Math.floor(diff / 3_600_000) + 'h ago';
  const days = Math.floor(diff / 86_400_000);
  if (days < 7) return days + 'd ago';
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function fmtDateTime(ts: number): string {
  return new Date(ts).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

export function fmtTimeOnly(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });
}

// ─── String helpers ───────────────────────────────────────────────────────────

export function initials(name: string): string {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

// ─── Risk / status meta ───────────────────────────────────────────────────────

export type StatusVariant = 'ok' | 'warn' | 'err' | 'info' | 'mute';

export const STATUS_META: Record<TransactionStatus, { variant: StatusVariant; label: string }> = {
  completed: { variant: 'ok',   label: 'completed' },
  pending:   { variant: 'info', label: 'pending'   },
  flagged:   { variant: 'err',  label: 'flagged'   },
  blocked:   { variant: 'err',  label: 'blocked'   },
  review:    { variant: 'warn', label: 'review'    },
  reversed:  { variant: 'mute', label: 'reversed'  },
};

export function riskBarColor(rs: number, dark: boolean): string {
  if (rs >= 80) return '#ef4444';
  if (rs >= 60) return '#f59e0b';
  if (rs >= 35) return dark ? '#a1a1aa' : '#71717a';
  return '#10b981';
}

/** Stable avatar background color per customer/entity ID */
export function avatarColor(id: string): string {
  const colors = [
    '#6366f1','#8b5cf6','#ec4899','#f43f5e',
    '#f97316','#eab308','#22c55e','#14b8a6',
    '#3b82f6','#06b6d4',
  ];
  const idx = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
  return colors[idx];
}
