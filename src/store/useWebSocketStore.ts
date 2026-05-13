/**
 * WebSocket store — owns connection state and wires WS events into
 * the transaction store. This is the bridge between the WS service
 * and the rest of the application.
 *
 * Keeping it separate from useTransactionStore means the WS lifecycle
 * (connect/disconnect/reconnect) is cleanly isolated.
 */

import { create } from 'zustand';
import { wsService } from '@/lib/mock/websocket';
import { useTransactionStore } from './useTransactionStore';

interface WebSocketState {
  connected: boolean;
  latency: number;
  lastEventAt: number | null;
  newTxCount: number; // badge counter for "new since last visit"

  connect: () => void;
  disconnect: () => void;
  resetNewTxCount: () => void;
}

export const useWebSocketStore = create<WebSocketState>()((set, get) => ({
  connected: false,
  latency: 0,
  lastEventAt: null,
  newTxCount: 0,

  connect: () => {
    // Register our handler before connecting
    wsService.subscribe((event) => {
      const txStore = useTransactionStore.getState();

      switch (event.type) {
        case 'CONNECTION_STATUS':
          set({
            connected: event.payload.connected,
            latency: event.payload.latency ?? get().latency,
          });
          break;

        case 'NEW_TRANSACTION':
          set((s) => ({
            lastEventAt: Date.now(),
            newTxCount: s.newTxCount + 1,
          }));
          txStore.wsAddTransaction(event.payload);
          // Keep wsService aware of current IDs for status/risk mutations
          wsService.knownIds = [
            event.payload.id,
            ...wsService.knownIds,
          ].slice(0, 50);
          break;

        case 'STATUS_UPDATE':
          set({ lastEventAt: Date.now() });
          txStore.wsUpdateStatus(event.payload.id, event.payload.status, event.payload.rs);
          break;

        case 'RISK_UPDATE':
          set({ lastEventAt: Date.now() });
          txStore.wsUpdateRisk(event.payload.id, event.payload.rs, event.payload.risk);
          break;
      }
    });

    wsService.connect();
  },

  disconnect: () => {
    wsService.disconnect();
    set({ connected: false });
  },

  resetNewTxCount: () => set({ newTxCount: 0 }),
}));
