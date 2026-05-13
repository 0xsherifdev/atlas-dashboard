'use client';

import { useEffect, useState } from 'react';
import { X, ExternalLink, MoreHorizontal, Ban, AlertTriangle, Check } from 'lucide-react';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useUIStore } from '@/store/useUIStore';
import { fetchTimeline, fetchCustomerHistory, approveTransaction, blockTransaction, escalateTransaction } from '@/lib/api';
import { StatusPill, RiskPill } from '@/components/ui/status-pill';
import { AtlasAvatar } from '@/components/ui/atlas-avatar';
import { RiskMeter } from '@/components/charts/risk-meter';
import { fmtCcy, fmtDateTime, fmtTime, fmtTimeOnly } from '@/lib/utils';
import type { Transaction, TimelineEvent } from '@/types';

type Tab = 'overview' | 'indicators' | 'history' | 'timeline';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    const mq = window.matchMedia('(max-width: 767px)');
    mq.addEventListener('change', check);
    return () => mq.removeEventListener('change', check);
  }, []);
  return isMobile;
}

export function TransactionDrawer() {
  const { transactions, selectedId, selectTransaction } = useTransactionStore();
  const { dark } = useUIStore();
  const isMobile = useIsMobile();

  const tx = selectedId ? transactions.find((t) => t.id === selectedId) : null;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') selectTransaction(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectTransaction]);

  if (!tx) return null;

  return (
    <>
      {/* Overlay — fixed over entire viewport */}
      <div
        className="animate-fade-in fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,.32)' }}
        onClick={() => selectTransaction(null)}
      />

      {/* Drawer panel */}
      <div
        className={isMobile
          ? 'animate-slide-in-up fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-[20px] border-t'
          : 'animate-slide-in-right fixed bottom-0 right-0 top-0 z-50 flex w-[560px] flex-col border-l'
        }
        style={{
          background: 'var(--atlas-surface)',
          borderColor: 'var(--atlas-border)',
          boxShadow: 'var(--atlas-shadow-lg)',
          maxHeight: isMobile ? '92dvh' : undefined,
        }}
      >
        {/* Mobile drag handle */}
        {isMobile && (
          <div className="flex justify-center pt-3 pb-1">
            <div className="h-1 w-10 rounded-full" style={{ background: 'var(--atlas-border-2)' }} />
          </div>
        )}
        <DrawerContent tx={tx} dark={dark} onClose={() => selectTransaction(null)} onSelectTx={selectTransaction} />
      </div>
    </>
  );
}

// ─── Content (extracted so it remounts cleanly on tx change) ──────────────────

function DrawerContent({
  tx, dark, onClose, onSelectTx,
}: {
  tx: Transaction;
  dark: boolean;
  onClose: () => void;
  onSelectTx: (id: string) => void;
}) {
  const [tab, setTab] = useState<Tab>('overview');
  const [timeline, setTimeline] = useState<TimelineEvent[] | null>(null);
  const [history, setHistory] = useState<Transaction[] | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Reset tab when tx changes
  useEffect(() => { setTab('overview'); setTimeline(null); setHistory(null); }, [tx.id]);

  // Lazy-load timeline
  useEffect(() => {
    if (tab === 'timeline' && !timeline) {
      fetchTimeline(tx.id).then(setTimeline);
    }
  }, [tab, tx.id]);

  // Lazy-load history
  useEffect(() => {
    if (tab === 'history' && !history) {
      fetchCustomerHistory(tx.id).then(setHistory);
    }
  }, [tab, tx.id]);

  const handleAction = async (action: 'approve' | 'block' | 'escalate') => {
    const label = action === 'approve' ? 'Approved' : action === 'block' ? 'Blocked' : 'Escalated';
    if (action === 'approve') await approveTransaction(tx.id);
    else if (action === 'block') await blockTransaction(tx.id);
    else await escalateTransaction(tx.id);
    setActionMsg(label + ' ✓');
    setTimeout(() => setActionMsg(null), 2500);
  };

  const TABS: { id: Tab; label: string; badge?: number | null }[] = [
    { id: 'overview',    label: 'Overview' },
    { id: 'indicators',  label: 'Indicators', badge: tx.reasons.length || null },
    { id: 'history',     label: 'History' },
    { id: 'timeline',    label: 'Timeline' },
  ];

  return (
    <>
      {/* Header */}
      <div className="border-b px-[22px] pb-[14px] pt-[18px]" style={{ borderColor: 'var(--atlas-border)' }}>
        {/* Top row */}
        <div className="mb-[14px] flex items-center gap-[10px]">
          <span className="font-mono text-[12px]" style={{ color: 'var(--atlas-text-3)' }}>{tx.id}</span>
          <span style={{ color: 'var(--atlas-text-4)' }}>·</span>
          <span className="font-mono text-[12px]" style={{ color: 'var(--atlas-text-3)' }}>{tx.ref}</span>
          <div className="flex-1" />
          <IconBtn title="Copy link"><ExternalLink size={13} /></IconBtn>
          <IconBtn title="More"><MoreHorizontal size={13} /></IconBtn>
          <IconBtn onClick={onClose} title="Close · Esc"><X size={13} /></IconBtn>
        </div>

        {/* Amount row */}
        <div className="flex items-end gap-4">
          <div
            className="font-mono text-[32px] font-semibold leading-none tracking-[-0.02em]"
            style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--atlas-text)' }}
          >
            <span className="mr-[6px] text-[16px] font-normal" style={{ color: 'var(--atlas-text-3)' }}>
              {tx.currency}
            </span>
            {tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex flex-col gap-[6px] pb-[6px]">
            <StatusPill status={tx.status} />
            <RiskPill risk={tx.risk} score={tx.rs} />
          </div>
          <div className="flex-1" />
          <RiskMeter score={tx.rs} dark={dark} size={68} />
        </div>

        {/* Route */}
        <div className="mt-3 flex items-center gap-2 text-[12.5px]" style={{ color: 'var(--atlas-text-2)' }}>
          <span className="font-medium">
            {tx.direction === 'out'
              ? tx.customer.name + ' → ' + tx.merchant.name
              : tx.merchant.name + ' → ' + tx.customer.name}
          </span>
          <span style={{ color: 'var(--atlas-text-4)' }}>·</span>
          <span className="font-mono">{tx.method}</span>
          <span style={{ color: 'var(--atlas-text-4)' }}>·</span>
          <span className="font-mono">{fmtDateTime(tx.ts)}</span>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-[2px] border-b px-[18px]"
        style={{ borderColor: 'var(--atlas-border)' }}
      >
        {TABS.map(({ id, label, badge }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="relative border-b-2 px-3 pb-[11px] pt-[10px] text-[13px] transition-colors"
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${tab === id ? '#3b82f6' : 'transparent'}`,
              color: tab === id ? 'var(--atlas-text)' : 'var(--atlas-text-2)',
              fontWeight: tab === id ? 500 : 400,
              cursor: 'pointer',
              marginBottom: -1,
              fontFamily: 'inherit',
            }}
          >
            {label}
            {badge != null && (
              <span
                className="ml-1 rounded-[3px] px-[5px] py-px font-mono text-[10px]"
                style={{ background: 'var(--atlas-bg-err)', color: 'var(--atlas-status-err)' }}
              >{badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto px-[22px] py-5">
        {tab === 'overview' && <OverviewTab tx={tx} />}
        {tab === 'indicators' && <IndicatorsTab tx={tx} />}
        {tab === 'history' && <HistoryTab history={history} tx={tx} onSelectTx={onSelectTx} />}
        {tab === 'timeline' && <TimelineTab timeline={timeline} tx={tx} />}
      </div>

      {/* Footer actions */}
      <div
        className="flex gap-2 border-t px-[18px] py-3"
        style={{ background: 'var(--atlas-surface)', borderColor: 'var(--atlas-border)' }}
      >
        {actionMsg ? (
          <div
            className="flex flex-1 items-center justify-center rounded-[6px] py-2 text-[13px] font-medium"
            style={{ background: 'var(--atlas-bg-ok)', color: 'var(--atlas-status-ok)' }}
          >{actionMsg}</div>
        ) : (
          <>
            <ActionBtn
              onClick={() => handleAction('block')}
              danger
              icon={<Ban size={13} />}
              label="Block"
            />
            <ActionBtn
              onClick={() => handleAction('escalate')}
              icon={<AlertTriangle size={13} />}
              label="Escalate"
            />
            <div className="flex-1" />
            <ActionBtn label="Add note" />
            <ActionBtn
              onClick={() => handleAction('approve')}
              primary
              icon={<Check size={13} />}
              label="Approve"
            />
          </>
        )}
      </div>
    </>
  );
}

// ─── Tab: Overview ────────────────────────────────────────────────────────────

function OverviewTab({ tx }: { tx: Transaction }) {
  return (
    <>
      <InfoGrid cells={[
        { k: 'Customer',      v: <span className="flex items-center gap-2"><AtlasAvatar name={tx.customer.name} id={tx.customer.id} size="sm" />{tx.customer.name}</span> },
        { k: 'Customer ID',   v: <span className="font-mono">{tx.customer.id}</span> },
        { k: 'Tier · KYC',   v: tx.customer.tier + ' · ' + tx.customer.kyc },
        { k: 'Customer risk', v: <RiskPill risk={tx.customer.rs >= 60 ? 'high' : tx.customer.rs >= 35 ? 'medium' : 'low'} score={tx.customer.rs} /> },
      ]} />

      <BlockHd>Counterparty</BlockHd>
      <InfoGrid cells={[
        { k: 'Merchant',   v: tx.merchant.name },
        { k: 'Category',   v: tx.merchant.cat },
        { k: 'MCC',        v: <span className="font-mono">{tx.merchant.mcc}</span> },
        { k: 'Direction',  v: tx.direction === 'out' ? 'Outbound' : 'Inbound' },
      ]} />

      <BlockHd>Session</BlockHd>
      <InfoGrid cells={[
        { k: 'Device',          v: <span className="text-[12.5px]">{tx.device}</span> },
        { k: 'IP address',      v: <span className="font-mono">{tx.ip}</span> },
        { k: 'Geo · IP',        v: tx.customer.country + ' · ' + tx.customer.city },
        { k: 'Billing country', v: tx.customer.country },
      ]} />

      {tx.reasons.length > 0 && (
        <>
          <BlockHd>Top indicator</BlockHd>
          <ReasonCard reason={tx.reasons[0]} />
        </>
      )}
    </>
  );
}

// ─── Tab: Indicators ──────────────────────────────────────────────────────────

function IndicatorsTab({ tx }: { tx: Transaction }) {
  return (
    <>
      <div className="mb-[10px] flex items-baseline justify-between">
        <p className="text-[13px]" style={{ color: 'var(--atlas-text-2)' }}>
          <span className="font-mono font-semibold" style={{ color: 'var(--atlas-text)' }}>{tx.reasons.length}</span>
          {' '}signals fired · evaluated by <span className="font-mono">Atlas v3.4</span>
        </p>
        <Chip label="Re-evaluate" />
      </div>

      {tx.reasons.length === 0 ? (
        <EmptyState icon={<Check size={18} />} title="No signals fired" body="This transaction passed all 47 active rules." ok />
      ) : (
        tx.reasons.map((r) => (
          <div
            key={r.code}
            className="mb-[6px] flex gap-[10px] rounded-[8px] border p-3"
            style={{ background: 'var(--atlas-surface)', borderColor: 'var(--atlas-border)' }}
          >
            <div
              className="w-[3px] self-stretch rounded-[2px] flex-shrink-0"
              style={{
                background: r.severity === 'high' ? 'var(--atlas-status-err)'
                  : r.severity === 'medium' ? 'var(--atlas-status-warn)'
                  : 'var(--atlas-status-ok)',
              }}
            />
            <div className="flex-1">
              <div className="flex items-baseline justify-between">
                <span className="text-[13px] font-medium" style={{ color: 'var(--atlas-text)' }}>{r.label}</span>
                <StatusTag severity={r.severity} />
              </div>
              <div className="mt-1 font-mono text-[10.5px]" style={{ color: 'var(--atlas-text-3)' }}>
                {r.code} · last fired {fmtTime(tx.ts)}
              </div>
            </div>
          </div>
        ))
      )}

      <BlockHd>Screening</BlockHd>
      <div className="grid grid-cols-2 gap-2">
        {[
          { name: 'NFIU watchlist', state: 'passed', meta: '0 matches · 06/2026'  },
          { name: 'EFCC register',  state: 'passed', meta: '0 matches · 06/2026'  },
          { name: 'CBN sanctions',  state: 'passed', meta: '0 matches · 06/2026'  },
          { name: 'PEP · INEC',     state: tx.rs >= 60 ? 'review' : 'passed', meta: tx.rs >= 60 ? '1 partial · 78%' : '0 matches' },
        ].map((s) => (
          <div
            key={s.name}
            className="flex items-center gap-[10px] rounded-[8px] border p-3"
            style={{ borderColor: 'var(--atlas-border)' }}
          >
            <span style={{ color: s.state === 'passed' ? 'var(--atlas-status-ok)' : 'var(--atlas-status-warn)' }}>
              {s.state === 'passed' ? <Check size={14} /> : <AlertTriangle size={14} />}
            </span>
            <div className="flex-1">
              <div className="text-[12.5px] font-medium" style={{ color: 'var(--atlas-text)' }}>{s.name}</div>
              <div className="font-mono text-[10.5px]" style={{ color: 'var(--atlas-text-3)' }}>{s.meta}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Tab: History ─────────────────────────────────────────────────────────────

function HistoryTab({ history, tx, onSelectTx }: { history: Transaction[] | null; tx: Transaction; onSelectTx: (id: string) => void }) {
  if (!history) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-shimmer h-14 rounded-[8px]" />
        ))}
      </div>
    );
  }
  return (
    <>
      <p className="mb-3 text-[13px]" style={{ color: 'var(--atlas-text-2)' }}>
        Recent activity for <strong style={{ color: 'var(--atlas-text)' }}>{tx.customer.name}</strong>
      </p>
      {history.length === 0 ? (
        <EmptyState title="No prior transactions" body="This is the customer's first activity on record." />
      ) : (
        <div className="flex flex-col">
          {history.map((h) => (
            <button
              key={h.id}
              onClick={() => onSelectTx(h.id)}
              style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--atlas-border)' }}
            >
              <div className="flex-1">
                <div className="text-[13px] font-medium" style={{ color: 'var(--atlas-text)' }}>{h.merchant.name}</div>
                <div className="font-mono text-[11px]" style={{ color: 'var(--atlas-text-3)' }}>
                  {h.id} · {h.method}
                </div>
              </div>
              <RiskPill risk={h.risk} score={h.rs} />
              <div className="min-w-[100px] text-right">
                <div className="font-mono text-[13px]" style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--atlas-text)' }}>
                  {fmtCcy(h.amount, h.currency)}
                </div>
                <div className="font-mono text-[10.5px]" style={{ color: 'var(--atlas-text-3)' }}>{fmtTime(h.ts)}</div>
              </div>
            </button>
          ))}
        </div>
      )}
      <BlockHd>90-day pattern</BlockHd>
      <div className="grid grid-cols-3 gap-3">
        {[
          { k: 'Avg txn',      v: '₦284,500' },
          { k: 'p99',          v: '₦4.2M' },
          { k: 'Volume / day', v: '4.2' },
        ].map(({ k, v }) => (
          <div key={k}>
            <div className="font-mono text-[10.5px] uppercase tracking-[.06em]" style={{ color: 'var(--atlas-text-3)' }}>{k}</div>
            <div className="mt-1 font-mono text-[15px] font-medium" style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--atlas-text)' }}>{v}</div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Tab: Timeline ────────────────────────────────────────────────────────────

function TimelineTab({ timeline, tx }: { timeline: TimelineEvent[] | null; tx: Transaction }) {
  if (!timeline) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="animate-shimmer h-[11px] w-11 rounded" />
            <div className="flex-1 space-y-2">
              <div className="animate-shimmer h-[13px] w-3/4 rounded" />
              <div className="animate-shimmer h-[11px] w-1/2 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const last = timeline[timeline.length - 1];
  return (
    <>
      <p className="mb-3 text-[13px]" style={{ color: 'var(--atlas-text-2)' }}>
        {timeline.length} events · {fmtDateTime(tx.ts)} → {fmtDateTime(last.t)}
      </p>
      <div className="relative pl-[18px]">
        {/* timeline line */}
        <div
          className="absolute bottom-[6px] left-[5px] top-[6px] w-px"
          style={{ background: 'var(--atlas-border-2)' }}
        />
        {timeline.map((ev, i) => (
          <div key={i} className="relative pb-[14px] pt-1">
            {/* dot */}
            <span
              className="absolute -left-[18px] top-2 inline-block h-[11px] w-[11px] rounded-full"
              style={{
                background: ['flag', 'block', 'settle', 'analyst'].includes(ev.kind)
                  ? (ev.kind === 'block' ? 'var(--atlas-status-err)'
                  : ev.kind === 'settle' ? 'var(--atlas-status-ok)'
                  : ev.kind === 'analyst' ? '#3b82f6'
                  : 'var(--atlas-status-warn)')
                  : 'var(--atlas-surface)',
                border: `2px solid ${
                  ev.kind === 'created'  ? 'var(--atlas-status-info)' :
                  ev.kind === 'screen'   ? 'var(--atlas-status-ok)' :
                  ev.kind === 'flag'     ? 'var(--atlas-status-warn)' :
                  ev.kind === 'block'    ? 'var(--atlas-status-err)' :
                  ev.kind === 'settle'   ? 'var(--atlas-status-ok)' :
                  ev.kind === 'analyst'  ? '#3b82f6' :
                  ev.kind === 'reverse'  ? 'var(--atlas-status-err)' :
                  'var(--atlas-text-3)'
                }`,
              }}
            />
            <div className="font-mono text-[10.5px]" style={{ color: 'var(--atlas-text-3)' }}>
              {fmtTimeOnly(ev.t)} <span style={{ color: 'var(--atlas-text-4)' }}>·</span> {fmtTime(ev.t)}
            </div>
            <div className="mt-[2px] text-[13.5px]" style={{ color: 'var(--atlas-text)' }}>{ev.text}</div>
            <div className="mt-[2px] font-mono text-[11.5px]" style={{ color: 'var(--atlas-text-3)' }}>
              {ev.who} · {ev.meta}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function BlockHd({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mb-[10px] mt-[22px] font-mono text-[10.5px] font-semibold uppercase tracking-[.08em]"
      style={{ color: 'var(--atlas-text-3)' }}
    >{children}</div>
  );
}

function InfoGrid({ cells }: { cells: { k: string; v: React.ReactNode }[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
      {cells.map(({ k, v }) => (
        <div key={k}>
          <div className="font-mono text-[10.5px] uppercase tracking-[.07em]" style={{ color: 'var(--atlas-text-3)' }}>{k}</div>
          <div className="mt-[2px] flex items-center gap-2 text-[13.5px]" style={{ color: 'var(--atlas-text)' }}>{v}</div>
        </div>
      ))}
    </div>
  );
}

function ReasonCard({ reason }: { reason: { code: string; label: string; severity: string } }) {
  return (
    <div
      className="flex gap-[10px] rounded-[8px] border p-3"
      style={{ background: 'var(--atlas-surface)', borderColor: 'var(--atlas-border)' }}
    >
      <div
        className="w-[3px] self-stretch rounded-[2px] flex-shrink-0"
        style={{ background: reason.severity === 'high' ? 'var(--atlas-status-err)' : reason.severity === 'medium' ? 'var(--atlas-status-warn)' : 'var(--atlas-status-ok)' }}
      />
      <div>
        <div className="text-[13px] font-medium" style={{ color: 'var(--atlas-text)' }}>{reason.label}</div>
        <div className="font-mono text-[10.5px]" style={{ color: 'var(--atlas-text-3)' }}>{reason.code} · severity {reason.severity}</div>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, body, ok }: { icon?: React.ReactNode; title: string; body: string; ok?: boolean }) {
  return (
    <div className="px-6 py-10 text-center">
      {icon && (
        <div
          className="mx-auto mb-3 inline-grid h-11 w-11 place-items-center rounded-[8px]"
          style={{ background: 'var(--atlas-surface-2)', color: ok ? 'var(--atlas-status-ok)' : 'var(--atlas-text-3)' }}
        >{icon}</div>
      )}
      <h3 className="mb-1 text-base font-semibold" style={{ color: 'var(--atlas-text)' }}>{title}</h3>
      <p className="text-[13px]" style={{ color: 'var(--atlas-text-3)' }}>{body}</p>
    </div>
  );
}

function StatusTag({ severity }: { severity: string }) {
  const color = severity === 'high' ? 'err' : severity === 'medium' ? 'warn' : 'ok';
  const styles: Record<string, string> = {
    err:  'text-(--atlas-status-err) bg-(--atlas-bg-err)',
    warn: 'text-(--atlas-status-warn) bg-(--atlas-bg-warn)',
    ok:   'text-(--atlas-status-ok) bg-(--atlas-bg-ok)',
  };
  return (
    <span className={`inline-flex rounded-[4px] px-[7px] py-px font-mono text-[11px] font-medium uppercase tracking-[.04em] ${styles[color]}`}>
      {severity}
    </span>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <button
      className="rounded-[4px] border px-2 py-[3px] font-mono text-[11.5px] transition-colors cursor-pointer"
      style={{ background: 'var(--atlas-surface)', borderColor: 'var(--atlas-border)', color: 'var(--atlas-text-2)' }}
    >{label}</button>
  );
}

function IconBtn({ children, onClick, title }: { children: React.ReactNode; onClick?: () => void; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="inline-grid h-7 w-7 place-items-center rounded-[6px] border transition-colors cursor-pointer"
      style={{ background: 'var(--atlas-surface)', borderColor: 'var(--atlas-border)', color: 'var(--atlas-text-2)' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--atlas-hover)'; e.currentTarget.style.color = 'var(--atlas-text)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--atlas-surface)'; e.currentTarget.style.color = 'var(--atlas-text-2)'; }}
    >{children}</button>
  );
}

function ActionBtn({
  label, icon, primary, danger, onClick,
}: {
  label: string;
  icon?: React.ReactNode;
  primary?: boolean;
  danger?: boolean;
  onClick?: () => void;
}) {
  const style = primary
    ? { background: '#3b82f6', color: '#fff', borderColor: '#3b82f6' }
    : danger
    ? { background: 'var(--atlas-surface)', color: 'var(--atlas-status-err)', borderColor: 'var(--atlas-border-2)' }
    : { background: 'var(--atlas-surface)', color: 'var(--atlas-text)', borderColor: 'var(--atlas-border)' };
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-[6px] rounded-[6px] border px-3 py-[6px] text-[13px] font-medium transition-all cursor-pointer"
      style={style}
    >
      {icon}{label}
    </button>
  );
}
