'use client';

import { useTransactionStore } from '@/store/useTransactionStore';
import { useWebSocketStore } from '@/store/useWebSocketStore';

export function Statusbar() {
  const { totalCount } = useTransactionStore();
  const { connected, latency } = useWebSocketStore();

  return (
    <div
      className="flex items-center gap-[18px] border-t px-6 py-[6px] font-mono text-[11px]"
      style={{
        background: 'var(--atlas-surface)',
        borderColor: 'var(--atlas-border)',
        color: 'var(--atlas-text-3)',
      }}
    >
      <span
        className="flex items-center gap-1"
        style={{ color: connected ? 'var(--atlas-status-ok)' : 'var(--atlas-text-3)' }}
      >
        ● Atlas v3.4
      </span>
      <Dot />
      <span>{(totalCount).toLocaleString()} txns indexed</span>
      <Dot />
      <span>Region · ng-lagos-1</span>
      <Dot />
      <span>Queue · 3 analysts online</span>
      {connected && (
        <>
          <Dot />
          <span style={{ color: 'var(--atlas-status-ok)' }}>
            WS · {latency}ms
          </span>
        </>
      )}
      <span className="ml-auto">UTC −04:00</span>
      <Dot />
      <span>
        Press{' '}
        <kbd
          className="rounded-[3px] px-1 py-px"
          style={{ background: 'var(--atlas-surface-2)' }}
        >?</kbd>
        {' '}for shortcuts
      </span>
    </div>
  );
}

function Dot() {
  return <span style={{ color: 'var(--atlas-text-4)' }}>·</span>;
}
