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
    set({ txLoading: true, txError: null });
    try {
      const { data, meta } = await fetchTransactions(get().filters);
      set({
        transactions: data,
        totalCount: meta?.total ?? data.length,
        totalPages: meta?.totalPages ?? 1,
        txLoading: false,
      });
    } catch (e) {
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
    get().loadTransactions();
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
    set((s) => ({
      transactions: [tx, ...s.transactions].slice(0, s.filters.perPage),
      totalCount: s.totalCount + 1,
      // Also patch the dashboard flagged count if relevant
      dashboard: s.dashboard
        ? {
            ...s.dashboard,
            totalTransactions: s.dashboard.totalTransactions + 1,
            flaggedCount:
              tx.status === 'flagged' || tx.status === 'blocked' || tx.status === 'review'
                ? s.dashboard.flaggedCount + 1
                : s.dashboard.flaggedCount,
          }
        : s.dashboard,
    }));
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
