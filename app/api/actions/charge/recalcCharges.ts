import { Prisma, HistoryType } from "@prisma/client";
import { startOfDay, addDays, differenceInDays } from "date-fns";

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
 *    between owner/renter using the (already updated) ShopHistory spans:
 *      dailyRate = Σ(charge.amount) / totalDays
 *  - Rounding is absorbed on the largest segment so the window total is preserved.
 *
 * This never depends on ShopChargeReference (which may have changed since the
 * charge was generated), so the operation is a pure re-attribution.
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
}

export interface OperationChargeDiff {
  operationId: string;
  operationName: string;
  /** ISO date of the first day covered by the window */
  windowStart: string;
  /** ISO date of the last day covered by the window (inclusive) */
  windowEnd: string;
  perPerson: ChargeDiffPerson[];
}

const maxDate = (a: Date, b: Date) => (a > b ? a : b);
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
    // Half-open window of exactly totalOldDays days, independent of any
    // +1/-1 convention differences between the original generators.
    const windowEndExclusive = addDays(windowStart, totalOldDays);
    const dailyRate = totalOldAmount / totalOldDays;

    // New segments derived from the (updated) history spans.
    const newByPerson = new Map<
      string,
      { personName: string; days: number; startDate: Date }
    >();

    for (const h of histories) {
      const segStart = maxDate(startOfDay(h.startDate), windowStart);
      const histEnd = h.endDate ? startOfDay(h.endDate) : windowEndExclusive;
      const segEnd = minDate(histEnd, windowEndExclusive);
      const days = differenceInDays(segEnd, segStart);
      if (days <= 0) continue;

      const existing = newByPerson.get(h.personId);
      if (existing) {
        existing.days += days;
        existing.startDate = minDate(existing.startDate, segStart);
      } else {
        newByPerson.set(h.personId, {
          personName: h.personName,
          days,
          startDate: segStart,
        });
      }
    }

    // Assign amounts, preserving the window total exactly.
    const newList = Array.from(newByPerson.entries()).map(
      ([personId, value]) => ({
        personId,
        personName: value.personName,
        days: value.days,
        startDate: value.startDate,
        amount: Math.round(value.days * dailyRate),
      })
    );

    const roundedTotal = newList.reduce((sum, n) => sum + n.amount, 0);
    const remainder = totalOldAmount - roundedTotal;
    if (remainder !== 0 && newList.length) {
      // Absorb rounding drift on the segment with the most days.
      const target = newList.reduce((a, b) => (b.days > a.days ? b : a));
      target.amount += remainder;
    }

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

    let changed = false;
    const perPerson: ChargeDiffPerson[] = [];
    for (const personId of Array.from(personIds)) {
      const old = oldByPerson.get(personId);
      const next = newList.find((n) => n.personId === personId);
      const oldDays = old?.days ?? 0;
      const oldAmount = old?.amount ?? 0;
      const newDays = next?.days ?? 0;
      const newAmount = next?.amount ?? 0;

      if (oldDays !== newDays || oldAmount !== newAmount) changed = true;

      perPerson.push({
        personId,
        personName: next?.personName ?? old?.personName ?? "",
        oldDays,
        oldAmount,
        newDays,
        newAmount,
      });
    }

    if (!changed) continue;

    results.push({
      operationId,
      operationName: opCharges[0].operationName,
      windowStart: windowStart.toISOString(),
      windowEnd: addDays(windowEndExclusive, -1).toISOString(),
      perPerson,
    });

    if (options.apply) {
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
