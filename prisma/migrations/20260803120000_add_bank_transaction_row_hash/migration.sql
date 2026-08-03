-- Identity hash for BankTransaction rows. See utils/bankRowHash.ts.
--
-- Bank statements are fetched by date range, so overlapping ranges are routine
-- and the same transaction arrives more than once. A UNIQUE index on this hash
-- makes a re-import idempotent in the database, instead of depending on a
-- per-row lookup query that could not tell "already imported" from "failed".
--
-- The column is nullable so it can be added to a populated table; the backfill
-- (scripts/backfill-row-hash.js) fills every existing row. Postgres allows
-- multiple NULLs in a unique index, so un-backfilled rows never collide.
--
-- Written by hand rather than generated: `prisma migrate dev` needs DIRECT_URL
-- (port 5432), which was unreachable, while the pooler (6543) was up. Every
-- statement is idempotent so this is safe to apply through either connection,
-- and safe to re-run.

-- AlterTable
ALTER TABLE "BankTransaction" ADD COLUMN IF NOT EXISTS "rowHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "BankTransaction_rowHash_key" ON "BankTransaction"("rowHash");
