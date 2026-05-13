import { describe, it, expect } from 'vitest';
import {
  generateTransactions,
  TRANSACTIONS,
  computeActivityBins,
  computeRiskDistribution,
  computeTopAlerts,
} from '@/lib/mock/data';

describe('generateTransactions', () => {
  it('generates the requested number of transactions', () => {
    expect(generateTransactions(50)).toHaveLength(50);
    expect(generateTransactions(10)).toHaveLength(10);
  });

  it('is deterministic — same seed produces same data', () => {
    const a = generateTransactions(20);
    const b = generateTransactions(20);
    expect(a.map((t) => t.id)).toEqual(b.map((t) => t.id));
    expect(a.map((t) => t.amount)).toEqual(b.map((t) => t.amount));
  });

  it('different seeds produce different data', () => {
    const a = generateTransactions(20, 0);
    const b = generateTransactions(20, 999);
    expect(a.map((t) => t.amount)).not.toEqual(b.map((t) => t.amount));
  });

  it('transactions are sorted newest-first', () => {
    const txns = generateTransactions(30);
    for (let i = 1; i < txns.length; i++) {
      expect(txns[i - 1].ts).toBeGreaterThanOrEqual(txns[i].ts);
    }
  });

  it('risk levels align with risk scores', () => {
    TRANSACTIONS.forEach((tx) => {
      if (tx.rs >= 80) expect(tx.risk).toBe('critical');
      else if (tx.rs >= 60) expect(tx.risk).toBe('high');
      else if (tx.rs >= 35) expect(tx.risk).toBe('medium');
      else expect(tx.risk).toBe('low');
    });
  });

  it('singleton dataset has 84 transactions', () => {
    expect(TRANSACTIONS).toHaveLength(84);
  });
});

describe('computeActivityBins', () => {
  it('returns 24 bins', () => {
    const bins = computeActivityBins(TRANSACTIONS);
    expect(bins).toHaveLength(24);
  });

  it('flagged count never exceeds total', () => {
    const bins = computeActivityBins(TRANSACTIONS);
    bins.forEach((b) => {
      expect(b.flagged).toBeLessThanOrEqual(b.total);
    });
  });
});

describe('computeRiskDistribution', () => {
  it('returns 10 buckets covering 0-100', () => {
    const buckets = computeRiskDistribution(TRANSACTIONS);
    expect(buckets).toHaveLength(10);
    expect(buckets[0].lo).toBe(0);
    expect(buckets[9].hi).toBe(100);
  });

  it('total count across buckets matches transaction count', () => {
    const buckets = computeRiskDistribution(TRANSACTIONS);
    const total = buckets.reduce((s, b) => s + b.n, 0);
    expect(total).toBe(TRANSACTIONS.length);
  });
});

describe('computeTopAlerts', () => {
  it('returns at most 5 alerts sorted by count descending', () => {
    const alerts = computeTopAlerts(TRANSACTIONS);
    expect(alerts.length).toBeLessThanOrEqual(5);
    for (let i = 1; i < alerts.length; i++) {
      expect(alerts[i - 1].n).toBeGreaterThanOrEqual(alerts[i].n);
    }
  });
});
