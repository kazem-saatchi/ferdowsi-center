/**
 * The single definition of "which bank transactions match the current filters".
 *
 * getBankTransactions needs the same `where` twice — once for findMany, once
 * for the count that drives pagination. Those two were written out inline and
 * duplicated; with one filter each that was survivable, but every filter added
 * doubles the chance they drift and the page count starts disagreeing with the
 * rows on screen. Build it once here instead.
 */

// Type-only: this module is imported by the client filter card as well as by
// the server action, and nothing here needs Prisma at runtime. Keeping the
// import erasable keeps @prisma/client out of the browser bundle.
import type { AccountType, Prisma, TransactionCategory } from "@prisma/client";
import { convertToEnglishNumber } from "@/utils/formatNumber";

/** Sentinel for "rows the importer left without a category". */
export const UNCATEGORIZED = "UNCATEGORIZED";

export type BankTransactionCategoryFilter =
  | TransactionCategory
  | typeof UNCATEGORIZED;

/**
 * Columns a caller may sort by.
 *
 * Deliberately a closed union rather than `keyof BankTransaction`: this value
 * arrives from the client and is spread straight into Prisma's `orderBy`.
 */
export type BankTransactionSortField =
  | "date"
  | "amount"
  | "createdAt"
  | "senderAccount";

/**
 * Every filter is optional and `undefined` means "no constraint".
 *
 * Amounts are `number`, not `bigint`, even though the columns are BigInt: this
 * object crosses a server-action boundary and React's Flight serializer cannot
 * encode bigint. The conversion happens in the builder below. See
 * utils/bankAmount.ts for the same boundary in the other direction.
 */
export interface BankTransactionFilters {
  accountType?: AccountType;
  type?: "INCOME" | "PAYMENT";
  category?: BankTransactionCategoryFilter;
  /** true = only registered rows, false = only unregistered, undefined = both. */
  registered?: boolean;
  /** Inclusive lower bound. Build with utils/jalaliRange — must be UTC midnight. */
  startDate?: Date;
  /** Exclusive upper bound: UTC midnight of the day *after* the last day shown. */
  endDateExclusive?: Date;
  /** Exact match. Takes precedence over minAmount/maxAmount when set. */
  amount?: number;
  minAmount?: number;
  maxAmount?: number;
  /** Free text, matched against the description and the bank's own identifiers. */
  search?: string;
}

export function buildBankTransactionWhere(
  filters: BankTransactionFilters = {}
): Prisma.BankTransactionWhereInput {
  const {
    accountType,
    type,
    category,
    registered,
    startDate,
    endDateExclusive,
    amount,
    minAmount,
    maxAmount,
    search,
  } = filters;

  const where: Prisma.BankTransactionWhereInput = {
    accountType,
    type,
    registered,
  };

  if (category) {
    where.category = category === UNCATEGORIZED ? null : category;
  }

  if (startDate || endDateExclusive) {
    where.date = {
      ...(startDate ? { gte: startDate } : {}),
      // Exclusive, so the final day is kept whole whatever time it carries.
      ...(endDateExclusive ? { lt: endDateExclusive } : {}),
    };
  }

  if (amount !== undefined) {
    where.amount = BigInt(Math.trunc(amount));
  } else if (minAmount !== undefined || maxAmount !== undefined) {
    where.amount = {
      ...(minAmount !== undefined ? { gte: BigInt(Math.trunc(minAmount)) } : {}),
      ...(maxAmount !== undefined ? { lte: BigInt(Math.trunc(maxAmount)) } : {}),
    };
  }

  // The reference and receipt numbers an operator reads off a bank statement
  // are Latin digits in every stored row, but they are just as likely to be
  // typed or pasted as Persian ones, so normalise before matching.
  const term = convertToEnglishNumber(search?.trim() ?? "");
  if (term) {
    where.OR = [
      { description: { contains: term, mode: "insensitive" } },
      { bankReferenceId: { contains: term } },
      { bankRecieptId: { contains: term } },
      { chequeNumber: { contains: term } },
      { senderAccount: { contains: term } },
      { recieverAccount: { contains: term } },
    ];
  }

  return where;
}
