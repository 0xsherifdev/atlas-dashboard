# Atlas — Transaction Monitoring Dashboard

A production-grade AML/fraud monitoring dashboard for Nigerian fintech, built as a frontend engineering assessment. The UI is pixel-faithful to the design handoff; the architecture is designed to swap in a real backend with minimal changes.

---

## Setup

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # production build
pnpm test       # run test suite (52 tests)
pnpm lint
```

**Login credentials:** any valid email + any password >= 8 chars. Enter `wrongpass` as the password to trigger the error state.

### Docker

```bash
docker build -t atlas-dashboard .
docker run -p 3000:3000 atlas-dashboard
```

The Dockerfile uses a multi-stage build (install, build, run) with `output: "standalone"` for minimal image size. The final stage runs as a non-root user.

---

## Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 16 (App Router) | Routing, SSR-ready, fast HMR |
| Language | TypeScript (strict) | Full type safety across data -> UI |
| Styling | Tailwind CSS v4 + CSS custom properties | Utility classes with a custom token layer that mirrors the design exactly |
| Components | shadcn/ui | Accessible primitives; only used where they add value (Button, Skeleton, etc.) |
| State | Zustand | Simple, minimal boilerplate, perfect for this shape of shared client state |
| Charts | Hand-rolled SVG | No chart library overhead; each chart is purpose-built and `React.memo`-wrapped |
| Testing | Vitest + Testing Library | Fast, ESM-native test runner with DOM assertions |
| Fonts | Geist + Geist Mono | Used in the original design |

---

## Architecture decisions

### Data fetching — mock API layer

All data flows through `src/lib/api/index.ts`, never from the mock data directly. Every function is typed, async, and introduces realistic latency jitter:

```
UI component
  -> calls useTransactionStore.loadTransactions()
      -> calls fetchTransactions(filters)           <- mock API
          -> filters MOCK_DATA, delays ~280ms
          -> returns ApiResponse<Transaction[]>
      -> patches store: { transactions, totalCount, totalPages }
```

**Swapping in a real backend is a one-file change.** Replace the implementations in `src/lib/api/index.ts` with `fetch()` calls — every consumer already uses the correct types and handles loading/error states.

### State management — Zustand

Four focused stores, each owning a single concern:

```
useAuthStore       — session, sign-in/out, persisted to localStorage
useTransactionStore — transactions, filters, pagination, dashboard stats
useUIStore         — dark mode, sidebar state, persisted to localStorage
useWebSocketStore  — WS connection state, bridges events into the tx store
```

Filters live in the store (not component state) so the filter state survives navigation between Dashboard and Transactions views. Search is debounced (300ms). Stale API responses are discarded via request IDs.

### WebSocket simulation

`src/lib/mock/websocket.ts` implements a `MockWebSocketService` singleton that:

- Simulates a real connection lifecycle with a handshake delay (~800ms)
- Emits **three event types** on realistic intervals:
  - `NEW_TRANSACTION` — new transaction arrives (every 15-25s), prepended to the table with a blue row-flash animation
  - `STATUS_UPDATE` — a transaction's status changes (every 40-60s), e.g. `pending -> flagged`
  - `RISK_UPDATE` — risk score is recalculated (every 60-90s)
- Includes a latency heartbeat (drift every 5s) shown in the status bar
- Manages reconnection backoff — the sidebar live indicator goes grey during reconnects
- Exposes a clean `subscribe(handler) -> unsubscribe` API

`useWebSocketStore` subscribes on mount and dispatches all events into `useTransactionStore`. New WS transactions are buffered for 2s before flushing to prevent row shuffling while the user is clicking. The dashboard KPI counters, flagged badge, and table rows all update in real time without any polling.

### Shared UI components

Reusable primitives are extracted to `src/components/ui/`:

- **Card / CardHeader** — consistent card styling with Tailwind CSS variable syntax (no inline styles)
- **IconButton** — sized icon button with hover states via Tailwind `hover:` classes (no JS hover handlers)
- **Chip** — toggle chip with `aria-pressed` for filter accessibility
- **StatusPill / RiskPill** — status/risk badges with semantic color tokens
- **AtlasAvatar** — deterministic color-hashed avatar

### Design tokens

The handoff uses a CSS custom property token system (`--atlas-bg`, `--atlas-surface`, `--atlas-status-err`, etc.). Custom properties are defined in `globals.css` and used directly via Tailwind v4's CSS variable syntax:

```tsx
className="text-(--atlas-text-3) bg-(--atlas-bg-err)"
```

Dark mode is toggled by adding/removing the `.dark` class on the root div — same pattern as the original prototype.

---

## Folder structure

```
src/
  app/              Next.js App Router — layout, page, globals.css
  components/
    auth/           LoginForm
    charts/         Sparkline, RiskMeter, ActivityHistogram, RiskDistribution (all React.memo)
    dashboard/      DashboardScreen, KpiCard
    drawer/         TransactionDrawer (tabs: Overview, Indicators, History, Timeline)
    layout/         Sidebar, Topbar, Statusbar, BottomNav
    transactions/   TransactionsScreen (search, filter chips, paginated table)
    ui/             Card, IconButton, Chip, StatusPill, RiskPill, AtlasAvatar, AtlasMark (+ shadcn primitives)
  lib/
    api/            Mock API service layer — async functions with jitter delays
    mock/
      data.ts       Deterministic transaction generator (seed 42, 84 txns)
      websocket.ts  MockWebSocketService singleton
    utils.ts        Currency/time formatters, class helpers, color utilities
  store/
    useAuthStore.ts
    useTransactionStore.ts
    useUIStore.ts
    useWebSocketStore.ts
  types/
    index.ts        All domain types — Transaction, Customer, WsEvent, etc.
  __tests__/
    api.test.ts     API layer tests (pagination, filtering, search, auth)
    data.test.ts    Data generator tests (determinism, sorting, risk alignment)
    utils.test.ts   Utility function tests (currency formatting, time, initials)
    transaction-store.test.ts  Store tests (filter mutations, selection, WS patches)
```

---

## Testing

52 tests across 4 test files, covering:

- **API layer** — pagination, filtering by status/risk, search, auth (login success, error, empty credentials)
- **Data generation** — deterministic output, sort order, risk score/level alignment, analytics aggregation
- **Utility functions** — currency formatting (NGN/USD/short notation), relative time, initials, avatar colors, status metadata
- **Transaction store** — filter toggle/clear, page reset on filter change, selection/deselection, WebSocket status and risk patches

```bash
pnpm test           # single run
pnpm test:watch     # watch mode
```

---

## Features

- **Login** — email/password validation, loading state, server error state, SSO/Passkey buttons (decorative with tooltips), ambient background with grid texture
- **Dashboard** — 4 KPI cards with sparklines, 24h activity histogram (hover tooltip), risk distribution chart, top alert rules bar chart, recently flagged list
- **Transactions table** — search, multi-select status/risk filter chips (`aria-pressed`), keyboard-navigable rows, 10-per-page pagination with smart page window, row click opens drawer
- **Transaction drawer** — `role="dialog"` with `aria-label`, 4 tabs: Overview (customer + session details), Indicators (risk signals + screening), History (customer's prior txns), Timeline (event log with colour-coded dots). Block/Escalate/Approve actions with feedback
- **Dark mode** — full token-based theme switch, persisted across sessions
- **Real-time WebSocket** — new transactions arrive live, status/risk scores update in place, table rows flash on arrival, live indicator in sidebar shows latency
- **Loading skeletons** — shimmer placeholders for every async surface
- **Error states** — retry UI for both dashboard and transactions
- **Responsive** — desktop sidebar + drawer that shrinks content; mobile bottom nav, card list, bottom-sheet drawer with drag handle

---

## Bonus items completed

- Dark mode (default on, toggle in topbar)
- WebSocket/polling simulation with three event types and latency heartbeat
- Micro-interactions: row flash on WS insert, badge pop animation, drawer slide-in, hover transitions
- Unit tests: 52 tests covering API, data, utilities, and store mutations
- Docker: multi-stage build, standalone output, non-root user, pnpm cache mount
- Accessibility: `aria-pressed` on filter chips, `role="dialog"` on drawer, keyboard navigation on table rows
- Performance: all chart components wrapped with `React.memo`
