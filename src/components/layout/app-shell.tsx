'use client';

import { useEffect } from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { Statusbar } from './statusbar';
import { BottomNav } from './bottom-nav';
import { DashboardScreen } from '@/components/dashboard/dashboard-screen';
import { TransactionsScreen } from '@/components/transactions/transactions-screen';
import { TransactionDrawer } from '@/components/drawer/transaction-drawer';
import { useUIStore } from '@/store/useUIStore';
import { useWebSocketStore } from '@/store/useWebSocketStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { wsService } from '@/lib/mock/websocket';
import { MOCK_DATA } from '@/lib/mock/data';
import { cn } from '@/lib/utils';

export function AppShell() {
  const { dark, view } = useUIStore();
  const { connect } = useWebSocketStore();
  const { selectedId, transactions } = useTransactionStore();

  // Bootstrap WebSocket on mount
  useEffect(() => {
    // Pre-populate wsService with known IDs so status/risk updates target real txns
    wsService.knownIds = MOCK_DATA.transactions.map((t) => t.id);
    connect();
  }, []);

  // Keep wsService.knownIds in sync as new transactions arrive
  useEffect(() => {
    wsService.knownIds = transactions.map((t) => t.id).slice(0, 60);
  }, [transactions]);

  return (
    <div
      className={dark ? 'dark' : ''}
      style={{ height: '100dvh', background: 'var(--atlas-bg)', color: 'var(--atlas-text)' }}
    >
      <div className="flex h-full">
        {/* Sidebar: desktop only */}
        <div className="hidden md:flex h-full">
          <Sidebar />
        </div>

        <div className="flex flex-1 flex-col min-w-0">
          <Topbar />

          {/* Main content area */}
          <div className="relative flex-1 overflow-hidden">
            <div
              className={cn('h-full overflow-auto p-3 md:p-6', selectedId && 'md:pr-140')}
              style={{ transition: 'padding-right 220ms cubic-bezier(.2,.7,.3,1)' }}
            >
              {view === 'dashboard'    && <DashboardScreen />}
              {view === 'transactions' && <TransactionsScreen />}
            </div>
          </div>

          {/* Status bar: desktop only */}
          <div className="hidden md:block">
            <Statusbar />
          </div>

          {/* Bottom nav: mobile only */}
          <div className="md:hidden">
            <BottomNav />
          </div>
        </div>
      </div>

      {/* Drawer rendered at shell level with fixed positioning so it
          overlays everything correctly on both desktop and mobile */}
      {selectedId && <TransactionDrawer />}
    </div>
  );
}
