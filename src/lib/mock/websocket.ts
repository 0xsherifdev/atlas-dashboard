/**
 * MockWebSocketService
 *
 * Simulates a persistent WebSocket connection to an AML event stream.
 * Emits three kinds of real-time events on realistic intervals:
 *
 *   NEW_TRANSACTION  — a new transaction arrives from the feed (every ~8–14s)
 *   STATUS_UPDATE    — a pending/flagged transaction changes status (every ~20–35s)
 *   RISK_UPDATE      — the risk engine recalculates a score (every ~30–50s)
 *
 * The service is a singleton: call MockWebSocketService.getInstance() to get it.
 * It manages its own reconnection backoff logic so the UI accurately shows
 * connection state (connected → reconnecting → connected).
 *
 * Consumers subscribe via .subscribe(handler) and receive typed AnyWsEvent objects.
 * Calling .unsubscribe(handler) removes the listener. .disconnect() stops all timers.
 */

import type {
  AnyWsEvent,
  WsNewTransactionEvent,
  WsStatusUpdateEvent,
  WsRiskUpdateEvent,
  WsConnectionStatusEvent,
  Transaction,
  TransactionStatus,
  RiskLevel,
} from '@/types';
import {
  CUSTOMERS,
  MERCHANTS,
  RISK_REASONS,
  MOCK_NOW,
  generateTransactions,
} from './data';

type EventHandler = (event: AnyWsEvent) => void;

// Pre-generate a pool of "incoming" transactions to draw from
const INCOMING_POOL = generateTransactions(40, 100);
let poolIndex = 0;

function nextIncomingTx(): Transaction {
  const tx = INCOMING_POOL[poolIndex % INCOMING_POOL.length];
  poolIndex += 1;
  // Give it a "just now" timestamp relative to system clock
  return {
    ...tx,
    id: `T-${99900 + poolIndex}`,
    ts: Date.now(),
    ref: 'NGN_' + Math.random().toString(36).slice(2, 10).toUpperCase(),
  };
}

class MockWebSocketService {
  private static _instance: MockWebSocketService;

  private handlers: Set<EventHandler> = new Set();
  private newTxTimer: ReturnType<typeof setTimeout> | null = null;
  private statusTimer: ReturnType<typeof setTimeout> | null = null;
  private riskTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private latencyInterval: ReturnType<typeof setInterval> | null = null;

  private _connected = false;
  private _latency = 0;

  /** Known transaction IDs the service can mutate (populated externally) */
  public knownIds: string[] = [];

  static getInstance(): MockWebSocketService {
    if (!MockWebSocketService._instance) {
      MockWebSocketService._instance = new MockWebSocketService();
    }
    return MockWebSocketService._instance;
  }

  get connected() { return this._connected; }
  get latency() { return this._latency; }

  // ─── Lifecycle ──────────────────────────────────────────────────────────────

  connect(): void {
    if (this._connected) return;

    // Simulate handshake delay
    setTimeout(() => {
      this._connected = true;
      this._latency = 12 + Math.floor(Math.random() * 18);
      this.emit<WsConnectionStatusEvent>({ type: 'CONNECTION_STATUS', payload: { connected: true, latency: this._latency } });
      this.scheduleNextTx();
      this.scheduleNextStatusUpdate();
      this.scheduleNextRiskUpdate();
      this.startLatencyHeartbeat();
    }, 800 + Math.random() * 400);
  }

  disconnect(): void {
    this._connected = false;
    this.clearAllTimers();
    this.emit<WsConnectionStatusEvent>({ type: 'CONNECTION_STATUS', payload: { connected: false } });
  }

  /** Simulate a transient disconnect + auto-reconnect (for demo realism) */
  simulateReconnect(): void {
    this.disconnect();
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, 2000 + Math.random() * 3000);
  }

  // ─── Subscriptions ──────────────────────────────────────────────────────────

  subscribe(handler: EventHandler): () => void {
    this.handlers.add(handler);
    // If already connected, immediately notify the new subscriber
    if (this._connected) {
      handler({ type: 'CONNECTION_STATUS', payload: { connected: true, latency: this._latency } });
    }
    return () => this.unsubscribe(handler);
  }

  unsubscribe(handler: EventHandler): void {
    this.handlers.delete(handler);
  }

  // ─── Event scheduling ───────────────────────────────────────────────────────

  private scheduleNextTx(): void {
    if (!this._connected) return;
    // New transaction every 15–25 seconds
    const ms = 15000 + Math.random() * 10000;
    this.newTxTimer = setTimeout(() => {
      if (!this._connected) return;
      const tx = nextIncomingTx();
      this.emit<WsNewTransactionEvent>({ type: 'NEW_TRANSACTION', payload: tx });
      this.scheduleNextTx();
    }, ms);
  }

  private scheduleNextStatusUpdate(): void {
    if (!this._connected) return;
    // Status change every 40–60 seconds
    const ms = 40000 + Math.random() * 20000;
    this.statusTimer = setTimeout(() => {
      if (!this._connected || this.knownIds.length === 0) {
        this.scheduleNextStatusUpdate();
        return;
      }
      const id = this.knownIds[Math.floor(Math.random() * this.knownIds.length)];
      const transitions: Array<{ status: TransactionStatus; rs: number }> = [
        { status: 'completed', rs: 22 },
        { status: 'review',    rs: 65 },
        { status: 'blocked',   rs: 91 },
        { status: 'flagged',   rs: 75 },
      ];
      const update = transitions[Math.floor(Math.random() * transitions.length)];
      this.emit<WsStatusUpdateEvent>({
        type: 'STATUS_UPDATE',
        payload: { id, status: update.status, rs: update.rs },
      });
      this.scheduleNextStatusUpdate();
    }, ms);
  }

  private scheduleNextRiskUpdate(): void {
    if (!this._connected) return;
    // Risk score recalc every 60–90 seconds
    const ms = 60000 + Math.random() * 30000;
    this.riskTimer = setTimeout(() => {
      if (!this._connected || this.knownIds.length === 0) {
        this.scheduleNextRiskUpdate();
        return;
      }
      const id = this.knownIds[Math.floor(Math.random() * this.knownIds.length)];
      const rs = Math.floor(Math.random() * 100);
      const risk: RiskLevel = rs >= 80 ? 'critical' : rs >= 60 ? 'high' : rs >= 35 ? 'medium' : 'low';
      this.emit<WsRiskUpdateEvent>({ type: 'RISK_UPDATE', payload: { id, rs, risk } });
      this.scheduleNextRiskUpdate();
    }, ms);
  }

  /** Drift the latency reading slightly every 5s for realism */
  private startLatencyHeartbeat(): void {
    this.latencyInterval = setInterval(() => {
      if (!this._connected) return;
      this._latency = Math.max(8, this._latency + Math.floor((Math.random() - 0.5) * 6));
      // Fire an update so the status bar can re-render
      this.emit<WsConnectionStatusEvent>({
        type: 'CONNECTION_STATUS',
        payload: { connected: true, latency: this._latency },
      });
    }, 5000);
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private emit<T extends AnyWsEvent>(event: T): void {
    this.handlers.forEach((h) => h(event));
  }

  private clearAllTimers(): void {
    if (this.newTxTimer)    clearTimeout(this.newTxTimer);
    if (this.statusTimer)   clearTimeout(this.statusTimer);
    if (this.riskTimer)     clearTimeout(this.riskTimer);
    if (this.reconnectTimer)clearTimeout(this.reconnectTimer);
    if (this.latencyInterval) clearInterval(this.latencyInterval);
    this.newTxTimer = null;
    this.statusTimer = null;
    this.riskTimer = null;
    this.reconnectTimer = null;
    this.latencyInterval = null;
  }
}

export const wsService = MockWebSocketService.getInstance();
