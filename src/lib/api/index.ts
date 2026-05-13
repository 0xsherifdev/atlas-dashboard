/**
 * Mock API service layer.
 *
 * Every function mirrors what a real REST endpoint would look like:
 *   - Returns a typed promise
 *   - Simulates network latency
 *   - Supports artificial error injection for demo error states
 *
 * This layer means swapping in a real API later is a one-file change —
 * all consumers call these functions, not the mock data directly.
 */

import {
  MOCK_DATA,
  timelineFor,
  historyFor,
  computeActivityBins,
  computeRiskDistribution,
  computeTopAlerts,
} from '@/lib/mock/data';
import type {
  Transaction,
  DashboardStats,
  TransactionFilters,
  ApiResponse,
  TimelineEvent,
} from '@/types';

// ─── Simulated network delay ──────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Jitter ±25% around a target latency — feels more real than a fixed wait. */
function jitter(base: number): number {
  return base * (0.75 + Math.random() * 0.5);
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

/**
 * GET /dashboard/stats
 * Returns aggregated KPI metrics, chart data, and recent flagged transactions.
 */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  await delay(jitter(420));

  const { transactions, spark } = MOCK_DATA;
  const flagged = transactions.filter((t) =>
    t.status === 'flagged' || t.status === 'blocked' || t.status === 'review'
  );
  const totalVolumeNGN = transactions
    .filter((t) => t.currency === 'NGN')
    .reduce((s, t) => s + t.amount, 0);
  const avgRiskScore = Math.round(
    transactions.reduce((s, t) => s + t.rs, 0) / transactions.length
  );

  return {
    totalTransactions: transactions.length,
    flaggedCount: flagged.length,
    activeCustomers: 1284,
    avgRiskScore,
    totalVolumeNGN,
    activityBins: computeActivityBins(transactions),
    riskDistribution: computeRiskDistribution(transactions),
    topAlerts: computeTopAlerts(transactions),
    recentFlagged: flagged.slice(0, 5),
    spark,
    deltaTransactions: '+12.4%',
    deltaFlagged: '+3',
    deltaCustomers: '+1.8%',
    deltaRisk: '-2',
  };
}

/**
 * GET /transactions?page=1&perPage=10&search=...&status=...&risk=...
 * Returns paginated, filtered, searched transaction list.
 */
export async function fetchTransactions(
  filters: TransactionFilters
): Promise<ApiResponse<Transaction[]>> {
  await delay(jitter(280));

  const { search, statuses, risks, page, perPage } = filters;
  const s = search.trim().toLowerCase();

  const filtered = MOCK_DATA.transactions.filter((tx) => {
    if (statuses.size && !statuses.has(tx.status)) return false;
    if (risks.size && !risks.has(tx.risk)) return false;
    if (s) {
      const haystack = `${tx.customer.name} ${tx.merchant.name} ${tx.id} ${tx.ref} ${tx.customer.email}`.toLowerCase();
      if (!haystack.includes(s)) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const data = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  return {
    data,
    meta: {
      total: filtered.length,
      page: safePage,
      perPage,
      totalPages,
    },
  };
}

/**
 * GET /transactions/:id
 * Returns a single transaction. Slower than list — simulates a detail fetch.
 */
export async function fetchTransaction(id: string): Promise<Transaction | null> {
  await delay(jitter(180));
  return MOCK_DATA.transactions.find((t) => t.id === id) ?? null;
}

/**
 * GET /transactions/:id/timeline
 */
export async function fetchTimeline(id: string): Promise<TimelineEvent[]> {
  await delay(jitter(200));
  const tx = MOCK_DATA.transactions.find((t) => t.id === id);
  if (!tx) return [];
  return timelineFor(tx);
}

/**
 * GET /transactions/:id/history  (customer transaction history)
 */
export async function fetchCustomerHistory(txId: string): Promise<Transaction[]> {
  await delay(jitter(220));
  const tx = MOCK_DATA.transactions.find((t) => t.id === txId);
  if (!tx) return [];
  return historyFor(tx, MOCK_DATA.transactions);
}

/**
 * POST /transactions/:id/approve
 */
export async function approveTransaction(_id: string): Promise<{ success: boolean }> {
  await delay(jitter(600));
  return { success: true };
}

/**
 * POST /transactions/:id/block
 */
export async function blockTransaction(_id: string): Promise<{ success: boolean }> {
  await delay(jitter(600));
  return { success: true };
}

/**
 * POST /transactions/:id/escalate
 */
export async function escalateTransaction(_id: string): Promise<{ success: boolean }> {
  await delay(jitter(400));
  return { success: true };
}

/**
 * POST /auth/login
 * Validates credentials. Returns a session token on success.
 * Throws on bad credentials to simulate a 401.
 */
export async function login(
  email: string,
  password: string
): Promise<{ token: string; user: { name: string; role: string } }> {
  await delay(jitter(900));

  if (password === 'wrong') {
    throw new Error('Invalid credentials. Try again or use SSO.');
  }

  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  return {
    token: 'mock-jwt-' + Math.random().toString(36).slice(2),
    user: { name: 'Sherifdeen Adebayo', role: 'Senior Analyst' },
  };
}
