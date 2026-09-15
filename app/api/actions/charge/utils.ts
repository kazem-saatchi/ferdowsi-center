import { z } from "zod";
import { db } from "@/lib/db";
import { errorMSG } from "@/utils/messages";
import { HistoryType, ShopHistory, ShopType } from "@prisma/client";
import { addDays, differenceInDays, startOfDay } from "date-fns";


const getHistoriesSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  /** Restrict to a single shop. Omit to fetch every shop's histories. */
  shopId: z.string().optional(),
});

export type getHistoriesResponse = {
  success: boolean;
  message: string;
  data?: ShopHistory[];
  totalDays?: number;
};

type getHistoriesData = z.infer<typeof getHistoriesSchema>;

/** Units the building management rents out. On these a charge run bills rent
 *  rather than a shared-cost charge. */
const RENTABLE_SHOP_TYPES: ShopType[] = ["KIOSK", "BOARD", "PARKING"];

/**
 * Whether a history span should be billed rent by addRentAllKiosks.
 *
 * Rent is owed by whoever occupies the unit, and these units belong to the
 * building management — so an unoccupied span would bill the landlord for their
 * own empty unit. getRelatedHistories returns InActive (vacant) and
 * ActiveByOwner (management holding it) spans alongside ActiveByRenter, and on
 * these units the personId of the first two IS the management person. Only
 * ActiveByRenter has someone who owes the rent.
 */
export function isRentBillableHistory(
  history: Pick<ShopHistory, "shopType" | "type">
): boolean {
  return (
    RENTABLE_SHOP_TYPES.includes(history.shopType) &&
    history.type === HistoryType.ActiveByRenter
  );
}

export async function getRelatedHistories(
  data: getHistoriesData
): Promise<getHistoriesResponse> {
  const validation = getHistoriesSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.errors.map((err) => err.message).join(", "),
    };
  }

  const { startDate, endDate, shopId } = validation.data;

  if (endDate <= startDate) {
    return {
      success: false,
      message: errorMSG.invalidDateRange,
    };
  }

  // Fetch ShopHistory entries of specified types
  const relevantHistories = await db.shopHistory.findMany({
    where: {
      ...(shopId ? { shopId } : {}),
      type: { in: ["ActiveByOwner", "ActiveByRenter", "InActive"] }, // Exclude "Ownership"
      startDate: { lte: endDate },
      OR: [
        { endDate: null }, // Include ongoing periods
        { endDate: { gte: startDate } }, // Include overlapping periods
      ],
    },
    orderBy: { startDate: "asc" },
  });

  // Calculate the number of days (inclusive)
  const totalDays = differenceInDays(endDate, startDate) + 1;

  return {
    success: true,
    message: "Histories fetched successfully",
    data: relevantHistories,
    totalDays,
  };
}
//--------------------------------------------------------------------------------------
// Proration — the single source of truth for "how many days of this billing
// window does this occupancy span cover, and what is its share of the money".
//
// THE TWO CONVENTIONS, which are NOT the same and used to be conflated:
//
//  1. An occupancy span (ShopHistory) is HALF-OPEN: `[startDate, endDate)`.
//     updateShopRenter closes the outgoing span by setting its `endDate` to the
//     SAME day the incoming span's `startDate` uses, so the shared handover day
//     belongs to the INCOMING occupant only. Counting it on both sides bills
//     that day twice — a 31-day month came out as 32 billed days.
//     A null `endDate` means "still open", i.e. it runs to the end of whatever
//     window is being billed.
//
//  2. A billing window is CLOSED: `[startDate, endDate]`, both days billed.
//     getRelatedHistories counts it as `differenceInDays(end, start) + 1`, so
//     the window's exclusive end is `endDate + 1 day`.
//
// Everything below converts (2) to a half-open window once, then works purely
// in half-open arithmetic — no `+ 1` anywhere near a span.
//--------------------------------------------------------------------------------------

/** A billing period. `endDate` is INCLUSIVE — it is a billed day. */
export interface BillingWindow {
  startDate: Date;
  endDate: Date;
}

/** An occupancy span. `endDate` is EXCLUSIVE; null means still open. */
export interface BillableSpan {
  startDate: Date;
  endDate: Date | null;
}

/** One span's slice of a window, before any money is attached to it. */
export interface BillableSegment<T> {
  span: T;
  /** Whole days of the window covered by this span. Always > 0. */
  days: number;
  /** First billed day of the slice — what a charge row stores as its `date`. */
  startDate: Date;
}

/** Days in a billing window, `endDate` inclusive. */
export function billingWindowDays(window: BillingWindow): number {
  return differenceInDays(
    addDays(startOfDay(window.endDate), 1),
    startOfDay(window.startDate)
  );
}

/** First billed day of a span inside a window — `max(span.start, window.start)`. */
export function billableStartDate(
  span: BillableSpan,
  window: BillingWindow
): Date {
  const spanStart = startOfDay(span.startDate);
  const windowStart = startOfDay(window.startDate);
  return spanStart > windowStart ? spanStart : windowStart;
}

/**
 * Days of `window` covered by `span`, using the half-open span convention:
 * the span's `endDate` belongs to the NEXT occupant and is never billed here.
 * Returns 0 when the span does not overlap the window.
 */
export function countBillableDays(
  span: BillableSpan,
  window: BillingWindow
): number {
  const windowStart = startOfDay(window.startDate);
  const windowEndExclusive = addDays(startOfDay(window.endDate), 1);

  const from = billableStartDate(span, window);
  // A still-open span runs to the end of the window.
  const spanEndExclusive = span.endDate
    ? startOfDay(span.endDate)
    : windowEndExclusive;
  const to =
    spanEndExclusive < windowEndExclusive ? spanEndExclusive : windowEndExclusive;

  const days = differenceInDays(to, from);
  return days > 0 ? days : 0;
}

/**
 * Clip every span to the window, dropping the ones that cover no day of it.
 * Because spans are half-open, adjacent spans meeting on one date produce day
 * counts that sum to exactly the window length — never one more.
 */
export function segmentWindowBySpans<T extends BillableSpan>(
  spans: T[],
  window: BillingWindow
): BillableSegment<T>[] {
  return spans.reduce<BillableSegment<T>[]>((acc, span) => {
    const days = countBillableDays(span, window);
    if (days > 0) {
      acc.push({ span, days, startDate: billableStartDate(span, window) });
    }
    return acc;
  }, []);
}

/**
 * Split `totalAmount` across segments in proportion to their days.
 *
 * `Charge.amount` is an INT column and Rials have no sub-unit, so every slice
 * must be a whole number: `days * (totalAmount / totalDays)` is essentially
 * never integral (totalAmount is a multiple of 100,000, totalDays is 29-31)
 * and a single fractional row aborts the whole monthly `createMany`.
 *
 * Each segment gets the difference between the rounded running total up to and
 * including it and the rounded running total before it. That gives:
 *  - whole-Rial amounts everywhere;
 *  - a sum equal to `totalAmount` EXACTLY when the segments cover the whole
 *    window (Σdays === totalDays) — the invariant the monthly run depends on;
 *  - a sum equal to the rounded value of the covered part when they cover only
 *    some of it, so a partly vacant window is never rounded up to a full one.
 */
export function allocateByDays<T extends { days: number }>(
  segments: T[],
  totalDays: number,
  totalAmount: number
): (T & { amount: number })[] {
  if (totalDays <= 0) {
    return segments.map((segment) => ({ ...segment, amount: 0 }));
  }

  let daysSoFar = 0;
  let allocated = 0;

  return segments.map((segment) => {
    daysSoFar += segment.days;
    const cumulative = Math.round((daysSoFar * totalAmount) / totalDays);
    const amount = cumulative - allocated;
    allocated = cumulative;
    return { ...segment, amount };
  });
}

/**
 * The whole proration in one call: clip the spans to the window and hand each
 * resulting segment its whole-Rial share of `totalAmount`.
 *
 * This is what every charge/rent generator must use, so that they cannot drift
 * apart on the day-count or the rounding rule again.
 */
export function prorateWindow<T extends BillableSpan>(
  spans: T[],
  window: BillingWindow,
  totalAmount: number,
  totalDays: number = billingWindowDays(window)
): (BillableSegment<T> & { amount: number })[] {
  return allocateByDays(
    segmentWindowBySpans(spans, window),
    totalDays,
    totalAmount
  );
}
