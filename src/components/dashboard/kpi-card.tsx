'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Sparkline } from '@/components/charts/sparkline';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type DeltaDir = 'up' | 'down' | 'flat';

interface KpiCardProps {
  label: string;
  value: string | number;
  delta: string;
  deltaDir: DeltaDir;
  sub?: string;
  spark: number[];
  sparkColor: string;
  dark?: boolean;
}

export function KpiCard({ label, value, delta, deltaDir, sub, spark, sparkColor, dark = true }: KpiCardProps) {
  const deltaColor = deltaDir === 'up'   ? 'var(--atlas-status-ok)'
                   : deltaDir === 'down' ? 'var(--atlas-status-err)'
                   : 'var(--atlas-text-3)';
  return (
    <div
      className="rounded-[10px] border p-[14px]"
      style={{
        background: 'var(--atlas-surface)',
        borderColor: 'var(--atlas-border)',
      }}
    >
      <div
        className="font-mono text-[11px] uppercase tracking-[.06em]"
        style={{ color: 'var(--atlas-text-2)' }}
      >
        {label}
      </div>
      <div
        className="mt-2 text-[28px] font-semibold leading-none tracking-[-0.015em]"
        style={{
          color: 'var(--atlas-text)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span
          className="inline-flex items-center gap-[3px] font-mono text-[11px]"
          style={{ color: deltaColor }}
        >
          {deltaDir === 'up'   && <TrendingUp size={11} />}
          {deltaDir === 'down' && <TrendingDown size={11} />}
          {deltaDir === 'flat' && <Minus size={11} />}
          {delta}
          {sub && (
            <span style={{ color: 'var(--atlas-text-3)' }}>{sub}</span>
          )}
        </span>
        <div className="w-[110px] min-w-[40px] shrink">
          <Sparkline data={spark} color={sparkColor} dark={dark} />
        </div>
      </div>
    </div>
  );
}

export function KpiCardSkeleton() {
  return (
    <div
      className="rounded-[10px] border p-[14px]"
      style={{
        background: 'var(--atlas-surface)',
        borderColor: 'var(--atlas-border)',
      }}
    >
      <div className="animate-shimmer h-[11px] w-20 rounded" />
      <div className="animate-shimmer mt-3 h-7 w-28 rounded" />
      <div className="mt-3 flex items-center justify-between">
        <div className="animate-shimmer h-[11px] w-14 rounded" />
        <div className="animate-shimmer h-8 w-[110px] rounded" />
      </div>
    </div>
  );
}
