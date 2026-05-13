'use client';

import { cn } from '@/lib/utils';
import type { TransactionStatus, RiskLevel } from '@/types';
import { STATUS_META, type StatusVariant } from '@/lib/utils';

// ─── Variant styles ───────────────────────────────────────────────────────────

const variantStyles: Record<StatusVariant, string> = {
  ok:   'text-(--atlas-status-ok)   bg-(--atlas-bg-ok)',
  warn: 'text-(--atlas-status-warn) bg-(--atlas-bg-warn)',
  err:  'text-(--atlas-status-err)  bg-(--atlas-bg-err)',
  info: 'text-(--atlas-status-info) bg-(--atlas-bg-info)',
  mute: 'text-(--atlas-status-mute) bg-(--atlas-bg-mute) border border-(--atlas-border)',
};

// ─── StatusPill ───────────────────────────────────────────────────────────────

interface StatusPillProps {
  status: TransactionStatus;
  className?: string;
}

export function StatusPill({ status, className }: StatusPillProps) {
  const meta = STATUS_META[status] ?? STATUS_META.pending;
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-[7px] py-px rounded-[4px]',
      'text-[11px] font-medium font-mono uppercase tracking-[.04em] leading-[18px]',
      variantStyles[meta.variant],
      className,
    )}>
      <span className="w-[5px] h-[5px] rounded-full bg-current" />
      {meta.label}
    </span>
  );
}

// ─── RiskPill ─────────────────────────────────────────────────────────────────

const riskStyles: Record<RiskLevel, { pill: string; bar: string }> = {
  low:      { pill: 'text-(--atlas-status-ok)   bg-(--atlas-bg-ok)',   bar: '#10b981' },
  medium:   { pill: 'text-(--atlas-status-warn) bg-(--atlas-bg-warn)', bar: '#f59e0b' },
  high:     { pill: 'text-(--atlas-status-err)  bg-(--atlas-bg-err)',  bar: '#ef4444' },
  critical: { pill: 'text-(--atlas-status-err)  bg-(--atlas-bg-err)  font-semibold', bar: '#ef4444' },
};

interface RiskPillProps {
  risk: RiskLevel;
  score: number;
  className?: string;
}

export function RiskPill({ risk, score, className }: RiskPillProps) {
  const { pill, bar } = riskStyles[risk];
  const pct = Math.max(8, Math.min(100, score));
  return (
    <span className={cn(
      'inline-flex items-center gap-[6px] px-[4px] pr-[7px] py-px rounded-[4px]',
      'text-[11px] font-mono leading-[18px]',
      pill, className,
    )}>
      <span className="w-[18px] h-[5px] rounded-[2px] bg-(--atlas-border-2) overflow-hidden flex-shrink-0">
        <i className="block h-full rounded-[2px]" style={{ width: pct + '%', background: bar }} />
      </span>
      <span>{score}</span>
    </span>
  );
}
