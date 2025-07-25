// app/api/[[...route]]/route.ts

import { app } from '@/server';
import { handle } from 'hono/vercel'

// export const runtime = 'edge'; // Optional, but recommended for Hono

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);