import { createHash } from "crypto";

/**
 * Canonical identity hash for a BankTransaction row.
 *
 * A bank statement is fetched by date range, so overlapping ranges are normal
 * and the same transaction arrives repeatedly. This hash is the row's identity:
 * it backs a UNIQUE index, which makes re-importing an overlapping range
 * idempotent at the database level instead of relying on a lookup query.
 *
 * Why these seven fields:
 *  - accountType + bankAccountNumber scope identity to one account, so two
 *    accounts can never shadow each other.
 *  - bankReferenceId (سند), amount, balance, date and description together are
 *    unique across all 3,329 existing rows. `balance` is a running total and
 *    does most of the work; description settles the rare cases where the bank
 *    reports the same balance for two distinct transactions on one day.
 *
 * Stability rules — breaking any of these silently orphans every existing hash
 * and turns the next import into a duplicate storm:
 *  1. Never reorder, add or remove a field.
 *  2. Amounts are stringified, so widening amount/balance from Int to BigInt
 *     does NOT change the hash (`(123).toString() === (123n).toString()`).
 *  3. The date contributes only its UTC calendar day. Statement rows carry no
 *     time (the importer never stores ساعت), so the stored value is always
 *     midnight UTC and this is stable.
 *  4. `description` is hashed exactly as stored — no trimming or normalising.
 */

export interface BankRowIdentity {
  accountType: string;
  bankAccountNumber: string;
  bankReferenceId: string;
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
    row.bankReferenceId,
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
