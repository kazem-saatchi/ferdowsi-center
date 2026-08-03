// server/index.ts

import { Hono } from 'hono';
// import { personRoutes } from './modules/persons';
// import { shopRoutes } from './modules/shops';

const app = new Hono().basePath('/api');

// Mount the routes from each module
//
// UNMOUNTED — do not re-enable until Phase 0.1 of HONO-PLAN.md (auth
// middleware) exists. These routes had no authentication of any kind, while
// the equivalent server actions in app/api/actions/ all require role ADMIN,
// so they exposed shop/person mutations — including PATCH /persons/:id/role
// and DELETE /shops/:id — to anyone who could reach the app.
//
// The shop service also diverges from the server actions it duplicates: its
// updateRenter and updateStatus create a new ShopHistory row without closing
// the open one (two overlapping open periods → the month gets billed twice),
// updateStatus attributes an InActive period to the renter instead of the
// owner, and updateOwner skips the ActiveByOwner hand-off. None of the
// charge-attribution fixes made in app/api/actions/ are reflected here.
//
// Re-enabling means: add the auth middleware + requireRole guard, then port
// those fixes across (or make the handlers delegate to the server actions).
//
// app.route('/persons', personRoutes);
// app.route('/shops', shopRoutes);

// A root /api endpoint
app.get('/', (c) => c.json({ message: 'Ferdowsi API is running!' }));

export { app };
