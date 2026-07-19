# Hono REST API Completion Plan

## Context

The app currently has **two parallel data-fetching patterns**: Next.js Server Actions (`app/api/actions/`) and a Hono REST API (`server/modules/`). Only **persons** and **shops** are implemented in Hono. This plan covers completing the remaining 11 domains and establishing shared infrastructure.

---

## Phase 0: Shared Infrastructure

### 0.1 — Auth Middleware

Create `server/middleware/auth.ts` to replace `handleServerAction`'s token verification.

```
server/
  middleware/
    auth.ts          — session cookie verification, sets c.set("user", person)
    requireRole.ts   — role guard factory: requireRole("ADMIN", "MANAGER")
```

**Behavior:**
- Reads session cookie, looks up `Session` record in DB, attaches `Person` to Hono context
- Returns 401 if no valid session
- `requireRole(...roles)` returns 403 if user role not in allowed list

> **⚠️ Cannot reuse `utils/auth.ts` directly.** It is a Next.js server action (`'use server'`) that reads cookies via `cookies()` from `next/headers` — incompatible with Hono. The Session lookup and `expireAt` expiry logic must be **ported**, reading the cookie via `getCookie(c, ...)` from `hono/cookie` (or `c.req.header('cookie')`). Do not import `utils/auth.ts` into middleware.
>
> **CSRF:** Server actions had built-in CSRF protection; a cookie-authenticated REST API does not. Ensure session cookies use `SameSite=Lax/Strict` and consider a CSRF token strategy for mutating routes.

### 0.2 — Error Handling Middleware

Create `server/middleware/errorHandler.ts` — wraps handlers in try/catch, returns consistent `{ error: string }` shape with proper status codes.

### 0.3 — Response Helpers

Create `server/utils/response.ts` with typed helpers:
- `success(c, data, message?, status?)` 
- `error(c, message, status)`

### 0.4 — Pagination Helper

Create `server/utils/pagination.ts` — standardize on `{ page, limit }` query params returning `{ data, meta: { total, page, limit, totalPages } }`.

### 0.5 — Missing Zod Schemas

Most domains already have schemas under `schema/` and should be **reused as-is**: `chargeSchema.ts`, `paymentSchema.ts`, `cost-IncomeSchema.ts`, `importSchema.ts`, `balanceSchema.ts`, `personSchema.ts`, `shopSchema.ts`.

Create schemas only for the domains that lack them:
- `schema/historySchema.ts`
- `schema/bankSchema.ts`
- `schema/operationSchema.ts`
- `schema/referenceSchema.ts` (reference generation params; some live in `chargeSchema.ts` — `ShopChargeReferenceSchema`, `ShopAnnualChargeReferenceSchema` — reuse those)
- `schema/authSchema.ts` (login: IdNumber + password)
- `schema/bucketSchema.ts` (upload-url params)

---

## Phase 1: Core CRUD Modules

### 1.1 — Charge Module

```
server/modules/charges/
  index.ts
  charge-routes.ts
  charge-handler.ts
  charge-service.ts
  charge-client.ts
  labels.ts
```

| Method | Route | Description | Source Action |
|--------|-------|-------------|---------------|
| GET | `/charges` | List all charges | `getAllCharges.ts` |
| GET | `/charges/by-shop/:shopId` | Charges by shop | `getChargesByShop.ts` |
| GET | `/charges/by-person/:personId` | Charges by person | `getChargesByPerson.ts` |
| POST | `/charges/by-shop` | Create charge for one shop (date range) | `addChargeByShop.ts` |
| POST | `/charges/by-amount` | Create charge with explicit amount | `addChargeByAmount.ts` |
| POST | `/charges/by-amount-multi` | Same amount for multiple shops | `addChargeByAmountToShopList.ts` |
| POST | `/charges/all-shops` | Monthly charges for all shops | `addChargeToAllShops.ts` |
| POST | `/charges/annual-all` | Annual proprietor charges | `addAnnualChargeToAllShops.ts` |
| POST | `/charges/rent-kiosks` | Rent charges for kiosks/parking/board | `addRentToAllKiosks.ts` |
| PATCH | `/charges/:id/user` | Reassign charge to different person | `updateChargeUserAction.ts` |

### 1.2 — Payment Module

```
server/modules/payments/
  index.ts
  payment-routes.ts
  payment-handler.ts
  payment-service.ts
  payment-client.ts
  labels.ts
```

| Method | Route | Description | Source Action |
|--------|-------|-------------|---------------|
| GET | `/payments` | List all payments | `getAllPayments.ts` |
| GET | `/payments/by-shop/:shopId` | Payments by shop | `getAllPaymentsByShop.ts` |
| GET | `/payments/by-person/:personId` | Payments by person | `getAllPaymentsByPerson.ts` |
| POST | `/payments` | Create payment | `addPayment.ts` |
| POST | `/payments/by-bank` | Create from bank transaction | `addPaymentByBankId.ts` |
| POST | `/payments/from-card/:id` | Auto-create from card match | `addPaymentFromCard.ts` |
| POST | `/payments/failed/:id` | Register failed payment reversal | `addFailedPayment.ts` |
| PATCH | `/payments/:id/user` | Reassign payment | `updatePaymentUserAction.ts` |
| DELETE | `/payments/:id` | Delete payment | `deletePayment.ts` |

### 1.3 — History Module

```
server/modules/history/
  index.ts
  history-routes.ts
  history-handler.ts
  history-service.ts
  history-client.ts
  labels.ts
```

| Method | Route | Description | Source Action |
|--------|-------|-------------|---------------|
| GET | `/histories` | List all histories | `getAllHistory.ts` |
| GET | `/histories/by-shop/:shopId` | History by shop | `getHistoryByShop.ts` |
| GET | `/histories/by-person/:personId` | History by person | `getHistoryByPerson.ts` |
| POST | `/histories` | Add history entry | `addShopHistory.ts` |
| PATCH | `/histories/:id` | Update history entry | `updateHistoryAction.ts` |

---

## Phase 2: Financial Modules

### 2.1 — Balance Module

```
server/modules/balances/
  index.ts
  balance-routes.ts
  balance-handler.ts
  balance-service.ts
  balance-client.ts
  labels.ts
```

| Method | Route | Description | Source Action |
|--------|-------|-------------|---------------|
| GET | `/balances/shops` | All shops balance (paginated) | `getAllShopsBalance.ts` |
| GET | `/balances/rents` | All rents balance | `getAllRentsBalance.ts` |
| GET | `/balances/shop/:shopId` | Single shop balance | `getShopBalance.ts` |
| GET | `/balances/shop/:shopId/detail` | Shop financial detail | `getShopDetail.ts` |
| GET | `/balances/person/:personId` | Person balance | `getPersonBalance.ts` |

### 2.2 — Cost/Income Module

> **⚠️ Export two separate route objects**, `costRoutes` and `incomeRoutes` — do **not** mount a single shared object on both `/costs` and `/incomes` (a route defined as `.get('/', ...)` would otherwise fire for both paths). The handlers/service can stay in one `cost-income/` directory; only the route objects must be split.

```
server/modules/cost-income/
  index.ts                — re-exports { costRoutes, incomeRoutes }
  cost-routes.ts          — Hono routes for /costs
  income-routes.ts        — Hono routes for /incomes
  cost-income-handler.ts
  cost-income-service.ts
  cost-income-client.ts
  labels.ts
```

| Method | Route | Description | Source Action |
|--------|-------|-------------|---------------|
| GET | `/costs` | List all costs | `getAllCosts.ts` |
| GET | `/incomes` | List all incomes | `allIncome.ts` |
| POST | `/costs` | Create cost | `addCost.ts` |
| POST | `/costs/from-bank` | Create cost from bank tx | `addCostFromBank.ts` |
| POST | `/incomes` | Create income | `addIncome.ts` |

### 2.3 — Bank Module

```
server/modules/bank/
  index.ts
  bank-routes.ts
  bank-handler.ts
  bank-service.ts
  bank-client.ts
  labels.ts
```

| Method | Route | Description | Source Action |
|--------|-------|-------------|---------------|
| GET | `/bank/transactions` | All transactions (paginated, filtered) | `getBankTransactions.ts` |
| GET | `/bank/transactions/card-transfer` | Unregistered card transfers | `getBankCardTransfer.ts` |
| GET | `/bank/transactions/income-transfer` | Unregistered income transfers | `getBankIncomeTransfer.ts` |
| GET | `/bank/transactions/failed-transfer` | Unregistered failed transfers | `getBankFailedCardTransfer.ts` |
| GET | `/bank/transactions/:id` | Single transaction | `getTransactionData.ts` |
| PATCH | `/bank/transactions/:id/register-able` | Toggle registerAble | `setRegisterAbleAction.ts` |

---

## Phase 3: Supporting Modules

### 3.1 — Operation Module

```
server/modules/operations/
  index.ts
  operation-routes.ts
  operation-handler.ts
  operation-service.ts
  operation-client.ts
  labels.ts
```

| Method | Route | Description | Source Action |
|--------|-------|-------------|---------------|
| GET | `/operations` | List all operations | `getAllOperations.ts` |
| DELETE | `/operations/:id/charges` | Delete operation's charges | `deleteChargesByOperation.ts` |

### 3.2 — Reference Module

```
server/modules/references/
  index.ts
  reference-routes.ts
  reference-handler.ts
  reference-service.ts
  reference-client.ts
  labels.ts
```

| Method | Route | Description | Source Action |
|--------|-------|-------------|---------------|
| GET | `/references/charges` | All charge references | `getAllChargesReference.ts` |
| POST | `/references/charges/monthly` | Generate monthly references | `shopChargeReference.ts` |
| POST | `/references/charges/annual` | Generate annual references | `shopAnnualChargeReference.ts` |

### 3.3 — Reports Module

```
server/modules/reports/
  index.ts
  report-routes.ts
  report-handler.ts
  report-service.ts
  report-client.ts
  labels.ts
```

| Method | Route | Description | Source Action |
|--------|-------|-------------|---------------|
| GET | `/reports/bank-transactions` | Bank tx report by date range | `getBankTransactionsForReport.ts` |

### 3.4 — User Module

```
server/modules/users/
  index.ts
  user-routes.ts
  user-handler.ts
  user-service.ts
  user-client.ts
  labels.ts
```

| Method | Route | Description | Source Action |
|--------|-------|-------------|---------------|
| GET | `/users/me/shops` | Current user's shops | `findAllShopsByPerson.ts` |
| GET | `/users/:id/quick-state` | User quick stats | `getUserQuickState.ts` |

> **No password route here.** `app/api/actions/user/updatePersonPassword.ts` does not exist; password updates are already handled by the persons module (`PATCH /persons/:id/password`). Do not duplicate.
>
> **Depends on Phase 0.1.** Both source actions take an injected `user: Person` from `handleServerAction`. The Hono handlers must read it from `c.get("user")`, so this module is blocked on the auth middleware.

### 3.5 — Auth Module

```
server/modules/auth/
  index.ts
  auth-routes.ts
  auth-handler.ts
  auth-service.ts
  auth-client.ts
  labels.ts
```

| Method | Route | Description | Source Action |
|--------|-------|-------------|---------------|
| POST | `/auth/login` | Login (IdNumber + password) | `loginUser.ts` |
| POST | `/auth/logout` | Logout (clear cookie) | `logoutUser.ts` |
| GET | `/auth/me` | Current user info from session | `verifyToken` (utils/auth.ts) |

> **Cookie handling is Hono's job here.** Login must create the `Session` record and **set** the cookie via `setCookie(c, ...)`; logout must delete the Session and **clear** the cookie via `deleteCookie(c, ...)` (both from `hono/cookie`). Port the cookie attributes (httpOnly, sameSite, expiry matching `expireAt`) from the current server-action implementation.

### 3.6 — Import Module

```
server/modules/imports/
  index.ts
  import-routes.ts
  import-handler.ts
  import-service.ts
  import-client.ts
  labels.ts
```

| Method | Route | Description | Source Action |
|--------|-------|-------------|---------------|
| POST | `/imports/bank` | Bulk import bank data | `addBankData.ts` |
| POST | `/imports/net-bank` | Bulk import net bank data | `addNetBankData.ts` |
| POST | `/imports/persons-shops` | Bulk import persons + shops | `addPersonsShopsFromFile.ts` |
| POST | `/imports/kiosks` | Bulk import kiosks | `addKioskFromFile.ts` |

### 3.7 — Bucket Module

```
server/modules/bucket/
  index.ts
  bucket-routes.ts
  bucket-handler.ts
  bucket-service.ts
  bucket-client.ts
  labels.ts
```

| Method | Route | Description | Source Action |
|--------|-------|-------------|---------------|
| POST | `/bucket/upload-url` | Generate pre-signed upload URL | `GenerateUrl.tsx` |

---

## Phase 4: Wire Into Main App

### 4.1 — Update `server/index.ts`

Mount all new modules:

```ts
import { Hono } from 'hono';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';

import { authRoutes } from './modules/auth';
import { personRoutes } from './modules/persons';
import { shopRoutes } from './modules/shops';
import { chargeRoutes } from './modules/charges';
import { paymentRoutes } from './modules/payments';
import { historyRoutes } from './modules/history';
import { balanceRoutes } from './modules/balances';
import { costRoutes, incomeRoutes } from './modules/cost-income';
import { bankRoutes } from './modules/bank';
import { operationRoutes } from './modules/operations';
import { referenceRoutes } from './modules/references';
import { reportRoutes } from './modules/reports';
import { userRoutes } from './modules/users';
import { importRoutes } from './modules/imports';
import { bucketRoutes } from './modules/bucket';

const app = new Hono().basePath('/api');

app.onError(errorHandler);

// Public routes
app.route('/auth', authRoutes);

// Protected routes (auth middleware applied)
// NOTE: '/persons/*' matches '/persons/anything' but NOT the bare '/persons'.
// Use the optional-wildcard form so list/create routes on the bare path are also guarded.
const protectedPaths = [
  'persons', 'shops', 'charges', 'payments', 'histories', 'balances',
  'costs', 'incomes', 'bank', 'operations', 'references', 'reports',
  'users', 'imports', 'bucket',
];
for (const p of protectedPaths) {
  app.use(`/${p}{/*}?`, authMiddleware); // matches both '/p' and '/p/...'
}

app.route('/persons', personRoutes);
app.route('/shops', shopRoutes);
app.route('/charges', chargeRoutes);
app.route('/payments', paymentRoutes);
app.route('/histories', historyRoutes);
app.route('/balances', balanceRoutes);
app.route('/costs', costRoutes);
app.route('/incomes', incomeRoutes);
app.route('/bank', bankRoutes);
app.route('/operations', operationRoutes);
app.route('/references', referenceRoutes);
app.route('/reports', reportRoutes);
app.route('/users', userRoutes);
app.route('/imports', importRoutes);
app.route('/bucket', bucketRoutes);

export { app };
```

> **Wildcard caveat:** `app.use('/persons/*', mw)` does **not** match the bare `/persons` path, leaving `GET /persons` and `POST /persons` unprotected. The `{/*}?` optional-wildcard form (Hono v4) covers both. The existing persons/shops handlers currently rely on an `'ADMIN'` placeholder and have no real Hono-level guard — this phase is where that gap closes.

---

## Phase 5: TanStack Client Migration

### 5.1 — Create Client Functions

For each new module, create `*-client.ts` with typed axios calls (following `person-client.ts` / `shop-client.ts` pattern).

### 5.2 — Create Query Hooks

Update `tanstack/axios-query/` with new files:
- `charge-query.ts`
- `payment-query.ts`
- `history-query.ts`
- `balance-query.ts`
- `cost-income-query.ts`
- `bank-query.ts`
- `operation-query.ts`
- `reference-query.ts`
- `report-query.ts`
- `user-query.ts`

### 5.3 — Create Mutation Hooks

Update `tanstack/axios-mutation/` with new files:
- `charge-mutation.ts`
- `payment-mutation.ts`
- `history-mutation.ts`
- `cost-income-mutation.ts`
- `bank-mutation.ts`
- `operation-mutation.ts`
- `reference-mutation.ts`
- `import-mutation.ts`
- `bucket-mutation.ts`

### 5.4 — Remove Dead Code

Two fully commented-out files can be deleted immediately:
- `tanstack/queries.ts` (283 lines, all commented)
- `tanstack/mutations.ts` (911 lines, all commented)

In addition, the legacy **server-action-based** hook directories must be migrated to the new axios hooks and then removed (these are still live, so remove them only after their consuming components are migrated in 5.5):
- `tanstack/query/` — 9 files: `balanceQuery.ts`, `bankQuery.ts`, `bankReportQuery.ts`, `chargeQuery.ts`, `historyQuery.ts`, `incomeCostQuery.ts`, `paymentQuery.ts`, `personQuery.ts`, `shopQuery.ts`
- `tanstack/mutation/` — 7 files: `chargeMutation.ts`, `historyMutation.ts`, `importMutation.ts`, `incomeCostMutation.ts`, `paymentMutation.ts`, `personMutation.ts`, `shopMutation.ts`

**Total dead/legacy scope: ~18 files** (2 commented + 16 legacy hooks).

### 5.5 — Component Migration & Cutover

Update components to use the new axios-based hooks instead of server-action-based hooks, incrementally per page/feature.

**Cutover strategy (to avoid two data paths living indefinitely):**
1. Migrate one feature at a time, in dependency order: persons/shops (done) → charges → payments → history → balances → cost/income → bank → remaining.
2. **Definition of done per feature:** no component imports from `tanstack/query/` or `tanstack/mutation/` for that domain; the corresponding legacy hook file is deleted in the same PR.
3. Track remaining legacy imports with a grep (`tanstack/query/`, `tanstack/mutation/`, `handleServerAction`) — the count going to zero is the migration's completion signal.
4. Once all components are migrated, retire `handleServerAction` and delete `app/api/actions/` per domain.

---

## Execution Order

| Step | Module | Estimated Files |
|------|--------|-----------------|
| 0 | Auth middleware + error handler + helpers | 4 files |
| 1 | Auth module | 6 files |
| 2 | Charge module | 6 files |
| 3 | Payment module | 6 files |
| 4 | History module | 6 files |
| 5 | Balance module | 6 files |
| 6 | Cost/Income module | 6 files |
| 7 | Bank module | 6 files |
| 8 | Operation module | 6 files |
| 9 | Reference module | 6 files |
| 10 | Reports module | 6 files |
| 11 | User module | 6 files |
| 12 | Import module | 6 files |
| 13 | Bucket module | 6 files |
| 14 | Wire into `server/index.ts` | 1 file edit |
| 15 | TanStack client hooks | ~20 files |
| 16 | Delete dead code | 2 file deletions |

**Total: ~16 new module directories (~90 files) + 2 deletions**

---

## Module Template

Each module follows the existing pattern from `persons` and `shops`:

```
server/modules/<name>/
├── index.ts              — re-exports routes
├── <name>-routes.ts      — Hono route definitions + zValidator
├── <name>-handler.ts     — request parsing, calls service, returns c.json
├── <name>-service.ts     — business logic, Prisma queries
├── <name>-client.ts      — axios functions for frontend
└── labels.ts             — Persian success/error messages
```

**Conventions:**
- Handlers parse request, delegate to service, format response
- Services contain all DB/business logic, throw on errors
- Client functions return `response.data` with typed generics
- Labels use Persian strings matching existing `utils/messages.ts`
- Zod schemas from `schema/` are reused in route validators
- Role checks use `requireRole()` middleware per-route or per-group
