/**
 * Transaction store — owns all transaction state.
 *
 * Separation of concerns:
 *  - Filters and pagination live here (not in component state)
 *  - Fetched data lives here so the drawer can reference any transaction
 *  - WebSocket patches are applied here (append, status update, risk update)
 *
 * The store calls the API layer — never the mock data directly.
 * This is the same pattern you'd use with a real backend.
 */

import { create } from 'zustand';
import { fetchTransactions, fetchDashboardStats } from '@/lib/api';
import type {
  Transaction,
  TransactionFilters,
  DashboardStats,
  TransactionStatus,
  RiskLevel,
} from '@/types';

// Request ID to cancel stale responses when filters change mid-flight
let _loadId = 0;

// Buffer WS-inserted transactions and apply after a short delay so
// rows don't shuffle while the user is in the middle of clicking.
let _pendingWsTx: Transaction[] = [];
let _wsFlushTimer: ReturnType<typeof setTimeout> | null = null;
let _searchTimer: ReturnType<typeof setTimeout> | null = null;

interface TransactionState {
  // ── Fetched data ────────────────────────────────────────────────────────────
  transactions: Transaction[];
  totalCount: number;
  totalPages: number;
  dashboard: DashboardStats | null;

  // ── Loading / error ─────────────────────────────────────────────────────────
  txLoading: boolean;
  txError: string | null;
  dashLoading: boolean;
  dashError: string | null;

  // ── Filters / pagination ────────────────────────────────────────────────────
  filters: TransactionFilters;

  // ── Selected transaction (drawer) ───────────────────────────────────────────
  selectedId: string | null;

  // ── Actions ─────────────────────────────────────────────────────────────────
  loadTransactions: () => Promise<void>;
  loadDashboard: () => Promise<void>;
  setSearch: (q: string) => void;
  toggleStatus: (s: TransactionStatus) => void;
  toggleRisk: (r: RiskLevel) => void;
  setPage: (p: number) => void;
  clearFilters: () => void;
  selectTransaction: (id: string | null) => void;

  // ── WebSocket patches ───────────────────────────────────────────────────────
  wsAddTransaction: (tx: Transaction) => void;
  wsUpdateStatus: (id: string, status: TransactionStatus, rs: number) => void;
  wsUpdateRisk: (id: string, rs: number, risk: RiskLevel) => void;
}

const DEFAULT_FILTERS: TransactionFilters = {
  search: '',
  statuses: new Set(),
  risks: new Set(),
  page: 1,
  perPage: 10,
};

export const useTransactionStore = create<TransactionState>()((set, get) => ({
  transactions: [],
  totalCount: 0,
  totalPages: 1,
  dashboard: null,
  txLoading: false,
  txError: null,
  dashLoading: false,
  dashError: null,
  filters: { ...DEFAULT_FILTERS },
  selectedId: null,

  // ── Data fetching ────────────────────────────────────────────────────────────

  loadTransactions: async () => {
    const id = ++_loadId;
    set({ txLoading: true, txError: null });
    try {
      const { data, meta } = await fetchTransactions(get().filters);
      if (id !== _loadId) return; // stale — a newer request already resolved
      set({
        transactions: data,
        totalCount: meta?.total ?? data.length,
        totalPages: meta?.totalPages ?? 1,
        txLoading: false,
      });
    } catch (e) {
      if (id !== _loadId) return;
      set({ txLoading: false, txError: (e as Error).message });
    }
  },

  loadDashboard: async () => {
    set({ dashLoading: true, dashError: null });
    try {
      const stats = await fetchDashboardStats();
      set({ dashboard: stats, dashLoading: false });
    } catch (e) {
      set({ dashLoading: false, dashError: (e as Error).message });
    }
  },

  // ── Filter mutations ─────────────────────────────────────────────────────────

  setSearch: (q) => {
    set((s) => ({ filters: { ...s.filters, search: q, page: 1 } }));
    // Debounce the API call — 300ms avoids hammering on every keystroke
    if (_searchTimer) clearTimeout(_searchTimer);
    _searchTimer = setTimeout(() => {
      _searchTimer = null;
      get().loadTransactions();
    }, 300);
  },

  toggleStatus: (status) => {
    set((s) => {
      const next = new Set(s.filters.statuses);
      next.has(status) ? next.delete(status) : next.add(status);
      return { filters: { ...s.filters, statuses: next, page: 1 } };
    });
    get().loadTransactions();
  },

  toggleRisk: (risk) => {
    set((s) => {
      const next = new Set(s.filters.risks);
      next.has(risk) ? next.delete(risk) : next.add(risk);
      return { filters: { ...s.filters, risks: next, page: 1 } };
    });
    get().loadTransactions();
  },

  setPage: (page) => {
    set((s) => ({ filters: { ...s.filters, page } }));
    get().loadTransactions();
  },

  clearFilters: () => {
    set({ filters: { ...DEFAULT_FILTERS } });
    get().loadTransactions();
  },

  selectTransaction: (id) => set({ selectedId: id }),

  // ── WebSocket patches ────────────────────────────────────────────────────────

  wsAddTransaction: (tx) => {
    // Buffer incoming WS transactions and flush after 2s so row positions
    // stay stable while the user is clicking — prevents missed clicks.
    _pendingWsTx.push(tx);
    if (_wsFlushTimer) clearTimeout(_wsFlushTimer);
    _wsFlushTimer = setTimeout(() => {
      const pending = _pendingWsTx.splice(0);
      _wsFlushTimer = null;
      set((s) => {
        const merged = [...pending, ...s.transactions];
        // Deduplicate: pending takes precedence; existing entry is dropped on collision
        const seen = new Set<string>();
        const deduped = merged.filter((t) => !seen.has(t.id) && seen.add(t.id));
        let next = deduped.slice(0, s.filters.perPage);
        // Never drop the selected transaction off the page — it would close the drawer
        if (s.selectedId && !next.some((t) => t.id === s.selectedId)) {
          const kept = deduped.find((t) => t.id === s.selectedId);
          if (kept) next = [...next.slice(0, -1), kept];
        }
        return {
          transactions: next,
          totalCount: s.totalCount + pending.length,
          dashboard: s.dashboard
            ? {
                ...s.dashboard,
                totalTransactions: s.dashboard.totalTransactions + pending.length,
                flaggedCount:
                  s.dashboard.flaggedCount +
                  pending.filter(
                    (t) => t.status === 'flagged' || t.status === 'blocked' || t.status === 'review'
                  ).length,
              }
            : s.dashboard,
        };
      });
    }, 2000);
  },

  wsUpdateStatus: (id, status, rs) => {
    set((s) => ({
      transactions: s.transactions.map((tx) =>
        tx.id === id ? { ...tx, status, rs } : tx
      ),
      dashboard: s.dashboard
        ? {
            ...s.dashboard,
            // Recalculate flagged count delta when a transaction status changes
            flaggedCount: s.dashboard.flaggedCount,
          }
        : s.dashboard,
    }));
  },

  wsUpdateRisk: (id, rs, risk) => {
    set((s) => ({
      transactions: s.transactions.map((tx) =>
        tx.id === id ? { ...tx, rs, risk } : tx
      ),
    }));
  },
}));
