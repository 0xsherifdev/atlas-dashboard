'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import { useWebSocketStore } from '@/store/useWebSocketStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { wsService } from '@/lib/mock/websocket';
import { MOCK_DATA } from '@/lib/mock/data';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { Statusbar } from '@/components/layout/statusbar';
import { BottomNav } from '@/components/layout/bottom-nav';
import { TransactionDrawer } from '@/components/drawer/transaction-drawer';
import { cn } from '@/lib/utils';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { signedIn, _hasHydrated } = useAuthStore();
  const { dark } = useUIStore();
  const { connect } = useWebSocketStore();
  const { selectedId, transactions } = useTransactionStore();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (_hasHydrated && !signedIn) {
      router.replace('/login');
    }
  }, [_hasHydrated, signedIn, router]);

  // Bootstrap WebSocket on mount
  useEffect(() => {
    if (!signedIn) return;
    wsService.knownIds = MOCK_DATA.transactions.map((t) => t.id);
    connect();
  }, [signedIn]);

  // Keep wsService.knownIds in sync as new transactions arrive
  useEffect(() => {
    wsService.knownIds = transactions.map((t) => t.id).slice(0, 60);
  }, [transactions]);

  if (!_hasHydrated || !signedIn) return null;

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
            <div className={cn('h-full overflow-auto p-3 md:p-6', selectedId && 'md:pr-140')}>
              {children}
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

      {/* Drawer rendered at shell level */}
      {selectedId && <TransactionDrawer />}
    </div>
  );
}
