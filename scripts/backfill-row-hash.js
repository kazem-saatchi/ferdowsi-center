/**
 * Applies the rowHash migration and backfills every existing BankTransaction.
 *
 * Built to survive a flaky connection:
 *  - Every step is idempotent, so re-running after any failure is safe and
 *    resumes where it stopped (it only touches rows WHERE "rowHash" IS NULL).
 *  - Each DB call retries with exponential backoff on connection errors.
 *  - Rows are updated in batches with one round trip per batch, because this
 *    database's per-query latency is ~1s; per-row updates would take an hour.
 *  - Hash collisions are reported, never swallowed — a collision means the
 *    identity tuple is wrong and must be fixed before the unique index lands.
 *
 * The hash comes from utils/bankRowHash.ts, compiled on the fly, so this script
 * and the importer can never drift apart.
 *
 *   node scripts/backfill-row-hash.js            # dry run: verify + report only
 *   node scripts/backfill-row-hash.js --apply    # add column, index, backfill
 */

const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const APPLY = process.argv.includes("--apply");
const BATCH_SIZE = 200;
const MAX_ATTEMPTS = 5;

for (const line of fs.readFileSync(path.join(ROOT, ".env"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
  if (m) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}

const { PrismaClient, Prisma } = require(path.join(ROOT, "node_modules/@prisma/client"));

// --- load the canonical hash implementation (single source of truth) ---------
function loadHasher() {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "rowhash-"));
  // Invoke tsc's entry point through node rather than the npx shim, which
  // spawnSync cannot launch on Windows without a shell.
  execFileSync(
    process.execPath,
    [path.join(ROOT, "node_modules/typescript/bin/tsc"),
     path.join(ROOT, "utils/bankRowHash.ts"),
     "--outDir", outDir, "--module", "commonjs", "--target", "es2020", "--skipLibCheck"],
    { cwd: ROOT, stdio: "pipe" }
  );
  return require(path.join(outDir, "bankRowHash.js"));
}

// --- resilience -------------------------------------------------------------
const TRANSIENT = [
  "P1001", // can't reach database server
  "P1002", // server reached but timed out
  "P1008", // operation timed out
  "P1017", // server has closed the connection
  "P2024", // timed out fetching a connection from the pool
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function isTransient(error) {
  if (TRANSIENT.includes(error?.code)) return true;
  const msg = String(error?.message ?? "");
  return /Can't reach database server|Connection (reset|closed|refused)|ECONNRESET|ETIMEDOUT|socket hang up|Timed out/i.test(msg);
}

/** Runs fn, retrying transient failures with exponential backoff. */
async function resilient(label, fn) {
  let delay = 1500;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (!isTransient(error) || attempt === MAX_ATTEMPTS) {
        console.error(`\n  ✗ ${label} failed on attempt ${attempt}: ${error.code ?? ""} ${String(error.message).split("\n")[0]}`);
        throw error;
      }
      console.warn(`  ! ${label}: transient failure (attempt ${attempt}/${MAX_ATTEMPTS}), retrying in ${delay}ms`);
      await sleep(delay);
      delay *= 2;
    }
  }
}

// --- steps ------------------------------------------------------------------
async function applyDdl(db) {
  // Mirrors prisma/migrations/20260803120000_add_bank_transaction_row_hash.
  await resilient("add column", () =>
    db.$executeRawUnsafe(`ALTER TABLE "BankTransaction" ADD COLUMN IF NOT EXISTS "rowHash" TEXT;`));
  console.log("  ✓ column present");

  await resilient("create unique index", () =>
    db.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "BankTransaction_rowHash_key" ON "BankTransaction"("rowHash");`));
  console.log("  ✓ unique index present");
}

async function columnExists(db) {
  const rows = await resilient("inspect schema", () => db.$queryRawUnsafe(
    `SELECT column_name FROM information_schema.columns
     WHERE table_name = 'BankTransaction' AND column_name = 'rowHash';`));
  return rows.length > 0;
}

const SELECT_FIELDS = {
  id: true, accountType: true, bankAccountNumber: true, bankReferenceId: true,
  amount: true, balance: true, date: true, description: true,
};

/** Verifies the identity tuple really is unique before it becomes a constraint. */
function checkCollisions(rows, hash) {
  const byHash = new Map();
  for (const row of rows) {
    const h = hash(row);
    byHash.set(h, (byHash.get(h) ?? []).concat(row));
  }
  const collisions = [...byHash.entries()].filter(([, v]) => v.length > 1);
  return { distinct: byHash.size, collisions };
}

async function backfill(db, hash) {
  let done = 0, batches = 0;

  for (;;) {
    const pending = await resilient("fetch pending batch", () =>
      db.bankTransaction.findMany({
        where: { rowHash: null },
        select: SELECT_FIELDS,
        take: BATCH_SIZE,
        orderBy: { id: "asc" },
      }));

    if (!pending.length) break;

    // One round trip per batch: UPDATE ... FROM (VALUES ...).
    const values = pending.map((r) => Prisma.sql`(${r.id}, ${hash(r)})`);
    const updated = await resilient(`update batch ${batches + 1}`, () =>
      db.$executeRaw`
        UPDATE "BankTransaction" AS b
        SET "rowHash" = v.hash
        FROM (VALUES ${Prisma.join(values)}) AS v(id, hash)
        WHERE b.id = v.id AND b."rowHash" IS NULL`);

    batches++;
    done += updated;
    console.log(`  batch ${batches}: +${updated} rows (${done} total)`);

    if (updated === 0) {
      console.warn("  ! batch updated 0 rows — stopping to avoid an endless loop");
      break;
    }
  }

  return { done, batches };
}

// --- main -------------------------------------------------------------------
(async () => {
  console.log(APPLY ? "=== APPLYING rowHash migration + backfill ===\n" : "=== DRY RUN (no writes) ===\n");

  const hasher = loadHasher();
  const hash = (row) => hasher.bankRowHash(row);
  console.log("hash module compiled from utils/bankRowHash.ts");

  const db = new PrismaClient();

  try {
    const total = await resilient("count rows", () => db.bankTransaction.count());
    console.log(`BankTransaction rows: ${total}`);

    // 1. Verify uniqueness of the identity tuple across every existing row.
    console.log("\n[1/3] verifying the identity tuple is unique");
    const all = await resilient("load all rows", () =>
      db.bankTransaction.findMany({ select: SELECT_FIELDS }));
    const { distinct, collisions } = checkCollisions(all, hash);
    console.log(`  ${all.length} rows -> ${distinct} distinct hashes, ${collisions.length} collisions`);

    if (collisions.length) {
      console.error("\n  ✗ ABORT: the identity tuple is not unique. The unique index would fail.");
      collisions.slice(0, 10).forEach(([h, rows]) => {
        console.error(`    ${h.slice(0, 16)}... shared by ${rows.length} rows:`);
        rows.forEach((r) => console.error(`      id=${r.id} ${r.date.toISOString().slice(0, 10)} amount=${r.amount} balance=${r.balance}`));
      });
      process.exitCode = 1;
      return;
    }
    console.log("  ✓ safe to enforce as a unique index");

    if (!APPLY) {
      const hasColumn = await columnExists(db);
      console.log(`\n[2/3] rowHash column exists: ${hasColumn}`);
      const pending = hasColumn
        ? await resilient("count pending", () => db.bankTransaction.count({ where: { rowHash: null } }))
        : total;
      console.log(`[3/3] rows that would be backfilled: ${pending}`);
      const sample = all[0];
      console.log(`\nsample tuple: ${hasher.bankRowIdentityTuple(sample).slice(0, 110)}...`);
      console.log(`sample hash : ${hash(sample)}`);
      console.log("\nNo changes written. Re-run with --apply to commit.");
      return;
    }

    // 2. DDL
    console.log("\n[2/3] applying DDL");
    await applyDdl(db);

    // 3. Backfill
    console.log("\n[3/3] backfilling");
    const { done, batches } = await backfill(db, hash);

    const remaining = await resilient("count remaining", () =>
      db.bankTransaction.count({ where: { rowHash: null } }));
    const filled = await resilient("count filled", () =>
      db.bankTransaction.count({ where: { NOT: { rowHash: null } } }));

    console.log(`\n=== done: ${done} rows in ${batches} batches ===`);
    console.log(`  rows with a hash : ${filled}/${total}`);
    console.log(`  rows still NULL  : ${remaining}`);
    if (remaining > 0) {
      console.warn("  ! incomplete — re-run this script to resume (it is idempotent)");
      process.exitCode = 1;
    }
  } catch (error) {
    console.error("\nAborted. Nothing is left in a broken state — re-run to resume.");
    console.error(String(error.message).split("\n").slice(0, 3).join("\n"));
    process.exitCode = 1;
  } finally {
    await db.$disconnect().catch(() => {});
  }
})();
