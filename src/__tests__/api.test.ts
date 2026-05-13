import { describe, it, expect } from 'vitest';
import {
  fetchTransactions,
  fetchTransaction,
  fetchDashboardStats,
  fetchTimeline,
  fetchCustomerHistory,
  login,
} from '@/lib/api';
import type { TransactionFilters } from '@/types';

const baseFilters: TransactionFilters = {
  search: '',
  statuses: new Set(),
  risks: new Set(),
  page: 1,
  perPage: 10,
};

describe('fetchTransactions', () => {
  it('returns paginated results', async () => {
    const res = await fetchTransactions(baseFilters);
    expect(res.data.length).toBeLessThanOrEqual(10);
    expect(res.meta).toBeDefined();
    expect(res.meta!.page).toBe(1);
    expect(res.meta!.total).toBeGreaterThan(0);
  });

  it('filters by status', async () => {
    const res = await fetchTransactions({
      ...baseFilters,
      statuses: new Set(['flagged']),
    });
    res.data.forEach((tx) => {
      expect(tx.status).toBe('flagged');
    });
  });

  it('filters by risk', async () => {
    const res = await fetchTransactions({
      ...baseFilters,
      risks: new Set(['critical']),
    });
    res.data.forEach((tx) => {
      expect(tx.risk).toBe('critical');
    });
  });

  it('filters by search term', async () => {
    const res = await fetchTransactions({
      ...baseFilters,
      search: 'Adebayo',
    });
    res.data.forEach((tx) => {
      const haystack = `${tx.customer.name} ${tx.merchant.name} ${tx.id} ${tx.ref} ${tx.customer.email}`.toLowerCase();
      expect(haystack).toContain('adebayo');
    });
  });

  it('handles pagination correctly', async () => {
    const p1 = await fetchTransactions({ ...baseFilters, page: 1 });
    const p2 = await fetchTransactions({ ...baseFilters, page: 2 });
    const p1ids = p1.data.map((t) => t.id);
    const p2ids = p2.data.map((t) => t.id);
    // No overlap between pages
    p2ids.forEach((id) => {
      expect(p1ids).not.toContain(id);
    });
  });

  it('clamps page to valid range', async () => {
    const res = await fetchTransactions({ ...baseFilters, page: 9999 });
    expect(res.meta!.page).toBeLessThanOrEqual(res.meta!.totalPages);
  });
});

describe('fetchTransaction', () => {
  it('returns a transaction by ID', async () => {
    const tx = await fetchTransaction('T-94821');
    expect(tx).not.toBeNull();
    expect(tx!.id).toBe('T-94821');
  });

  it('returns null for unknown ID', async () => {
    const tx = await fetchTransaction('T-99999');
    expect(tx).toBeNull();
  });
});

describe('fetchDashboardStats', () => {
  it('returns all expected fields', async () => {
    const stats = await fetchDashboardStats();
    expect(stats.totalTransactions).toBeGreaterThan(0);
    expect(stats.flaggedCount).toBeGreaterThanOrEqual(0);
    expect(stats.activeCustomers).toBeGreaterThan(0);
    expect(stats.avgRiskScore).toBeGreaterThanOrEqual(0);
    expect(stats.activityBins).toHaveLength(24);
    expect(stats.riskDistribution).toHaveLength(10);
    expect(stats.topAlerts.length).toBeGreaterThan(0);
    expect(stats.recentFlagged.length).toBeLessThanOrEqual(5);
    expect(stats.spark.transactions).toHaveLength(14);
  });
});

describe('fetchTimeline', () => {
  it('returns events sorted chronologically', async () => {
    const events = await fetchTimeline('T-94821');
    expect(events.length).toBeGreaterThan(0);
    for (let i = 1; i < events.length; i++) {
      expect(events[i].t).toBeGreaterThanOrEqual(events[i - 1].t);
    }
  });

  it('returns empty array for unknown ID', async () => {
    const events = await fetchTimeline('T-99999');
    expect(events).toEqual([]);
  });
});

describe('fetchCustomerHistory', () => {
  it('returns transactions for the same customer', async () => {
    const history = await fetchCustomerHistory('T-94821');
    // History should not contain the transaction itself
    history.forEach((tx) => {
      expect(tx.id).not.toBe('T-94821');
    });
  });
});

describe('login', () => {
  it('returns token and user on valid credentials', async () => {
    const result = await login('test@example.com', 'validpass');
    expect(result.token).toBeTruthy();
    expect(result.user.name).toBeTruthy();
  });

  it('throws on password "wrongpass"', async () => {
    await expect(login('test@example.com', 'wrongpass')).rejects.toThrow(
      'Invalid credentials'
    );
  });

  it('throws on empty credentials', async () => {
    await expect(login('', '')).rejects.toThrow('Email and password are required');
  });
});
