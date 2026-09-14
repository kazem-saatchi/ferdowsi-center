import { db } from "@/lib/db";
import { HistoryType, ShopType } from "@prisma/client";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

/**
 * Removes rent charges raised against the building management for units that
 * nobody was renting.
 *
 * addRentAllKiosks filtered getRelatedHistories by shop type but not by history
 * type. That helper returns InActive (vacant) and ActiveByOwner (management
 * holding the unit) spans alongside ActiveByRenter, and on these units the
 * personId of the first two IS the management person — so every month a board
 * sat empty, the landlord was invoiced rent for their own empty board.
 *
 * The generator now filters on ActiveByRenter. This clears the rows written
 * before that.
 *
 * A charge is removed only when BOTH hold, so a real tenant charge can never be
 * caught by accident:
 *   - it is billed to the unit's own owner (the management person), and
 *   - no ActiveByRenter span covers its date.
 *
 * Run with:  npx tsx scripts/cleanup-vacant-rent-charges.ts
 *            (reports only — nothing is written)
 *   apply:   npx tsx scripts/cleanup-vacant-rent-charges.ts --apply
 *
 * --apply writes a JSON snapshot of every deleted row to backups/ first, so the
 * charges can be recreated.
 */

const RENTABLE: ShopType[] = [ShopType.KIOSK, ShopType.PARKING, ShopType.BOARD];

const money = (n: number) => n.toLocaleString("en-US");
const day = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "(open)");

async function main() {
  const apply = process.argv.includes("--apply");

  const units = await db.shop.findMany({
    where: { type: { in: RENTABLE } },
    orderBy: { plaque: "asc" },
    select: {
      id: true,
      plaque: true,
      type: true,
      ownerId: true,
      ownerName: true,
      renterName: true,
    },
  });
  const unitById = new Map(units.map((u) => [u.id, u]));

  const histories = await db.shopHistory.findMany({
    where: { shopId: { in: units.map((u) => u.id) } },
    select: {
      shopId: true,
      type: true,
      personName: true,
      startDate: true,
      endDate: true,
    },
  });
  const historiesByShop = new Map<string, typeof histories>();
  for (const h of histories) {
    const list = historiesByShop.get(h.shopId) ?? [];
    list.push(h);
    historiesByShop.set(h.shopId, list);
  }

  // A ShopHistory span is half-open: [startDate, endDate).
  const covers = (h: (typeof histories)[number], date: Date) =>
    h.startDate <= date && (!h.endDate || date < h.endDate);

  const rentCharges = await db.charge.findMany({
    where: { shopId: { in: units.map((u) => u.id) }, forRent: true },
    orderBy: [{ plaque: "asc" }, { date: "asc" }],
  });

  const doomed = rentCharges.filter((charge) => {
    const unit = unitById.get(charge.shopId)!;
    if (charge.personId !== unit.ownerId) return false;
    const spans = historiesByShop.get(charge.shopId) ?? [];
    return !spans.some(
      (h) => h.type === HistoryType.ActiveByRenter && covers(h, charge.date)
    );
  });

  console.log(
    `rent charges on ${units.length} rentable units: ${rentCharges.length} ` +
      `(${money(rentCharges.reduce((s, c) => s + c.amount, 0))})`
  );

  if (!doomed.length) {
    console.log("nothing billed to management over a vacant period.");
    return;
  }

  const byUnit = new Map<number, typeof doomed>();
  for (const c of doomed) {
    const list = byUnit.get(c.plaque) ?? [];
    list.push(c);
    byUnit.set(c.plaque, list);
  }

  console.log(
    `\nto remove: ${doomed.length} charge(s), ` +
      `${money(doomed.reduce((s, c) => s + c.amount, 0))}\n`
  );

  for (const plaque of Array.from(byUnit.keys()).sort((a, b) => a - b)) {
    const rows = byUnit.get(plaque)!;
    const unit = unitById.get(rows[0].shopId)!;
    const spans = (historiesByShop.get(unit.id) ?? []).filter(
      (h) => h.type !== HistoryType.Ownership
    );
    console.log(
      `${unit.type} ${plaque}  renter=${unit.renterName ?? "--- vacant"}  ` +
        `${rows.length} charge(s)  ${money(
          rows.reduce((s, c) => s + c.amount, 0)
        )}`
    );
    for (const h of spans) {
      console.log(
        `     span ${h.type.padEnd(14)} ${day(h.startDate)} -> ${day(
          h.endDate
        )}  ${h.personName}`
      );
    }
    console.log(
      `     ${day(rows[0].date)} .. ${day(rows[rows.length - 1].date)}`
    );
  }

  if (!apply) {
    console.log("\ndry run — pass --apply to delete.");
    return;
  }

  const dir = join(process.cwd(), "backups");
  mkdirSync(dir, { recursive: true });
  const file = join(
    dir,
    `vacant-rent-charges-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
  );
  writeFileSync(file, JSON.stringify(doomed, null, 2), "utf8");
  console.log(`\nsnapshot of the full rows: ${file}`);

  const result = await db.charge.deleteMany({
    where: { id: { in: doomed.map((c) => c.id) } },
  });
  console.log(`deleted ${result.count} charge(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
