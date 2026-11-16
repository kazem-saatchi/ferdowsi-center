import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { addBillingDays, toBillingDay } from "@/app/api/actions/charge/utils";
import {
  OperationChargeDiff,
  recomputeShopMonthlyCharges,
} from "@/app/api/actions/charge/recalcCharges";

/**
 * Moves monthly charge windows that were stored ONE DAY EARLY back onto the
 * Jalali month, and gives the shifted day back to the right occupant.
 *
 * Before the billing-day fix, the month picker sent Tehran midnight (20:30 UTC
 * the previous day) and a UTC server truncated it to the UTC day, so e.g.
 * «شارژ خرداد 1405» was stored as 31 اردیبهشت .. 30 خرداد. Two consequences
 * survive the code fix:
 *  - the outgoing occupant of every split in such a month carries one extra
 *    day (and the incoming one a day less);
 *  - recomputeShopMonthlyCharges rebuilds each window from the stored dates,
 *    so after a history date edit the shifted month and the month before it
 *    both contain that last day — someone is always billed for it.
 *
 * A window is "shifted" when its first day is not day 1 of a Jalali month but
 * the next day is. For those operations the rows that start on the window's
 * first day are moved forward one day (the window length is already right:
 * both ends of the picker were shifted alike). Then each affected shop is
 * re-split by the real recalculation, so this cannot drift from it — but only
 * windows of the shifted months where nobody moves by more than ONE day are
 * written. A bigger difference comes from an owner/renter change backdated
 * after the charge was generated; that is listed for review and left alone.
 *
 * Window totals per shop never change — only who carries which days.
 * Payments are not touched; windows where a person loses charge they have
 * already paid into are flagged for a manual payment move.
 *
 * Run with:  npx tsx scripts/fix-shifted-charge-windows.ts
 *            (dry run: everything happens in a transaction that is rolled back)
 *   apply:   npx tsx scripts/fix-shifted-charge-windows.ts --apply
 *
 * --apply writes a JSON snapshot of every monthly charge of the affected shops
 * to backups/ first, so the change can be reversed.
 */

const jalaliDayOfMonth = new Intl.DateTimeFormat("en-US-u-ca-persian-nu-latn", {
  timeZone: "UTC",
  day: "numeric",
});
const jalaliDate = new Intl.DateTimeFormat("en-US-u-ca-persian-nu-latn", {
  timeZone: "UTC",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Day of the Jalali month for a billing day (UTC midnight of a Tehran date). */
const jDay = (billingDay: Date) => Number(jalaliDayOfMonth.format(billingDay));
const jFmt = (d: Date | string) => jalaliDate.format(toBillingDay(new Date(d)));
const fmt = (n: number) => n.toLocaleString("en-US");

class DryRun extends Error {}

type Resplit = { plaque: number; diff: OperationChargeDiff };

function printWindows(title: string, list: Resplit[]) {
  console.log(`\n${title} (${list.length}):`);
  const sorted = [...list].sort((a, b) =>
    a.diff.windowStart.localeCompare(b.diff.windowStart)
  );
  for (const { plaque, diff } of sorted) {
    const flags = [
      diff.hasPaymentConflict ? "PAYMENT-REVIEW" : "",
      diff.noOccupantInWindow ? "NO-OCCUPANT" : "",
    ]
      .filter(Boolean)
      .join(" ");
    console.log(
      `\n  ${diff.operationName}  plaque ${plaque}  ${jFmt(diff.windowStart)}..${jFmt(diff.windowEnd)} ${flags}`
    );
    for (const p of diff.perPerson) {
      console.log(
        `    ${p.personName.padEnd(26)} ${String(p.oldDays).padStart(2)}d ${fmt(p.oldAmount).padStart(11)}  ->  ${String(p.newDays).padStart(2)}d ${fmt(p.newAmount).padStart(11)}` +
          (p.paidInWindow ? `   paid in window: ${fmt(p.paidInWindow)}` : "") +
          (p.needsPaymentReview ? "  <- move payment by hand" : "")
      );
    }
  }
}

async function fixShiftedChargeWindows() {
  const apply = process.argv.includes("--apply");

  const charges = await db.charge.findMany({
    where: { proprietor: false, forRent: false, daysCount: { gt: 0 } },
    select: { id: true, operationId: true, operationName: true, shopId: true, date: true },
  });

  // First billed day of each operation's window.
  const opStart = new Map<string, { name: string; start: Date }>();
  for (const c of charges) {
    const day = toBillingDay(c.date);
    const op = opStart.get(c.operationId);
    if (!op || day < op.start) {
      opStart.set(c.operationId, { name: c.operationName, start: day });
    }
  }

  const shifted = Array.from(opStart.entries()).filter(
    ([, op]) => jDay(op.start) !== 1 && jDay(addBillingDays(op.start, 1)) === 1
  );

  if (!shifted.length) {
    console.log("No shifted windows found. Nothing to do.");
    return;
  }

  const shiftedIds = new Set(shifted.map(([id]) => id));

  const total = (diff: OperationChargeDiff, key: "oldAmount" | "newAmount") =>
    diff.perPerson.reduce((sum, p) => sum + p[key], 0);

  /**
   * A window of a shifted month in which nobody gains or loses more than a
   * day, and whose total is unchanged. The total check matters where the
   * histories leave a day with no occupant (plaque 401, آذر 1404): the
   * re-split would bill that day to nobody and lose it.
   */
  const isShiftCorrection = (diff: OperationChargeDiff) =>
    shiftedIds.has(diff.operationId) &&
    total(diff, "oldAmount") === total(diff, "newAmount") &&
    diff.perPerson.every((p) => Math.abs(p.newDays - p.oldDays) <= 1);

  // Rows that open a shifted window, i.e. the ones to move forward a day.
  // Every shop is re-dated, but only shops a shifted month was SPLIT on can
  // carry the misplaced day, so only those are re-split (one round trip per
  // query from here is slow; re-checking all ~174 shops outran the timeout).
  const moves = new Map<string, { newDate: Date; ids: string[] }>();
  const shopIds = new Set<string>();
  const splitShopIds = new Set<string>();
  for (const [operationId, op] of shifted) {
    const ids = charges
      .filter(
        (c) =>
          c.operationId === operationId &&
          toBillingDay(c.date).getTime() === op.start.getTime()
      )
      .map((c) => c.id);
    moves.set(operationId, { newDate: addBillingDays(op.start, 1), ids });
    const rowsPerShop = new Map<string, number>();
    charges
      .filter((c) => c.operationId === operationId)
      .forEach((c) => {
        shopIds.add(c.shopId);
        rowsPerShop.set(c.shopId, (rowsPerShop.get(c.shopId) ?? 0) + 1);
      });
    rowsPerShop.forEach((rows, shopId) => {
      if (rows > 1) splitShopIds.add(shopId);
    });
  }

  console.log(
    `Shifted windows (${shifted.length}), ${splitShopIds.size} shops split in them:`
  );
  for (const [operationId, op] of shifted) {
    const move = moves.get(operationId)!;
    console.log(
      `  ${op.name.padEnd(20)} ${jFmt(op.start)} -> ${jFmt(move.newDate)}  rows re-dated: ${move.ids.length}`
    );
  }

  const plaqueOf = new Map(
    (
      await db.shop.findMany({
        where: { id: { in: Array.from(shopIds) } },
        select: { id: true, plaque: true },
      })
    ).map((s) => [s.id, s.plaque])
  );

  if (apply) {
    const snapshot = await db.charge.findMany({
      where: { shopId: { in: Array.from(shopIds) }, proprietor: false, forRent: false },
    });
    mkdirSync(join(process.cwd(), "backups"), { recursive: true });
    const file = join(
      process.cwd(),
      "backups",
      `shifted-charge-windows-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
    );
    writeFileSync(file, JSON.stringify(snapshot, null, 2));
    console.log(`\nSnapshot of ${snapshot.length} charge rows written to ${file}`);
  }

  const resplits: Resplit[] = [];

  try {
    await db.$transaction(
      async (tx) => {
        for (const move of Array.from(moves.values())) {
          if (move.ids.length) {
            await tx.charge.updateMany({
              where: { id: { in: move.ids } },
              data: { date: move.newDate },
            });
          }
        }

        for (const shopId of Array.from(splitShopIds)) {
          const diffs = await recomputeShopMonthlyCharges(tx, shopId, {
            apply: true,
            shouldApply: isShiftCorrection,
          });
          for (const diff of diffs) {
            resplits.push({ plaque: plaqueOf.get(shopId) ?? -1, diff });
          }
        }

        if (!apply) throw new DryRun();
      },
      { timeout: 30 * 60 * 1000, maxWait: 60 * 1000 }
    );
  } catch (error) {
    if (!(error instanceof DryRun)) throw error;
  }

  const corrected = resplits.filter((r) => isShiftCorrection(r.diff));
  const skipped = resplits.filter((r) => !isShiftCorrection(r.diff));

  printWindows("One-day corrections (written by --apply)", corrected);
  printWindows("Backdated owner/renter changes (NOT written, for review)", skipped);

  console.log(
    `\n${apply ? "APPLIED" : "DRY RUN — rolled back, nothing written"}: ` +
      `${Array.from(moves.values()).reduce((n, m) => n + m.ids.length, 0)} rows re-dated, ` +
      `${corrected.length} windows corrected by one day ` +
      `(${corrected.filter((r) => r.diff.hasPaymentConflict).length} with a payment to review), ` +
      `${skipped.length} backdated-change windows left as they are.`
  );
}

fixShiftedChargeWindows()
  .catch((error: unknown) => {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error(error.code, error.message);
    } else {
      console.error(error);
    }
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
