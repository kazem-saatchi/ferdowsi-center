import { createHash } from "crypto";

/**
 * Canonical identity hash for a BankTransaction row.
 *
 * A bank statement is fetched by date range, so overlapping ranges are normal
 * and the same transaction arrives repeatedly. This hash is the row's identity:
 * it backs a UNIQUE index, which makes re-importing an overlapping range
 * idempotent at the database level instead of relying on a lookup query.
 *
 * Why these six fields:
 *  - accountType + bankAccountNumber scope identity to one account, so two
 *    accounts can never shadow each other.
 *  - `balance` is the account balance AFTER this transaction, not a daily
 *    closing figure, so it changes with every row. Two genuine transactions
 *    cannot share amount, balance, day and description: the second would have
 *    left a different balance. That is what makes these fields an identity.
 *
 * Why NOT the سند (`bankReferenceId`): it was the one field that kept changing
 * for the same statement line, and every change turned an overlapping
 * re-import into duplicates the unique index could not see. The old parser
 * flattened unreadable سند cells to "0"; when a later import read the real
 * number, 13 rows on 2026-09-21 were inserted a second time, and 26 more in
 * 2025 the same way. Across all 3,728 rows left after removing those 39, the
 * six fields below have no collisions, so the سند adds nothing but risk.
 *
 * Accepted residual risk: a debit, an equal credit, then the same debit again
 * on one day, with identical descriptions, would return the balance to the same
 * value and collapse into one row. It has never occurred in this account's
 * history, whereas the سند-driven duplicates occurred twice.
 *
 * Stability rules — breaking any of these silently orphans every existing hash
 * and turns the next import into a duplicate storm:
 *  1. Never reorder, add or remove a field. If you must, re-run
 *     `node scripts/backfill-row-hash.js --rehash` in the same release.
 *  2. Amounts are stringified, so widening amount/balance from Int to BigInt
 *     does NOT change the hash (`(123).toString() === (123n).toString()`).
 *  3. The date contributes only its UTC calendar day. Statement rows carry no
 *     time (the importer never stores ساعت), so the stored value is always
 *     midnight UTC and this is stable.
 *  4. `description` is hashed exactly as stored — no trimming or normalising.
 *     A parser change to description would reopen the same hole the سند did.
 */

export interface BankRowIdentity {
  accountType: string;
  bankAccountNumber: string;
  amount: number | bigint;
  balance: number | bigint;
  date: Date | string;
  description: string;
}

/** UTC calendar day of the row's date, as `yyyy-MM-dd`. */
function identityDay(date: Date | string): string {
  if (typeof date === "string") {
    // Already `yyyy-MM-dd` (importer) or a full ISO string.
    return date.slice(0, 10);
  }
  return date.toISOString().slice(0, 10);
}

/** The exact string that gets hashed. Exported for tests and debugging. */
export function bankRowIdentityTuple(row: BankRowIdentity): string {
  return [
    row.accountType,
    row.bankAccountNumber,
    row.amount.toString(),
    row.balance.toString(),
    identityDay(row.date),
    row.description,
  ].join("|");
}

export function bankRowHash(row: BankRowIdentity): string {
  return createHash("sha256")
    .update(bankRowIdentityTuple(row), "utf8")
    .digest("hex");
}
