import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Transaction, TransactionFilters } from '@/types';

// Mock the API to prevent async side effects during filter tests
vi.mock('@/lib/api', () => ({
  fetchTransactions: vi.fn().mockResolvedValue({
    data: [],
    meta: { total: 0, page: 1, perPage: 10, totalPages: 1 },
  }),
  fetchDashboardStats: vi.fn().mockResolvedValue({
    totalTransactions: 0,
    flaggedCount: 0,
    activeCustomers: 0,
    avgRiskScore: 0,
    totalVolumeNGN: 0,
    activityBins: [],
    riskDistribution: [],
    topAlerts: [],
    recentFlagged: [],
    spark: { transactions: [], flagged: [], customers: [], risk: [] },
    deltaTransactions: '0', deltaFlagged: '0', deltaCustomers: '0', deltaRisk: '0',
  }),
  login: vi.fn(),
}));

import { useTransactionStore } from '@/store/useTransactionStore';

const DEFAULT_FILTERS: TransactionFilters = {
  search: '',
  statuses: new Set(),
  risks: new Set(),
  page: 1,
  perPage: 10,
};

function resetStore() {
  useTransactionStore.setState({
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
  });
}

describe('useTransactionStore — filter mutations', () => {
  beforeEach(resetStore);

  it('toggles a status filter on and off', () => {
    useTransactionStore.getState().toggleStatus('flagged');
    expect(useTransactionStore.getState().filters.statuses.has('flagged')).toBe(true);

    useTransactionStore.getState().toggleStatus('flagged');
    expect(useTransactionStore.getState().filters.statuses.has('flagged')).toBe(false);
  });

  it('toggles a risk filter on and off', () => {
    useTransactionStore.getState().toggleRisk('critical');
    expect(useTransactionStore.getState().filters.risks.has('critical')).toBe(true);

    useTransactionStore.getState().toggleRisk('critical');
    expect(useTransactionStore.getState().filters.risks.has('critical')).toBe(false);
  });

  it('supports multiple simultaneous filters', () => {
    const { toggleStatus, toggleRisk } = useTransactionStore.getState();
    toggleStatus('flagged');
    toggleStatus('blocked');
    toggleRisk('high');

    const { statuses, risks } = useTransactionStore.getState().filters;
    expect(statuses.has('flagged')).toBe(true);
    expect(statuses.has('blocked')).toBe(true);
    expect(risks.has('high')).toBe(true);
  });

  it('resets page to 1 when a filter changes', () => {
    useTransactionStore.setState({
      filters: { ...useTransactionStore.getState().filters, page: 5 },
    });
    expect(useTransactionStore.getState().filters.page).toBe(5);

    useTransactionStore.getState().toggleStatus('review');
    expect(useTransactionStore.getState().filters.page).toBe(1);
  });

  it('clears all filters', () => {
    const store = useTransactionStore.getState();
    store.toggleStatus('flagged');
    store.toggleRisk('high');
    store.setSearch('test query');

    useTransactionStore.getState().clearFilters();
    const { statuses, risks, search, page } = useTransactionStore.getState().filters;
    expect(statuses.size).toBe(0);
    expect(risks.size).toBe(0);
    expect(search).toBe('');
    expect(page).toBe(1);
  });
});

describe('useTransactionStore — selection', () => {
  beforeEach(resetStore);

  it('selects a transaction by ID', () => {
    useTransactionStore.getState().selectTransaction('T-94821');
    expect(useTransactionStore.getState().selectedId).toBe('T-94821');
  });

  it('deselects when passed null', () => {
    useTransactionStore.getState().selectTransaction('T-94821');
    useTransactionStore.getState().selectTransaction(null);
    expect(useTransactionStore.getState().selectedId).toBeNull();
  });

  it('clears selection when page changes', () => {
    useTransactionStore.getState().selectTransaction('T-94821');
    useTransactionStore.getState().setPage(2);
    expect(useTransactionStore.getState().selectedId).toBeNull();
  });
});

describe('useTransactionStore — WebSocket patches', () => {
  beforeEach(resetStore);

  it('updates transaction status via wsUpdateStatus', () => {
    const tx: Transaction = {
      id: 'T-100', customer: { id: 'C-1', name: 'Test', email: 'a@b.com', country: 'NG', city: 'Lagos', joined: '2024-01-01', tier: 'Personal', kyc: 'BVN Verified', rs: 20 },
      merchant: { name: 'Test Merchant', cat: 'Banking', mcc: '6010' },
      amount: 50000, currency: 'NGN', status: 'pending', risk: 'low', rs: 20,
      reasons: [], ts: Date.now(), direction: 'out', method: 'NIP Transfer',
      ref: 'REF1', ip: '1.2.3.4', device: 'Web · Chrome 124',
    };
    useTransactionStore.setState({ transactions: [tx] });

    useTransactionStore.getState().wsUpdateStatus('T-100', 'flagged', 72);

    const updated = useTransactionStore.getState().transactions[0];
    expect(updated.status).toBe('flagged');
    expect(updated.rs).toBe(72);
  });

  it('updates transaction risk via wsUpdateRisk', () => {
    const tx: Transaction = {
      id: 'T-200', customer: { id: 'C-2', name: 'Test2', email: 'b@c.com', country: 'NG', city: 'Abuja', joined: '2024-01-01', tier: 'Business', kyc: 'BVN Verified', rs: 30 },
      merchant: { name: 'Merchant2', cat: 'E-commerce', mcc: '5942' },
      amount: 100000, currency: 'NGN', status: 'completed', risk: 'medium', rs: 45,
      reasons: [], ts: Date.now(), direction: 'in', method: 'Card',
      ref: 'REF2', ip: '5.6.7.8', device: 'iOS 17 · iPhone',
    };
    useTransactionStore.setState({ transactions: [tx] });

    useTransactionStore.getState().wsUpdateRisk('T-200', 85, 'critical');

    const updated = useTransactionStore.getState().transactions[0];
    expect(updated.rs).toBe(85);
    expect(updated.risk).toBe('critical');
  });
});
