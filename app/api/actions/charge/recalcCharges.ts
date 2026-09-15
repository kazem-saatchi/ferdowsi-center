import { Prisma, HistoryType } from "@prisma/client";
import { startOfDay, addDays } from "date-fns";
import {
  BillingWindow,
  allocateByDays,
  segmentWindowBySpans,
} from "./utils";

/**
 * Recalculation of monthly service charges (proprietor:false, forRent:false)
 * after an ownership/rental period date has been edited.
 *
 * Strategy (per the feature design):
 *  - Work per shop, grouped by the `operationId` that generated the charges.
 *  - Reconstruct each period's window purely from the existing charge rows:
 *      windowStart = min(charge.date)
 *      totalDays   = Σ(charge.daysCount)      // authoritative length of the window
 *      window      = [windowStart, windowStart + totalDays)   (half-open)
 *  - Keep the shop's TOTAL charge for that window constant and only re-split it
 *    between owner/renter in proportion to the days each of them occupies,
 *    using the (already updated) ShopHistory spans.
 *  - The split itself is delegated to the shared proration helpers in ./utils,
 *    which own the half-open span convention and the whole-Rial rounding, so
 *    the re-split and the original generators can never disagree.
 *
 * This never depends on ShopChargeReference (which may have changed since the
 * charge was generated), so the operation is a pure re-attribution.
 *
 * Payments are deliberately NOT touched: a payment stays attributed to whoever
 * it was recorded against. Because charges move and payments do not, a re-split
 * can leave money parked on a person who no longer carries the charge for that
 * window (an artificial credit on one side, an artificial debt on the other).
 * We therefore report, per person and per window, how much they have already
 * paid into it, and flag the ones that need the payment side corrected by hand
 * (see updatePaymentUser). The caller — previewHistoryDateChange — surfaces
 * this before the admin commits.
 */

const RELEVANT_TYPES: HistoryType[] = [
  HistoryType.ActiveByOwner,
  HistoryType.ActiveByRenter,
  HistoryType.InActive,
];

export interface ChargeDiffPerson {
  personId: string;
  personName: string;
  oldDays: number;
  oldAmount: number;
  newDays: number;
  newAmount: number;
  /**
   * Monthly (non-proprietor) payments already recorded against this person
   * inside this window. Payments are never moved automatically.
   */
  paidInWindow: number;
  /**
   * True when this person loses charge amount in this window while money is
   * already parked on them for it — the payment must be reassigned manually,
   * otherwise they keep a phantom credit and the other party a phantom debt.
   */
  needsPaymentReview: boolean;
}

export interface OperationChargeDiff {
  operationId: string;
  operationName: string;
  /** ISO date of the first day covered by the window */
  windowStart: string;
  /** ISO date of the last day covered by the window (inclusive) */
  windowEnd: string;
  perPerson: ChargeDiffPerson[];
  /** True when any person in this window has `needsPaymentReview`. */
  hasPaymentConflict: boolean;
  /**
   * True when the updated history spans leave NOBODY occupying this window, so
   * the re-split has no one to bill.
   *
   * In that case the existing charge rows are deliberately LEFT IN PLACE and
   * nothing is written, even when `apply` is true: deleting a month's charges
   * with no replacement silently erases already-billed revenue from every
   * balance report. `perPerson` still reports the proposed split (all zeros) so
   * the admin can see what was found — but it was NOT applied.
   *
   * The caller must surface this rather than treat it as an ordinary
   * recalculation: a window that reaches the admin with this flag needs a
   * deliberate decision (fix the dates, or delete the charge explicitly).
   */
  noOccupantInWindow: boolean;
}

const minDate = (a: Date, b: Date) => (a < b ? a : b);

/**
 * Recompute (and optionally apply) the owner/renter split of every monthly
 * charge window of a shop, based on the current ShopHistory rows.
 *
 * Only windows whose split actually changed are returned. When `apply` is true
 * the affected charge rows are deleted and recreated inside the given
 * transaction, preserving the original `operationId`.
 */
export async function recomputeShopMonthlyCharges(
  tx: Prisma.TransactionClient,
  shopId: string,
  options: { apply: boolean }
): Promise<OperationChargeDiff[]> {
  const charges = await tx.charge.findMany({
    where: { shopId, proprietor: false, forRent: false },
    orderBy: { date: "asc" },
  });

  if (!charges.length) return [];

  // Group charges by the operation that generated them.
  const byOperation = new Map<string, typeof charges>();
  for (const charge of charges) {
    const list = byOperation.get(charge.operationId) ?? [];
    list.push(charge);
    byOperation.set(charge.operationId, list);
  }

  // Load the temporal ownership/tenancy spans once (already reflects the edit).
  const histories = await tx.shopHistory.findMany({
    where: { shopId, type: { in: RELEVANT_TYPES } },
    orderBy: { startDate: "asc" },
  });

  // Monthly payments of this shop, used only to report what a re-split would
  // strand on the wrong person. Never modified here.
  const payments = await tx.payment.findMany({
    where: { shopId, proprietor: false },
    select: { personId: true, amount: true, date: true },
  });

  const results: OperationChargeDiff[] = [];

  for (const [operationId, opCharges] of Array.from(byOperation.entries())) {
    const totalOldDays = opCharges.reduce((sum, c) => sum + c.daysCount, 0);
    const totalOldAmount = opCharges.reduce((sum, c) => sum + c.amount, 0);

    if (totalOldDays <= 0) continue;

    const windowStart = startOfDay(
      opCharges.reduce(
        (min, c) => (c.date < min ? c.date : min),
        opCharges[0].date
      )
    );
    // Window of exactly totalOldDays days, independent of any +1/-1 convention
    // differences between the original generators.
    const windowEndExclusive = addDays(windowStart, totalOldDays);
    const window: BillingWindow = {
      startDate: windowStart,
      // BillingWindow.endDate is the last billed day, i.e. inclusive.
      endDate: addDays(windowStart, totalOldDays - 1),
    };

    // New segments derived from the (updated) history spans, aggregated per
    // person — one person may hold several consecutive spans in one window.
    const newByPerson = new Map<
      string,
      { personName: string; days: number; startDate: Date }
    >();

    for (const segment of segmentWindowBySpans(histories, window)) {
      const h = segment.span;
      const existing = newByPerson.get(h.personId);
      if (existing) {
        existing.days += segment.days;
        existing.startDate = minDate(existing.startDate, segment.startDate);
      } else {
        newByPerson.set(h.personId, {
          personName: h.personName,
          days: segment.days,
          startDate: segment.startDate,
        });
      }
    }

    // Assign amounts, preserving the window total exactly.
    const newList = allocateByDays(
      Array.from(newByPerson.entries()).map(([personId, value]) => ({
        personId,
        personName: value.personName,
        days: value.days,
        startDate: value.startDate,
      })),
      totalOldDays,
      totalOldAmount
    );

    // Nobody occupies this window any more. Never silently delete the money.
    const noOccupantInWindow = newList.length === 0;

    // Old split, aggregated per person.
    const oldByPerson = new Map<
      string,
      { personName: string; days: number; amount: number }
    >();
    for (const c of opCharges) {
      const existing = oldByPerson.get(c.personId) ?? {
        personName: c.personName,
        days: 0,
        amount: 0,
      };
      existing.days += c.daysCount;
      existing.amount += c.amount;
      oldByPerson.set(c.personId, existing);
    }

    // Build the diff and detect whether anything actually changed.
    const personIds = new Set<string>([
      ...Array.from(oldByPerson.keys()),
      ...newList.map((n) => n.personId),
    ]);

    // Money already recorded inside this window, per person.
    const paidByPerson = new Map<string, number>();
    for (const p of payments) {
      const day = startOfDay(p.date);
      if (day < windowStart || day >= windowEndExclusive) continue;
      paidByPerson.set(p.personId, (paidByPerson.get(p.personId) ?? 0) + p.amount);
    }

    let changed = false;
    let hasPaymentConflict = false;
    const perPerson: ChargeDiffPerson[] = [];
    for (const personId of Array.from(personIds)) {
      const old = oldByPerson.get(personId);
      const next = newList.find((n) => n.personId === personId);
      const oldDays = old?.days ?? 0;
      const oldAmount = old?.amount ?? 0;
      const newDays = next?.days ?? 0;
      const newAmount = next?.amount ?? 0;

      if (oldDays !== newDays || oldAmount !== newAmount) changed = true;

      const paidInWindow = paidByPerson.get(personId) ?? 0;
      // Charges leaving a person who has already paid into this window is the
      // exact condition that produces a phantom credit/debt pair.
      const needsPaymentReview = newAmount < oldAmount && paidInWindow > 0;
      if (needsPaymentReview) hasPaymentConflict = true;

      perPerson.push({
        personId,
        personName: next?.personName ?? old?.personName ?? "",
        oldDays,
        oldAmount,
        newDays,
        newAmount,
        paidInWindow,
        needsPaymentReview,
      });
    }

    if (!changed) continue;

    results.push({
      operationId,
      operationName: opCharges[0].operationName,
      windowStart: windowStart.toISOString(),
      windowEnd: addDays(windowEndExclusive, -1).toISOString(),
      perPerson,
      hasPaymentConflict,
      noOccupantInWindow,
    });

    // Applying an empty split would run the deleteMany and create nothing,
    // wiping a billed month with no trace. Leave the rows alone and let the
    // caller act on `noOccupantInWindow` instead.
    if (options.apply && !noOccupantInWindow) {
      const template = opCharges[0];

      await tx.charge.deleteMany({
        where: { shopId, operationId, proprietor: false, forRent: false },
      });

      const newCharges: Prisma.ChargeCreateManyInput[] = newList
        .filter((n) => n.days > 0 && n.amount !== 0)
        .map((n) => ({
          title: template.title,
          amount: n.amount,
          shopId,
          plaque: template.plaque,
          personId: n.personId,
          personName: n.personName,
          date: n.startDate,
          operationId,
          operationName: template.operationName,
          daysCount: n.days,
          proprietor: false,
          forRent: false,
          description: template.description,
        }));

      if (newCharges.length) {
        await tx.charge.createMany({ data: newCharges });
      }
    }
  }

  return results;
}
