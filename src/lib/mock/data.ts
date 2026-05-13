/**
 * Mock data — Nigeria-focused AML / fraud monitoring shape.
 * Deterministic pseudo-random so re-renders never reshuffle data.
 * Names, merchants, amounts (NGN), risk reasons mapped to CBN / EFCC / BVN signals.
 */

import type {
  Customer,
  Merchant,
  RiskReason,
  Transaction,
  TransactionStatus,
  RiskLevel,
  Currency,
  PaymentMethod,
  ActivityBin,
  RiskBucket,
  AlertRule,
  TimelineEventKind,
} from '@/types';

// ─── Reference tables ──────────────────────────────────────────────────────────

export const CUSTOMERS: Customer[] = [
  { id: 'C-10421', name: 'Adebayo Adeyemi',   email: 'adebayo@stellartech.ng',     country: 'NG', city: 'Lagos · Lekki',        joined: '2023-04-12', tier: 'Business',   kyc: 'BVN Verified', rs: 18 },
  { id: 'C-10422', name: 'Chioma Okonkwo',    email: 'chioma.o@kavithalabs.ng',    country: 'NG', city: 'Lagos · Ikeja',        joined: '2024-01-19', tier: 'Personal',   kyc: 'BVN Verified', rs: 11 },
  { id: 'C-10423', name: 'Ibrahim Yusuf',     email: 'ibrahim@aurora.ng',          country: 'NG', city: 'Abuja',                joined: '2023-08-22', tier: 'Business',   kyc: 'BVN Verified', rs: 24 },
  { id: 'C-10424', name: 'Folake Adesanya',   email: 'folake@adesanya.co',         country: 'NG', city: 'Lagos · Victoria Is.', joined: '2024-05-30', tier: 'Personal',   kyc: 'BVN Verified', rs: 22 },
  { id: 'C-10425', name: 'Emeka Nwosu',       email: 'emeka@nwosulogistics.ng',    country: 'NG', city: 'Port Harcourt',        joined: '2024-03-05', tier: 'Business',   kyc: 'Pending',      rs: 67 },
  { id: 'C-10426', name: 'Aisha Bello',       email: 'a.bello@kanocrafts.ng',      country: 'NG', city: 'Kano',                 joined: '2023-02-14', tier: 'Personal',   kyc: 'BVN Verified', rs: 41 },
  { id: 'C-10427', name: 'Tunde Bakare',      email: 't.bakare@bakarefx.ng',       country: 'NG', city: 'Lagos · Ikoyi',        joined: '2022-06-28', tier: 'Enterprise', kyc: 'BVN Verified', rs: 9  },
  { id: 'C-10428', name: 'Ngozi Okafor',      email: 'ngozi@okaforimports.ng',     country: 'NG', city: 'Onitsha',              joined: '2023-09-11', tier: 'Business',   kyc: 'Review',       rs: 78 },
  { id: 'C-10429', name: 'Yusuf Mohammed',    email: 'yusuf.m@kaduna-traders.ng',  country: 'NG', city: 'Kaduna',               joined: '2022-11-03', tier: 'Business',   kyc: 'BVN Verified', rs: 32 },
  { id: 'C-10430', name: 'Funmilayo Adeleke', email: 'funmi@adeleke.studio',       country: 'NG', city: 'Ibadan',               joined: '2024-02-08', tier: 'Personal',   kyc: 'BVN Verified', rs: 19 },
  { id: 'C-10431', name: 'Chinedu Eze',       email: 'chinedu@ezeholdings.ng',     country: 'NG', city: 'Enugu',                joined: '2021-12-04', tier: 'Enterprise', kyc: 'BVN Verified', rs: 14 },
  { id: 'C-10432', name: 'Aminat Suleiman',   email: 'aminat@suleiman.ng',         country: 'NG', city: 'Abuja · Maitama',      joined: '2023-07-17', tier: 'Personal',   kyc: 'BVN Verified', rs: 7  },
  { id: 'C-10433', name: 'Idris Bello',       email: 'idris@bellofx.ng',           country: 'NG', city: 'Lagos · Lekki',        joined: '2024-04-21', tier: 'Business',   kyc: 'BVN Verified', rs: 88 },
  { id: 'C-10434', name: 'Olusegun Akinwumi', email: 'segun@akinwumi.co',          country: 'NG', city: 'Lagos · Yaba',         joined: '2023-10-09', tier: 'Personal',   kyc: 'BVN Verified', rs: 19 },
  { id: 'C-10435', name: 'Hauwa Abdullahi',   email: 'hauwa@northbridge.ng',       country: 'NG', city: 'Sokoto',               joined: '2024-06-13', tier: 'Business',   kyc: 'BVN Verified', rs: 46 },
  { id: 'C-10436', name: 'Damilola Eniola',   email: 'dami@eniolastudio.ng',       country: 'NG', city: 'Lagos · Surulere',     joined: '2024-03-28', tier: 'Personal',   kyc: 'BVN Verified', rs: 28 },
  { id: 'C-10437', name: 'Blessing Osayi',    email: 'blessing@osayi.org',         country: 'NG', city: 'Benin City',           joined: '2023-05-04', tier: 'Personal',   kyc: 'BVN Verified', rs: 12 },
  { id: 'C-10438', name: 'Kemi Adesoji',      email: 'kemi@adesoji.ng',            country: 'NG', city: 'Lagos · Lekki',        joined: '2024-07-02', tier: 'Business',   kyc: 'BVN Verified', rs: 53 },
];

export const MERCHANTS: Merchant[] = [
  { name: 'Flutterwave',        cat: 'Payment Processor', mcc: '6012' },
  { name: 'Paystack',           cat: 'Payment Processor', mcc: '6012' },
  { name: 'Interswitch',        cat: 'Payment Processor', mcc: '6012' },
  { name: 'OPay',               cat: 'Mobile Money',      mcc: '6051' },
  { name: 'PalmPay',            cat: 'Mobile Money',      mcc: '6051' },
  { name: 'Kuda Microfinance',  cat: 'Banking',           mcc: '6010' },
  { name: 'GTBank Transfer',    cat: 'Banking',           mcc: '6010' },
  { name: 'Access Bank Plc',    cat: 'Banking',           mcc: '6010' },
  { name: 'Zenith Bank',        cat: 'Banking',           mcc: '6010' },
  { name: 'Jumia Nigeria',      cat: 'E-commerce',        mcc: '5942' },
  { name: 'Konga',              cat: 'E-commerce',        mcc: '5942' },
  { name: 'Bolt Nigeria',       cat: 'Transportation',    mcc: '4121' },
  { name: 'Uber Nigeria',       cat: 'Transportation',    mcc: '4121' },
  { name: 'Chowdeck',           cat: 'Food Delivery',     mcc: '5814' },
  { name: 'MTN Nigeria',        cat: 'Telecom',           mcc: '4814' },
  { name: 'Airtel Nigeria',     cat: 'Telecom',           mcc: '4814' },
  { name: 'DStv · Multichoice', cat: 'Subscription',      mcc: '4899' },
  { name: 'PiggyVest',          cat: 'Savings',           mcc: '6300' },
  { name: 'Risevest',           cat: 'Investment',        mcc: '6211' },
  { name: 'Binance P2P',        cat: 'Crypto Exchange',   mcc: '6051' },
  { name: 'Bybit OTC',          cat: 'Crypto Exchange',   mcc: '6051' },
  { name: 'AWS Lagos',          cat: 'Cloud Services',    mcc: '7372' },
  { name: 'Wise · NGN→USD',     cat: 'Remittance',        mcc: '4829' },
  { name: 'Sendwave',           cat: 'Remittance',        mcc: '4829' },
];

export const RISK_REASONS: RiskReason[] = [
  { code: 'VEL-03', label: 'Velocity · 11 transfers / 4h',           severity: 'high'   },
  { code: 'GEO-02', label: 'Geo mismatch · IP outside Nigeria',      severity: 'medium' },
  { code: 'STR-01', label: 'Structuring · just-below ₦5M threshold', severity: 'high'   },
  { code: 'CBN-01', label: 'CBN reporting threshold breach (PND)',    severity: 'high'   },
  { code: 'PEP-01', label: 'PEP screening · partial match (78%)',    severity: 'high'   },
  { code: 'EFCC-1', label: 'EFCC watchlist · cleared',               severity: 'low'    },
  { code: 'BVN-02', label: 'BVN mismatch · biometric drift',         severity: 'high'   },
  { code: 'DEV-04', label: 'New device · first seen 4 min ago',      severity: 'medium' },
  { code: 'MUL-02', label: 'Mule indicator · pass-through ratio',    severity: 'high'   },
  { code: 'AMT-01', label: 'Amount > customer 90-day p99',           severity: 'medium' },
  { code: 'CHR-03', label: 'Chargeback history · 2 in 30d',          severity: 'medium' },
  { code: 'CRY-01', label: 'Crypto P2P exposure · 4 hops',           severity: 'medium' },
];

// ─── Deterministic PRNG ───────────────────────────────────────────────────────

function createRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// ─── Generator helpers ────────────────────────────────────────────────────────

const STATUSES: TransactionStatus[] = ['completed', 'pending', 'flagged', 'blocked', 'review', 'reversed'];
const STATUS_WEIGHTS = [55, 14, 12, 4, 10, 5];

function pickWeighted<T>(rng: () => number, items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

// ─── Transaction generation ───────────────────────────────────────────────────

/** Fixed "now" so the data is stable across renders — matches handoff design */
export const MOCK_NOW = new Date('2026-05-13T14:32:00Z').getTime();

export function generateTransactions(n = 84, seedOffset = 0): Transaction[] {
  const rng = createRng(42 + seedOffset);
  const list: Transaction[] = [];

  for (let i = 0; i < n; i++) {
    const customer = CUSTOMERS[Math.floor(rng() * CUSTOMERS.length)];
    const merchant = MERCHANTS[Math.floor(rng() * MERCHANTS.length)];
    const status = pickWeighted(rng, STATUSES, STATUS_WEIGHTS);

    // Naira amount distribution — Nigerian fintech typical spreads
    const tier = rng();
    let amount: number;
    if (tier > 0.96)      amount = Math.round(rng() * 95_000_000 + 5_000_000);   // ₦5M–₦100M corporate
    else if (tier > 0.85) amount = Math.round(rng() * 4_500_000 + 500_000);      // ₦500K–₦5M business
    else if (tier > 0.45) amount = Math.round(rng() * 480_000 + 20_000);         // ₦20K–₦500K mid
    else                  amount = Math.round(rng() * 19_500 + 500);             // ₦500–₦20K everyday

    let rs = Math.max(0, Math.min(100, customer.rs + (rng() - 0.4) * 30));
    if (status === 'flagged') rs = Math.max(rs, 62 + rng() * 25);
    if (status === 'blocked') rs = Math.max(rs, 85 + rng() * 13);
    if (status === 'review')  rs = Math.max(rs, 50 + rng() * 25);
    rs = Math.round(rs);

    const risk: RiskLevel = rs >= 80 ? 'critical' : rs >= 60 ? 'high' : rs >= 35 ? 'medium' : 'low';

    // Cross-border FX for remittance / crypto merchants
    const isCrossBorder = merchant.cat === 'Remittance' || merchant.cat === 'Crypto Exchange' ||
      (merchant.name === 'AWS Lagos' && rng() > 0.5);
    const currency: Currency = isCrossBorder && rng() > 0.4
      ? (rng() > 0.5 ? 'USD' : rng() > 0.5 ? 'GBP' : 'EUR')
      : 'NGN';
    if (currency !== 'NGN') amount = Math.max(50, Math.round(amount / 1500));

    // Risk reasons
    const reasons: RiskReason[] = [];
    const reasonPool = RISK_REASONS.filter((r) =>
      risk === 'critical' || risk === 'high' ? r.severity !== 'low'
      : risk === 'medium' ? r.severity !== 'high'
      : r.severity === 'low' || rng() > 0.8
    );
    const reasonCount =
      risk === 'low'    ? (rng() > 0.7 ? 1 : 0) :
      risk === 'medium' ? 1 + Math.floor(rng() * 2) :
                          2 + Math.floor(rng() * 2);
    for (let k = 0; k < reasonCount; k++) {
      const r = reasonPool[Math.floor(rng() * reasonPool.length)];
      if (r && !reasons.find((x) => x.code === r.code)) reasons.push(r);
    }

    const hoursBack = rng() > 0.45 ? rng() * 24 : 24 + rng() * 144;
    const ts = MOCK_NOW - hoursBack * 3600 * 1000;
    const direction = rng() > 0.35 ? 'out' : 'in';

    const method = rng() > 0.5 ? 'NIP Transfer' : rng() > 0.4 ? 'Card' : rng() > 0.5 ? 'USSD' : 'POS';

    list.push({
      id: `T-${94821 + i}`,
      customer,
      merchant,
      amount,
      currency,
      status,
      risk,
      rs,
      reasons,
      ts,
      direction: direction as 'in' | 'out',
      method: method as PaymentMethod,
      ref: 'NGN_' + Math.floor(rng() * 1e9).toString(36).toUpperCase(),
      ip: `${Math.floor(rng()*255)}.${Math.floor(rng()*255)}.${Math.floor(rng()*255)}.${Math.floor(rng()*255)}`,
      device: rng() > 0.4 ? 'Android 14 · Tecno' : rng() > 0.4 ? 'iOS 17 · iPhone' : rng() > 0.5 ? 'Android · Infinix' : 'Web · Chrome 124',
    });
  }

  return list.sort((a, b) => b.ts - a.ts);
}

// ─── Timeline builder ──────────────────────────────────────────────────────────

export function timelineFor(tx: Transaction) {
  const t0 = tx.ts;
  const out: Array<{ t: number; kind: TimelineEventKind; text: string; who: string; meta: string }> = [
    { t: t0,        kind: 'created', text: 'Transaction initiated', who: tx.customer.name, meta: tx.method + ' · ' + tx.device.split(' · ')[0] },
    { t: t0 + 1800, kind: 'rule',    text: 'Rule engine evaluated', who: 'Atlas v3.4',     meta: tx.reasons.length ? tx.reasons.length + ' signals fired' : 'no signals' },
  ];
  if (tx.reasons.length) {
    out.push({ t: t0 + 4200, kind: 'screen', text: 'NFIU + EFCC screening passed', who: 'EFCC · 06/2026', meta: '0 strong matches' });
  }
  if (tx.status === 'flagged') {
    out.push({ t: t0 + 9100, kind: 'flag', text: 'Held for analyst review', who: 'Atlas v3.4', meta: 'queued · priority ' + (tx.risk === 'critical' ? 'P1' : 'P2') });
  }
  if (tx.status === 'review') {
    out.push({ t: t0 + 9100,  kind: 'flag',    text: 'Routed to manual review', who: 'Atlas v3.4',    meta: 'EDD required' });
    out.push({ t: t0 + 86400, kind: 'analyst', text: 'Analyst assigned',        who: 'Tolu Adesina', meta: 'SLA · 4h remaining' });
  }
  if (tx.status === 'blocked') {
    out.push({ t: t0 + 9100,  kind: 'flag',  text: 'Held for analyst review',  who: 'Atlas v3.4',    meta: 'queued · P1' });
    out.push({ t: t0 + 41000, kind: 'block', text: 'Blocked · funds returned', who: 'Tolu Adesina', meta: 'rule: STR-01 confirmed' });
  }
  if (tx.status === 'completed') {
    out.push({ t: t0 + 11400, kind: 'settle', text: 'Settled to counterparty', who: tx.merchant.name, meta: tx.method });
  }
  if (tx.status === 'reversed') {
    out.push({ t: t0 + 11400,  kind: 'settle',  text: 'Settled to counterparty',    who: tx.merchant.name, meta: tx.method });
    out.push({ t: t0 + 254000, kind: 'reverse', text: 'Reversal · customer dispute', who: tx.customer.name, meta: 'chargeback initiated' });
  }
  return out.sort((a, b) => a.t - b.t);
}

export function historyFor(tx: Transaction, all: Transaction[]): Transaction[] {
  return all.filter((t) => t.customer.id === tx.customer.id && t.id !== tx.id).slice(0, 6);
}

// ─── Analytics ─────────────────────────────────────────────────────────────────

export function computeActivityBins(transactions: Transaction[]): ActivityBin[] {
  const now = MOCK_NOW;
  const bins: ActivityBin[] = Array.from({ length: 24 }, (_, i) => ({
    hour: i, total: 0, flagged: 0, label: (24 - i) + 'h',
  }));
  transactions.forEach((tx) => {
    const hoursBack = Math.floor((now - tx.ts) / (3600 * 1000));
    if (hoursBack >= 0 && hoursBack < 24) {
      const idx = 23 - hoursBack;
      bins[idx].total += 1;
      if (['flagged', 'blocked', 'review'].includes(tx.status)) bins[idx].flagged += 1;
    }
  });
  return bins;
}

export function computeRiskDistribution(transactions: Transaction[]): RiskBucket[] {
  const buckets: RiskBucket[] = Array.from({ length: 10 }, (_, i) => ({ lo: i * 10, hi: (i + 1) * 10, n: 0 }));
  transactions.forEach((tx) => {
    const i = Math.min(9, Math.floor(tx.rs / 10));
    buckets[i].n += 1;
  });
  return buckets;
}

export function computeTopAlerts(transactions: Transaction[]): AlertRule[] {
  const counts: Record<string, AlertRule> = {};
  transactions.forEach((tx) => {
    tx.reasons.forEach((r) => {
      if (!counts[r.code]) counts[r.code] = { code: r.code, label: r.label, severity: r.severity, n: 0 };
      counts[r.code].n += 1;
    });
  });
  return Object.values(counts).sort((a, b) => b.n - a.n).slice(0, 5);
}

export function sparkSeries(seed: number, n = 14, base = 50, vol = 12): number[] {
  const rng = createRng(seed);
  let v = base;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    v = Math.max(5, v + (rng() - 0.45) * vol);
    out.push(Math.round(v));
  }
  return out;
}

// ─── Singleton dataset (stable across module lifetime) ────────────────────────

export const TRANSACTIONS = generateTransactions(84);

export const MOCK_DATA = {
  transactions: TRANSACTIONS,
  activityBins: computeActivityBins(TRANSACTIONS),
  riskDistribution: computeRiskDistribution(TRANSACTIONS),
  topAlerts: computeTopAlerts(TRANSACTIONS),
  spark: {
    transactions: sparkSeries(1, 14, 320, 60),
    flagged:      sparkSeries(2, 14, 38, 8),
    customers:    sparkSeries(3, 14, 1240, 30),
    risk:         sparkSeries(4, 14, 32, 6),
  },
};
