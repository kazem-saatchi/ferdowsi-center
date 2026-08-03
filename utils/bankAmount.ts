/**
 * Boundary helpers between the widened BankTransaction money columns (BigInt)
 * and everything else.
 *
 * BankTransaction.amount/balance are BigInt because the bank ledger's running
 * balance outgrew INT4. Charge.amount, Payment.amount, Cost.amount and
 * Income.amount are deliberately still Int: they are an order of magnitude
 * below the ceiling and are summed in dozens of places, where mixing bigint
 * with number would throw at runtime. Widening them is a separate change.
 *
 * That leaves two boundaries, both crossed when a bank row is registered as a
 * payment or a returned charge. Crossing them silently is what produced the
 * original bug, so these helpers convert loudly instead.
 */

import type { BankTransaction } from "@prisma/client";

/** Largest value a Postgres INT4 column accepts. */
export const INT4_MAX = 2_147_483_647;

/**
 * A BankTransaction as it crosses the server-action boundary.
 *
 * React 18's Flight serializer (Next 14) cannot encode `bigint`, so a raw row
 * returned from a server action would throw at runtime. Every read action
 * converts through `serializeBankTransaction`, which also keeps the client
 * components working in plain `number` arithmetic.
 */
export type SerializedBankTransaction = Omit<
  BankTransaction,
  "amount" | "balance"
> & {
  amount: number;
  balance: number;
};

export function serializeBankTransaction(
  row: BankTransaction
): SerializedBankTransaction {
  return {
    ...row,
    amount: bankAmountToNumber(row.amount),
    balance: bankAmountToNumber(row.balance),
  };
}

/**
 * Converts a BigInt bank amount to a number for an Int column.
 *
 * Throws — in Persian, so it surfaces usefully in the UI — when the value
 * cannot fit. A loud, actionable failure is the point: the alternative is the
 * row vanishing, which is precisely how the overflow went unnoticed.
 */
export function toInt4Amount(value: bigint | number, context: string): number {
  const asBigInt = typeof value === "bigint" ? value : BigInt(Math.trunc(value));

  if (asBigInt > BigInt(INT4_MAX) || asBigInt < BigInt(-INT4_MAX)) {
    throw new Error(
      `مبلغ ${asBigInt.toString()} بزرگ‌تر از حد مجاز این فیلد است (${context}). ` +
        `برای ثبت این تراکنش باید ستون مبلغ گسترش یابد.`
    );
  }

  return Number(asBigInt);
}

/**
 * Widens a BigInt to a number purely for display or arithmetic in JS.
 *
 * Safe for every plausible rial value: Number.MAX_SAFE_INTEGER is ~9.0e15,
 * about four million times the largest balance on record. Use this — never a
 * bare Number() — so the intent is explicit and the guard is centralised.
 */
export function bankAmountToNumber(value: bigint | number): number {
  if (typeof value === "number") return value;

  if (value > BigInt(Number.MAX_SAFE_INTEGER) || value < BigInt(-Number.MAX_SAFE_INTEGER)) {
    // Unreachable with rial values, but silent precision loss in money is not
    // something to leave to chance.
    throw new Error(
      `مقدار ${value.toString()} خارج از محدوده امن عددی جاوااسکریپت است.`
    );
  }

  return Number(value);
}
