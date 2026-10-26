import { PaymentType } from "@prisma/client";
import { toPersianDigits } from "@/utils/formatNumber";
import { searchWords } from "@/utils/listSearch";

/** What the all-payments and all-charges lists send to the server: a page,
 *  the search box, and an optional month as [from, to). */
export interface LedgerListOptions {
  page: number;
  limit: number;
  search?: string;
  /** Inclusive start of the chosen month. */
  from?: Date;
  /** Exclusive end: the first instant of the following month. */
  to?: Date;
}

export interface PaymentListOptions extends LedgerListOptions {
  type?: PaymentType;
}

export interface LedgerPage<T> {
  rows: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  /** Sum of `amount` over every row that matches, not just this page. */
  totalAmount: number;
}

export const PAGE_SIZES = [10, 25, 50, 100] as const;

/** Page and page size the server will actually use: a whole page of at least
 *  1, and a size from PAGE_SIZES so a crafted request cannot ask for the whole
 *  table in one go. */
export function sanitizePaging(page: number, limit: number) {
  const safePage = Number.isInteger(page) && page >= 1 ? page : 1;
  const safeLimit = (PAGE_SIZES as readonly number[]).includes(limit)
    ? limit
    : 25;
  return { page: safePage, limit: safeLimit, skip: (safePage - 1) * safeLimit };
}

/** One condition per search word, all of which must hold. A word matches the
 *  person's name or the title in either digit script; a word made only of
 *  digits also matches the plaque exactly. Works for both Payment and Charge,
 *  which share these three columns. */
export function ledgerSearchConditions(search: string | undefined) {
  return searchWords(search ?? "").map((word) => {
    const persian = toPersianDigits(word);
    const variants = Array.from(new Set([word, persian]));
    return {
      OR: [
        ...variants.map((value) => ({
          personName: { contains: value, mode: "insensitive" as const },
        })),
        ...variants.map((value) => ({
          title: { contains: value, mode: "insensitive" as const },
        })),
        ...(/^\d+$/.test(word) && word.length <= 9
          ? [{ plaque: Number(word) }]
          : []),
      ],
    };
  });
}

/** The `date` bound for an optional [from, to) month. */
export function ledgerDateCondition(from?: Date, to?: Date) {
  if (!from && !to) return undefined;
  return {
    ...(from ? { gte: new Date(from) } : {}),
    ...(to ? { lt: new Date(to) } : {}),
  };
}
