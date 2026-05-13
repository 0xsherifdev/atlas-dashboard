'use client';

import { useEffect } from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { Statusbar } from './statusbar';
import { DashboardScreen } from '@/components/dashboard/dashboard-screen';
import { TransactionsScreen } from '@/components/transactions/transactions-screen';
import { TransactionDrawer } from '@/components/drawer/transaction-drawer';
import { useUIStore } from '@/store/useUIStore';
import { useWebSocketStore } from '@/store/useWebSocketStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { wsService } from '@/lib/mock/websocket';
import { MOCK_DATA } from '@/lib/mock/data';

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
      style={{ height: '100vh', background: 'var(--atlas-bg)' }}
    >
      <div className="flex h-full">
        <Sidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <Topbar />
          {/* Main content area — relative so the drawer can overlay it */}
          <div className="relative flex-1 overflow-hidden">
            <div className="h-full overflow-auto p-6">
              {view === 'dashboard'    && <DashboardScreen />}
              {view === 'transactions' && <TransactionsScreen />}
            </div>
            {/* Drawer overlays the content area */}
            {selectedId && <TransactionDrawer />}
          </div>
          <Statusbar />
        </div>
      </div>
    </div>
  );
}
