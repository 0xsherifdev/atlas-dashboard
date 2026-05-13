'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronDown, Clock, Download, Columns, Plus, X, AlertTriangle, RefreshCw } from 'lucide-react';
import { useTransactionStore } from '@/store/useTransactionStore';
import { StatusPill, RiskPill } from '@/components/ui/status-pill';
import { AtlasAvatar } from '@/components/ui/atlas-avatar';
import { fmtCcy, fmtTime, cn } from '@/lib/utils';
import { Chip } from '@/components/ui/chip';
import type { TransactionStatus, RiskLevel } from '@/types';

const STATUSES: TransactionStatus[] = ['completed', 'flagged', 'review', 'blocked', 'pending'];
const RISKS: RiskLevel[] = ['low', 'medium', 'high', 'critical'];

export function TransactionsScreen() {
  const {
    transactions, totalCount, totalPages,
    txLoading, txError,
    filters, selectedId,
    loadTransactions, setSearch, toggleStatus, toggleRisk,
    setPage, clearFilters, selectTransaction,
  } = useTransactionStore();

  // Track which row IDs are "new" (arrived via WS) for the flash animation
  const seenIds = useRef(new Set<string>());
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Detect newly arrived transactions for row flash
  useEffect(() => {
    const fresh = new Set<string>();
    transactions.forEach((tx) => {
      if (!seenIds.current.has(tx.id)) {
        if (seenIds.current.size > 0) {
          fresh.add(tx.id);
          setTimeout(() => {
            setNewIds((prev) => {
              const next = new Set(prev);
              next.delete(tx.id);
              return next;
            });
          }, 1500);
        }
        seenIds.current.add(tx.id);
      }
    });
    if (fresh.size > 0) {
      setNewIds((prev) => new Set([...prev, ...fresh]));
    }
  }, [transactions]);

  const filterCount = filters.statuses.size + filters.risks.size + (filters.search ? 1 : 0);
  const { page, statuses, risks, search } = filters;
  const cur = Math.min(page, totalPages);

  if (txLoading && transactions.length === 0) {
    return (
      <div>
        <SectionHeader />
        <TableSkeleton />
      </div>
    );
  }

  if (txError) {
    return (
      <div>
        <SectionHeader />
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-3 inline-grid h-11 w-11 place-items-center rounded-[8px]"
            style={{ background: 'var(--atlas-surface-2)', color: 'var(--atlas-status-err)' }}>
            <AlertTriangle size={18} />
          </div>
          <h3 className="mb-1 text-[15px] font-semibold" style={{ color: 'var(--atlas-text)' }}>
            Couldn&apos;t load transactions
          </h3>
          <p className="mb-4 text-[13px]" style={{ color: 'var(--atlas-text-3)' }}>
            The ledger service is unreachable.
          </p>
          <button onClick={() => loadTransactions()} className="inline-flex items-center gap-[6px] rounded-[6px] border px-3 py-[6px] text-[13px]"
            style={{ background: 'var(--atlas-surface)', borderColor: 'var(--atlas-border)', color: 'var(--atlas-text)', cursor: 'pointer' }}>
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Section header */}
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <h2 className="text-[22px] font-semibold tracking-[-0.015em]" style={{ color: 'var(--atlas-text)' }}>
            Transactions
          </h2>
          <p className="font-mono text-[12px]" style={{ color: 'var(--atlas-text-3)' }}>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{totalCount.toLocaleString()}</span> matching
            {filterCount > 0 && (
              <> ·{' '}
                <button
                  onClick={clearFilters}
                  className="underline decoration-dotted"
                  style={{ color: 'var(--atlas-text-2)', background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
                >clear filters</button>
              </>
            )}
          </p>
        </div>
        {/* Desktop-only action buttons */}
        <div className="hidden md:flex gap-2">
          <Btn icon={<Columns size={13} />} label="Columns" />
          <Btn icon={<Download size={13} />} label="Export CSV" />
          <Btn icon={<Plus size={13} />} label="Save view" primary />
        </div>
      </div>

      {/* Filter toolbar — scrollable on mobile */}
      <div
        className="overflow-x-auto rounded-t-[10px] border border-b-0"
        style={{ background: 'var(--atlas-surface)', borderColor: 'var(--atlas-border)' }}
      >
        <div className="flex min-w-max items-center gap-2 px-4 py-3">
          {/* Search */}
          <div
            className="flex w-[220px] items-center gap-2 rounded-[7px] border px-[10px] py-[6px] text-[13px]"
            style={{ background: 'var(--atlas-bg)', borderColor: 'var(--atlas-border)', color: 'var(--atlas-text-2)' }}
          >
            <Search size={13} className="flex-shrink-0 opacity-60" />
            <input
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border-0 bg-transparent text-[13px] outline-none"
              style={{ color: 'var(--atlas-text)' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ color: 'var(--atlas-text-3)', background: 'none', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                <X size={12} />
              </button>
            )}
          </div>

          <Divider />

          {/* Status chips */}
          <div className="flex items-center gap-1">
            <span className="font-mono text-[11px] uppercase tracking-[.06em] mr-1" style={{ color: 'var(--atlas-text-3)' }}>Status</span>
            {STATUSES.map((s) => (
              <Chip
                key={s}
                label={s}
                active={statuses.has(s)}
                onClick={() => toggleStatus(s)}
              />
            ))}
          </div>

          <Divider />

          {/* Risk chips */}
          <div className="flex items-center gap-1">
            <span className="font-mono text-[11px] uppercase tracking-[.06em] mr-1" style={{ color: 'var(--atlas-text-3)' }}>Risk</span>
            {RISKS.map((r) => (
              <Chip
                key={r}
                label={r}
                active={risks.has(r)}
                onClick={() => toggleRisk(r)}
              />
            ))}
          </div>

          <div className="flex-1" />

          <Btn icon={<Clock size={13} />} label="Last 24h" suffix={<ChevronDown size={12} />} />
        </div>
      </div>

      {/* Empty state */}
      {transactions.length === 0 ? (
        <div
          className="rounded-b-[10px] border border-t-0 px-16 py-16 text-center"
          style={{ background: 'var(--atlas-surface)', borderColor: 'var(--atlas-border)' }}
        >
          <div className="mx-auto mb-4 inline-grid h-11 w-11 place-items-center rounded-[8px]"
            style={{ background: 'var(--atlas-surface-2)', color: 'var(--atlas-text-3)' }}>
            <Search size={18} />
          </div>
          <h3 className="mb-1 text-[15px] font-semibold" style={{ color: 'var(--atlas-text)' }}>
            No transactions match
          </h3>
          <p className="text-[13px]" style={{ color: 'var(--atlas-text-3)' }}>
            Try removing a filter or broadening your search.
          </p>
          {filterCount > 0 && (
            <button onClick={clearFilters} className="mt-4 inline-flex items-center gap-[6px] rounded-[6px] border px-3 py-[6px] text-[13px]"
              style={{ background: 'var(--atlas-surface)', borderColor: 'var(--atlas-border)', color: 'var(--atlas-text)', cursor: 'pointer' }}>
              <X size={13} /> Clear all filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* ── Mobile: card list ───────────────────────────────────── */}
          <div
            className="block md:hidden border-x border-b rounded-b-[10px] overflow-hidden"
            style={{ background: 'var(--atlas-surface)', borderColor: 'var(--atlas-border)' }}
          >
            {transactions.map((tx) => {
              const isSelected = selectedId === tx.id;
              const isNew = newIds.has(tx.id);
              return (
                <button
                  key={tx.id}
                  className={cn('w-full text-left flex items-center gap-3 px-4 py-3', isNew && 'animate-row-flash')}
                  style={{
                    display: 'flex',
                    background: isSelected ? 'var(--atlas-selected)' : 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--atlas-border)',
                    cursor: 'pointer',
                    width: '100%',
                    padding: '12px 16px',
                  }}
                  onClick={() => selectTransaction(isSelected ? null : tx.id)}
                >
                  <AtlasAvatar name={tx.customer.name} id={tx.customer.id} size="md" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <span className="font-medium text-[14px] truncate" style={{ color: 'var(--atlas-text)' }}>
                        {tx.customer.name}
                      </span>
                      <span
                        className="font-mono font-medium text-[13px] flex-shrink-0"
                        style={{
                          fontVariantNumeric: 'tabular-nums',
                          color: tx.direction === 'in' ? 'var(--atlas-status-ok)' : 'var(--atlas-text)',
                        }}
                      >
                        {fmtCcy(tx.amount, tx.currency)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 2 }}>
                      <span className="font-mono text-[11px] truncate" style={{ color: 'var(--atlas-text-3)' }}>
                        {tx.merchant.name} · {fmtTime(tx.ts)}
                      </span>
                      <StatusPill status={tx.status} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── Desktop: table ──────────────────────────────────────── */}
          <div
            className="hidden md:block border-x"
            style={{ background: 'var(--atlas-surface)', borderColor: 'var(--atlas-border)' }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {[
                    { label: 'Transaction', w: 130 },
                    { label: 'Customer',    w: undefined },
                    { label: 'Merchant',    w: undefined },
                    { label: 'Amount',      w: 130, right: true },
                    { label: 'Risk',        w: 110 },
                    { label: 'Status',      w: 110 },
                    { label: 'Date',        w: 90 },
                    { label: '',            w: 26 },
                  ].map(({ label, w, right }) => (
                    <th
                      key={label}
                      style={{
                        width: w,
                        textAlign: right ? 'right' : 'left',
                        fontWeight: 500,
                        fontSize: 10.5,
                        textTransform: 'uppercase',
                        letterSpacing: '.08em',
                        color: 'var(--atlas-text-3)',
                        padding: '8px 12px',
                        fontFamily: "'Geist Mono', ui-monospace, Menlo, monospace",
                        borderBottom: '1px solid var(--atlas-border)',
                        background: 'var(--atlas-surface)',
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                      }}
                    >{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const isNew = newIds.has(tx.id);
                  const isSelected = selectedId === tx.id;
                  return (
                    <tr
                      key={tx.id}
                      tabIndex={0}
                      onClick={() => selectTransaction(isSelected ? null : tx.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectTransaction(isSelected ? null : tx.id); } }}
                      className={cn(isNew && 'animate-row-flash')}
                      style={{
                        cursor: 'pointer',
                        background: isSelected ? 'var(--atlas-selected)' : 'transparent',
                        transition: 'background .08s',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'var(--atlas-hover)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <td style={{ padding: '11px 12px', borderBottom: '1px solid var(--atlas-border)', verticalAlign: 'middle' }}>
                        <div className="font-mono text-[12.5px]" style={{ color: 'var(--atlas-text)' }}>{tx.id}</div>
                        <div className="font-mono text-[10.5px]" style={{ color: 'var(--atlas-text-3)' }}>{tx.ref}</div>
                      </td>
                      <td style={{ padding: '11px 12px', borderBottom: '1px solid var(--atlas-border)', verticalAlign: 'middle' }}>
                        <div className="flex items-center gap-2">
                          <AtlasAvatar name={tx.customer.name} id={tx.customer.id} size="sm" />
                          <div className="min-w-0">
                            <div className="whitespace-nowrap font-medium" style={{ color: 'var(--atlas-text)' }}>{tx.customer.name}</div>
                            <div className="font-mono text-[10.5px]" style={{ color: 'var(--atlas-text-3)' }}>{tx.customer.city}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '11px 12px', borderBottom: '1px solid var(--atlas-border)', verticalAlign: 'middle' }}>
                        <div style={{ color: 'var(--atlas-text)' }}>{tx.merchant.name}</div>
                        <div className="font-mono text-[10.5px]" style={{ color: 'var(--atlas-text-3)' }}>{tx.merchant.cat}</div>
                      </td>
                      <td style={{ padding: '11px 12px', borderBottom: '1px solid var(--atlas-border)', verticalAlign: 'middle', textAlign: 'right' }}>
                        <div
                          className="font-mono font-medium"
                          style={{ fontVariantNumeric: 'tabular-nums', color: tx.direction === 'in' ? 'var(--atlas-status-ok)' : 'var(--atlas-text)' }}
                        >
                          <span className="opacity-60">{tx.direction === 'in' ? '+ ' : '− '}</span>
                          {fmtCcy(tx.amount, tx.currency)}
                        </div>
                        <div className="font-mono text-[10.5px]" style={{ color: 'var(--atlas-text-3)' }}>
                          {tx.method} · {tx.currency}
                        </div>
                      </td>
                      <td style={{ padding: '11px 12px', borderBottom: '1px solid var(--atlas-border)', verticalAlign: 'middle' }}>
                        <RiskPill risk={tx.risk} score={tx.rs} />
                      </td>
                      <td style={{ padding: '11px 12px', borderBottom: '1px solid var(--atlas-border)', verticalAlign: 'middle' }}>
                        <StatusPill status={tx.status} />
                      </td>
                      <td style={{ padding: '11px 12px', borderBottom: '1px solid var(--atlas-border)', verticalAlign: 'middle' }}>
                        <div className="text-[12px]" style={{ color: 'var(--atlas-text)' }}>{fmtTime(tx.ts)}</div>
                        <div className="font-mono text-[10.5px]" style={{ color: 'var(--atlas-text-3)' }}>
                          {new Date(tx.ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </div>
                      </td>
                      <td style={{ padding: '11px 12px', borderBottom: '1px solid var(--atlas-border)', verticalAlign: 'middle', color: 'var(--atlas-text-3)' }}>
                        <ChevronRight size={14} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div
            className="flex items-center justify-between rounded-b-[10px] border border-t-0 px-4 py-[10px] font-mono text-[12px]"
            style={{ background: 'var(--atlas-surface)', borderColor: 'var(--atlas-border)', color: 'var(--atlas-text-2)' }}
          >
            <div>
              Showing{' '}
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                {(cur - 1) * filters.perPage + 1}–{Math.min(cur * filters.perPage, totalCount)}
              </span>
              {' '}of{' '}
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{totalCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-[6px]">
              <span className="hidden sm:inline" style={{ color: 'var(--atlas-text-3)' }}>Rows · {filters.perPage}</span>
              <span className="hidden sm:inline" style={{ color: 'var(--atlas-text-4)', margin: '0 6px' }}>·</span>
              <div className="flex gap-[2px]">
                <PageBtn
                  disabled={cur === 1}
                  onClick={() => setPage(cur - 1)}
                >
                  <ChevronLeft size={13} />
                </PageBtn>
                {Array.from({ length: Math.min(7, totalPages) }).map((_, i) => {
                  let p: number;
                  if (totalPages <= 7)        p = i + 1;
                  else if (cur <= 4)          p = i + 1;
                  else if (cur >= totalPages - 3) p = totalPages - 6 + i;
                  else                        p = cur - 3 + i;
                  return (
                    <PageBtn key={p} active={p === cur} onClick={() => setPage(p)}>
                      {p}
                    </PageBtn>
                  );
                })}
                <PageBtn
                  disabled={cur === totalPages}
                  onClick={() => setPage(cur + 1)}
                >
                  <ChevronRight size={13} />
                </PageBtn>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader() {
  return (
    <div className="mb-4">
      <h2 className="text-[22px] font-semibold" style={{ color: 'var(--atlas-text)' }}>Transactions</h2>
      <p className="font-mono text-[12px]" style={{ color: 'var(--atlas-text-3)' }}>Loading…</p>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-[10px] border"
      style={{ background: 'var(--atlas-surface)', borderColor: 'var(--atlas-border)' }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['Transaction', 'Customer', 'Merchant', 'Amount', 'Risk', 'Status', 'Date'].map((h) => (
              <th
                key={h}
                style={{
                  textAlign: 'left', fontWeight: 500, fontSize: 10.5,
                  textTransform: 'uppercase', letterSpacing: '.08em',
                  color: 'var(--atlas-text-3)', padding: '8px 12px',
                  fontFamily: "'Geist Mono', monospace",
                  borderBottom: '1px solid var(--atlas-border)',
                }}
              >{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 9 }).map((_, i) => (
            <tr key={i}>
              <td style={{ padding: '11px 12px', borderBottom: '1px solid var(--atlas-border)' }}>
                <div className="animate-shimmer h-3 w-[110px] rounded" />
              </td>
              <td style={{ padding: '11px 12px', borderBottom: '1px solid var(--atlas-border)' }}>
                <div className="flex items-center gap-2">
                  <div className="animate-shimmer h-6 w-6 rounded-full" />
                  <div className="animate-shimmer h-3 w-28 rounded" />
                </div>
              </td>
              <td style={{ padding: '11px 12px', borderBottom: '1px solid var(--atlas-border)' }}>
                <div className="animate-shimmer h-3 w-[110px] rounded" />
              </td>
              <td style={{ padding: '11px 12px', borderBottom: '1px solid var(--atlas-border)', textAlign: 'right' }}>
                <div className="animate-shimmer ml-auto h-3 w-[76px] rounded" />
              </td>
              <td style={{ padding: '11px 12px', borderBottom: '1px solid var(--atlas-border)' }}>
                <div className="animate-shimmer h-[18px] w-16 rounded-[4px]" />
              </td>
              <td style={{ padding: '11px 12px', borderBottom: '1px solid var(--atlas-border)' }}>
                <div className="animate-shimmer h-[18px] w-20 rounded-[4px]" />
              </td>
              <td style={{ padding: '11px 12px', borderBottom: '1px solid var(--atlas-border)' }}>
                <div className="animate-shimmer h-3 w-14 rounded" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Btn({ icon, label, primary = false, suffix }: { icon: React.ReactNode; label: string; primary?: boolean; suffix?: React.ReactNode }) {
  return (
    <button
      className="inline-flex items-center gap-[6px] rounded-[6px] border px-3 py-[6px] text-[13px] font-medium transition-colors duration-[120ms] cursor-pointer"
      style={primary
        ? { background: '#3b82f6', color: '#fff', borderColor: '#3b82f6' }
        : { background: 'var(--atlas-surface)', color: 'var(--atlas-text)', borderColor: 'var(--atlas-border)' }
      }
    >
      {icon}{label}{suffix}
    </button>
  );
}


function Divider() {
  return <div className="h-[18px] w-px" style={{ background: 'var(--atlas-border-2)' }} />;
}

function PageBtn({ children, active = false, disabled = false, onClick }: { children: React.ReactNode; active?: boolean; disabled?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-grid h-[26px] w-7 place-items-center rounded-[5px] font-mono transition-colors"
      style={
        active
          ? { background: 'var(--atlas-text)', color: 'var(--atlas-bg)', border: 'none', cursor: 'pointer' }
          : disabled
          ? { background: 'transparent', color: 'var(--atlas-text-4)', border: 'none', cursor: 'not-allowed' }
          : { background: 'transparent', color: 'var(--atlas-text-2)', border: 'none', cursor: 'pointer' }
      }
    >{children}</button>
  );
}
