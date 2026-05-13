'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useUIStore } from '@/store/useUIStore';
import { KpiCard, KpiCardSkeleton } from './kpi-card';
import { ActivityHistogram } from '@/components/charts/activity-histogram';
import { RiskDistribution } from '@/components/charts/risk-distribution';
import { RiskPill } from '@/components/ui/status-pill';
import { AtlasAvatar } from '@/components/ui/atlas-avatar';
import { fmtCcy, fmtTime } from '@/lib/utils';

const ACCENT = '#3b82f6';

type TimeRange = '24H' | '7D' | '30D' | 'Custom…';
const TIME_RANGES: TimeRange[] = ['24H', '7D', '30D', 'Custom…'];

export function DashboardScreen() {
  const { dashboard, dashLoading, dashError, loadDashboard } = useTransactionStore();
  const { dark } = useUIStore();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<TimeRange>('24H');

  useEffect(() => {
    if (!dashboard) loadDashboard();
  }, []);

  if (dashLoading) return <DashboardSkeleton />;

  if (dashError) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center">
        <div
          className="mb-4 inline-grid h-11 w-11 place-items-center rounded-[8px]"
          style={{ background: 'var(--atlas-surface-2)', color: 'var(--atlas-status-err)' }}
        >
          <AlertTriangle size={20} />
        </div>
        <h3 className="mb-1 text-base font-semibold" style={{ color: 'var(--atlas-text)' }}>
          Couldn&apos;t load dashboard
        </h3>
        <p className="mb-4 max-w-xs text-[13px]" style={{ color: 'var(--atlas-text-3)' }}>
          The metrics service returned 503. Atlas will retry automatically.
        </p>
        <button
          onClick={() => loadDashboard()}
          className="inline-flex items-center gap-[6px] rounded-[6px] border px-3 py-[6px] text-[13px] font-medium transition-colors duration-[120ms]"
          style={{
            background: 'var(--atlas-surface)',
            borderColor: 'var(--atlas-border)',
            color: 'var(--atlas-text)',
          }}
        >
          <RefreshCw size={13} /> Retry now
        </button>
      </div>
    );
  }

  if (!dashboard) return null;

  const { totalTransactions, flaggedCount, activeCustomers, avgRiskScore,
          totalVolumeNGN, activityBins, riskDistribution, topAlerts,
          recentFlagged, spark, deltaTransactions, deltaFlagged,
          deltaCustomers, deltaRisk } = dashboard;

  return (
    <div>
      {/* Section header */}
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <h2 className="text-[22px] font-semibold tracking-[-0.015em]"
            style={{ color: 'var(--atlas-text)' }}>Overview</h2>
          <p className="font-mono text-[12px]" style={{ color: 'var(--atlas-text-3)' }}>
            May 13 · last {timeRange.toLowerCase() === 'custom…' ? 'custom range' : timeRange}
            <Dot /> updated 6s ago
          </p>
        </div>
        {/* Time range — hidden on smallest screens to save space */}
        <div className="hidden sm:flex gap-[6px]">
          {TIME_RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className="rounded-[4px] border px-2 py-[3px] font-mono text-[11.5px] transition-colors duration-[100ms] cursor-pointer"
              style={r === timeRange
                ? { background: 'var(--atlas-text)', color: 'var(--atlas-bg)', borderColor: 'var(--atlas-text)', fontWeight: 500 }
                : { background: 'var(--atlas-surface)', color: 'var(--atlas-text-2)', borderColor: 'var(--atlas-border)' }
              }
            >{r}</button>
          ))}
        </div>
      </div>

      {/* KPI row — 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard
          label="Total transactions"
          value={totalTransactions.toLocaleString()}
          delta={deltaTransactions} deltaDir="up" sub=" vs prev 24h"
          spark={spark.transactions} sparkColor={ACCENT} dark={dark}
        />
        <KpiCard
          label="Flagged"
          value={flaggedCount}
          delta={deltaFlagged} deltaDir="up" sub=" since yesterday"
          spark={spark.flagged} sparkColor="#ef4444" dark={dark}
        />
        <KpiCard
          label="Active customers"
          value={activeCustomers.toLocaleString()}
          delta={deltaCustomers} deltaDir="up" sub=" 7d"
          spark={spark.customers} sparkColor={dark ? '#a1a1aa' : '#71717a'} dark={dark}
        />
        <KpiCard
          label="Avg risk score"
          value={avgRiskScore}
          delta={deltaRisk} deltaDir="down" sub=" vs prev 24h"
          spark={spark.risk} sparkColor="#f59e0b" dark={dark}
        />
      </div>

      {/* Hero chart + top alerts — stacked on mobile */}
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader title="24-hour activity">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px]" style={{ color: 'var(--atlas-text-2)' }}>
              <span className="flex items-center gap-[5px]">
                <span className="inline-block h-2 w-2 rounded-[2px]"
                  style={{ background: dark ? 'rgba(230,230,233,.18)' : 'rgba(24,24,27,.12)' }} />total
              </span>
              <span className="flex items-center gap-[5px]">
                <span className="inline-block h-2 w-2 rounded-[2px] bg-[#ef4444]" />flagged
              </span>
              <span className="hidden sm:inline" style={{ color: 'var(--atlas-text-3)' }}>
                volume {fmtCcy(totalVolumeNGN, 'NGN', true)}
              </span>
            </div>
          </CardHeader>
          <ActivityHistogram bins={activityBins} accent={ACCENT} dark={dark} />
        </Card>

        <Card>
          <CardHeader title="Top alert rules">
            <span className="font-mono text-[11px]" style={{ color: 'var(--atlas-text-3)' }}>last 24h</span>
          </CardHeader>
          <div className="flex flex-col gap-[10px]">
            {topAlerts.map((a) => {
              const maxN = topAlerts[0].n;
              const barColor = a.severity === 'high' ? '#ef4444' : a.severity === 'medium' ? '#f59e0b' : '#10b981';
              return (
                <div key={a.code} className="flex flex-col gap-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-[6px] text-[12.5px] font-medium">
                      <span className="font-mono text-[10.5px] flex-shrink-0" style={{ color: 'var(--atlas-text-3)' }}>
                        {a.code}
                      </span>
                      <span className="truncate">{a.label.replace(/^[A-Z]+-\d+\s*·?\s*/, '')}</span>
                    </span>
                    <span className="font-mono text-[11.5px] flex-shrink-0" style={{ color: 'var(--atlas-text-2)' }}>
                      {a.n}
                    </span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-[2px]" style={{ background: 'var(--atlas-surface-2)' }}>
                    <div
                      className="h-full rounded-[2px] transition-all duration-500"
                      style={{
                        width: ((a.n / maxN) * 100) + '%',
                        background: barColor,
                        opacity: dark ? 0.7 : 0.85,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Risk distribution + recently flagged — stacked on mobile */}
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader title="Risk score distribution">
            <span className="font-mono text-[11px]" style={{ color: 'var(--atlas-text-3)' }}>
              {totalTransactions} txns
            </span>
          </CardHeader>
          <RiskDistribution buckets={riskDistribution} dark={dark} />
          <div className="mt-[10px] flex justify-between gap-2 font-mono text-[10.5px]"
            style={{ color: 'var(--atlas-text-3)' }}>
            <LegendItem color="#10b981" label="low < 35" />
            <LegendItem color={dark ? '#a1a1aa' : '#71717a'} label="mod 35–59" />
            <LegendItem color="#f59e0b" label="high 60–79" />
            <LegendItem color="#ef4444" label="critical ≥ 80" />
          </div>
        </Card>

        <Card>
          <CardHeader title="Recently flagged">
            <button
              onClick={() => router.push('/transactions')}
              className="font-mono text-[11.5px] transition-colors"
              style={{ color: 'var(--atlas-text-2)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              view all →
            </button>
          </CardHeader>
          <div className="flex flex-col">
            {recentFlagged.map((tx) => (
              <div
                key={tx.id}
                className="flex cursor-pointer items-center gap-3 border-b py-2 transition-colors duration-[80ms]"
                style={{ borderColor: 'var(--atlas-border)' }}
                onClick={() => router.push('/transactions')}
              >
                <AtlasAvatar name={tx.customer.name} id={tx.customer.id} size="md" />
                <div className="min-w-0 flex-1">
                  <div
                    className="truncate text-[13px] font-medium"
                    style={{ color: 'var(--atlas-text)' }}
                  >{tx.customer.name}</div>
                  <div className="font-mono text-[11px]" style={{ color: 'var(--atlas-text-3)' }}>
                    {tx.reasons[0]?.code ?? '—'} · {tx.merchant.name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="tnum font-mono text-[13px] font-medium" style={{ color: 'var(--atlas-text)' }}>
                    {fmtCcy(tx.amount, tx.currency)}
                  </div>
                  <div className="font-mono text-[10.5px]" style={{ color: 'var(--atlas-text-3)' }}>
                    {fmtTime(tx.ts)}
                  </div>
                </div>
                <RiskPill risk={tx.risk} score={tx.rs} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <h2 className="text-[22px] font-semibold" style={{ color: 'var(--atlas-text)' }}>Overview</h2>
          <p className="font-mono text-[12px]" style={{ color: 'var(--atlas-text-3)' }}>Loading recent activity…</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[0,1,2,3].map((i) => <KpiCardSkeleton key={i} />)}
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[2fr_1fr]">
        <div className="animate-shimmer h-[280px] rounded-[10px]" />
        <div className="animate-shimmer h-[280px] rounded-[10px]" />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[1fr_1.4fr]">
        <div className="animate-shimmer h-[220px] rounded-[10px]" />
        <div className="animate-shimmer h-[220px] rounded-[10px]" />
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-[10px] border p-4"
      style={{ background: 'var(--atlas-surface)', borderColor: 'var(--atlas-border)' }}
    >{children}</div>
  );
}

function CardHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-y-1">
      <h3 className="font-mono text-[12px] font-semibold uppercase tracking-[.06em]"
        style={{ color: 'var(--atlas-text-2)' }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className="inline-block h-[6px] w-[6px] rounded-[1px]" style={{ background: color }} />
      {label}
    </span>
  );
}

function Dot() {
  return <span style={{ color: 'var(--atlas-text-4)' }}> · </span>;
}
