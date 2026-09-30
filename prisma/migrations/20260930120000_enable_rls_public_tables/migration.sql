-- Enable Row Level Security on every table in the public schema.
--
-- Supabase exposes `public` through its Data API (PostgREST), and the `anon`
-- and `authenticated` roles hold SELECT/INSERT/UPDATE/DELETE on every table
-- here through Supabase's default grants. With RLS off, anyone holding the
-- project's anon key can read or rewrite Person, Session, Payment and the rest
-- over HTTPS. This app does not use the Data API — it reaches Postgres only
-- through Prisma — so nothing legitimate depends on that access.
--
-- No policies are created on purpose. RLS enabled with no policy is
-- default-deny: `anon` and `authenticated` get zero rows back from SELECT and
-- every write is rejected.
--
-- Prisma is unaffected. Checked read-only on 2026-09-30 over both DATABASE_URL
-- (pooler) and DIRECT_URL:
--   * Prisma connects as `postgres`, which owns all of these tables. RLS does
--     not apply to a table's owner unless FORCE ROW LEVEL SECURITY is set, and
--     it is set on none of them (and this migration does not set it).
--   * `postgres` also has BYPASSRLS, which would exempt it even under FORCE.
--   * No code path runs SET ROLE or set_config('role', ...).
-- `service_role` also has BYPASSRLS, so the service key keeps full access;
-- this closes the anon/authenticated hole only.
--
-- New tables are created with RLS off. Any future migration that adds a table
-- to `public` must enable RLS on it too, or it reopens the hole.
--
-- `BankTransaction_deleted_20260930` is not in the Prisma schema, so it is not
-- listed here (the shadow database would fail on a table it never created). It
-- already had RLS enabled when this was written.
--
-- ENABLE ROW LEVEL SECURITY is idempotent, so this is safe to re-run and safe
-- to apply through either connection. Each ALTER takes a brief ACCESS
-- EXCLUSIVE lock on its table and rewrites no data.

ALTER TABLE "BankTransaction"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Charge"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Cost"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Income"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Log"                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Operation"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Person"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Shop"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ShopChargeReference" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ShopHistory"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_prisma_migrations"  ENABLE ROW LEVEL SECURITY;
