// ─── Core domain types ────────────────────────────────────────────────────────

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type TransactionStatus = 'completed' | 'pending' | 'flagged' | 'blocked' | 'review' | 'reversed';
export type TransactionDirection = 'in' | 'out';
export type Currency = 'NGN' | 'USD' | 'GBP' | 'EUR';
export type PaymentMethod = 'NIP Transfer' | 'Card' | 'USSD' | 'POS';
export type KycStatus = 'BVN Verified' | 'Pending' | 'Review';
export type CustomerTier = 'Personal' | 'Business' | 'Enterprise';

export interface Customer {
  id: string;
  name: string;
  email: string;
  country: string;
  city: string;
  joined: string;
  tier: CustomerTier;
  kyc: KycStatus;
  /** Customer-level risk score 0–100 */
  rs: number;
}

export interface Merchant {
  name: string;
  cat: string;
  mcc: string;
}

export interface RiskReason {
  code: string;
  label: string;
  severity: 'high' | 'medium' | 'low';
}

export interface Transaction {
  id: string;
  customer: Customer;
  merchant: Merchant;
  amount: number;
  currency: Currency;
  status: TransactionStatus;
  risk: RiskLevel;
  /** Transaction risk score 0–100 */
  rs: number;
  reasons: RiskReason[];
  /** Unix timestamp in ms */
  ts: number;
  direction: TransactionDirection;
  method: PaymentMethod;
  ref: string;
  ip: string;
  device: string;
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

export type TimelineEventKind =
  | 'created'
  | 'rule'
  | 'screen'
  | 'flag'
  | 'block'
  | 'settle'
  | 'reverse'
  | 'analyst';

export interface TimelineEvent {
  t: number;
  kind: TimelineEventKind;
  text: string;
  who: string;
  meta: string;
}

// ─── Dashboard analytics ──────────────────────────────────────────────────────

export interface ActivityBin {
  hour: number;
  total: number;
  flagged: number;
  label: string;
}

export interface RiskBucket {
  lo: number;
  hi: number;
  n: number;
}

export interface AlertRule {
  code: string;
  label: string;
  severity: 'high' | 'medium' | 'low';
  n: number;
}

export interface DashboardStats {
  totalTransactions: number;
  flaggedCount: number;
  activeCustomers: number;
  avgRiskScore: number;
  totalVolumeNGN: number;
  activityBins: ActivityBin[];
  riskDistribution: RiskBucket[];
  topAlerts: AlertRule[];
  recentFlagged: Transaction[];
  spark: {
    transactions: number[];
    flagged: number[];
    customers: number[];
    risk: number[];
  };
  deltaTransactions: string;
  deltaFlagged: string;
  deltaCustomers: string;
  deltaRisk: string;
}

// ─── WebSocket events ─────────────────────────────────────────────────────────

export type WsEventType =
  | 'NEW_TRANSACTION'
  | 'STATUS_UPDATE'
  | 'RISK_UPDATE'
  | 'CONNECTION_STATUS';

export interface WsEvent {
  type: WsEventType;
  payload: unknown;
}

export interface WsNewTransactionEvent extends WsEvent {
  type: 'NEW_TRANSACTION';
  payload: Transaction;
}

export interface WsStatusUpdateEvent extends WsEvent {
  type: 'STATUS_UPDATE';
  payload: { id: string; status: TransactionStatus; rs: number };
}

export interface WsRiskUpdateEvent extends WsEvent {
  type: 'RISK_UPDATE';
  payload: { id: string; rs: number; risk: RiskLevel };
}

export interface WsConnectionStatusEvent extends WsEvent {
  type: 'CONNECTION_STATUS';
  payload: { connected: boolean; latency?: number };
}

export type AnyWsEvent =
  | WsNewTransactionEvent
  | WsStatusUpdateEvent
  | WsRiskUpdateEvent
  | WsConnectionStatusEvent;

// ─── API response types ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

export interface TransactionFilters {
  search: string;
  statuses: Set<TransactionStatus>;
  risks: Set<RiskLevel>;
  page: number;
  perPage: number;
}
