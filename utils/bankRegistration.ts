/**
 * Atomic claim of a BankTransaction as "registered".
 *
 * A bank row may become exactly one financial record: a Payment, a Charge (for
 * a bounced transfer) or a Cost. `registered`/`referenceId`/`referenceType`
 * record which one.
 *
 * Reading `registered` and then writing it in two steps is a TOCTOU race: two
 * concurrent requests (a double-clicked submit, or two admins on the same list)
 * both see `registered = false`, both insert a record, and both overwrite
 * `referenceId` — leaving one record orphaned and the money counted twice.
 *
 * This helper closes that window with a single conditional UPDATE
 * (`WHERE id = ? AND registered = false`). Postgres locks the row for the
 * duration of that statement and re-evaluates the predicate for any transaction
 * that was waiting on it, so exactly one caller can ever match. The loser gets
 * zero affected rows and throws, which rolls back the record it had already
 * created inside the same `$transaction`.
 *
 * Call it ONLY from inside `db.$transaction`, after creating the record whose
 * id is passed as `referenceId` — otherwise a failed claim cannot undo the
 * record and the invariant is lost.
 */

import type {
  Prisma,
  ReferenceType,
  TransactionCategory,
} from "@prisma/client";
import { errorMSG } from "./messages";

interface ClaimBankTransactionParams {
  bankTransactionId: string;
  /** Id of the record just created inside the same transaction. */
  referenceId: string;
  referenceType: ReferenceType;
  category: TransactionCategory;
}

export async function claimBankTransaction(
  tx: Prisma.TransactionClient,
  { bankTransactionId, referenceId, referenceType, category }: ClaimBankTransactionParams
): Promise<void> {
  const claimed = await tx.bankTransaction.updateMany({
    where: { id: bankTransactionId, registered: false },
    data: {
      registered: true,
      referenceId,
      referenceType,
      category,
    },
  });

  // Zero rows means the transaction was already consumed — by a Payment, a
  // Charge or a Cost — or it no longer exists. Either way this registration
  // must not stand, so abort and let the surrounding $transaction roll back.
  if (claimed.count === 0) {
    throw new Error(errorMSG.txAlreadyExist);
  }
}
