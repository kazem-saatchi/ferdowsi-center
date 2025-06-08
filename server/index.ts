// server/index.ts

import { Hono } from 'hono';
import { personRoutes } from './modules/persons';
import { shopRoutes } from './modules/shops';

const app = new Hono().basePath('/api');

// Mount the routes from each module
app.route('/persons', personRoutes);
app.route('/shops', shopRoutes);

// A root /api endpoint
app.get('/', (c) => c.json({ message: 'Ferdowsi API is running!' }));

export { app };