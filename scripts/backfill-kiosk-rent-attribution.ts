import { db } from "@/lib/db";
import {
  isRentableShopType,
  resolveShopPersonAtDate,
  OccupantShop,
} from "@/app/api/actions/payment/resolveOccupant";
import { Prisma, ShopType } from "@prisma/client";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

/**
 * Re-attributes rent payments on the units the building management rents out
 * (KIOSK / PARKING / BOARD).
 *
 * On those types `proprietor` marks RENT owed by the occupant, but
 * resolveShopPersonAtDate used to send every proprietor payment to the owner —
 * and management owns all of them. So addRentAllKiosks billed the renter from
 * ShopHistory while the matching bank payment was credited to management: a
 * permanent phantom debt on the tenant and a phantom credit on the landlord.
 *
 * The resolver is now type-aware. This repairs the rows written before that.
 *
 * Attribution is delegated to the real resolver (one ShopHistory query per
 * payment) rather than reimplemented here, so the backfill and the live path
 * cannot drift. A payment dated to a genuinely vacant period still resolves to
 * management and is left alone.
 *
 * Run with:  npx tsx scripts/backfill-kiosk-rent-attribution.ts
 *            (reports only — nothing is written)
 *   apply:   npx tsx scripts/backfill-kiosk-rent-attribution.ts --apply
 *
 * --apply writes a JSON snapshot of every row's previous personId/personName to
 * backups/ first, so the change can be reversed.
 */

const RENTABLE: ShopType[] = [ShopType.KIOSK, ShopType.PARKING, ShopType.BOARD];

interface Move {
  paymentId: string;
  plaque: number;
  shopType: ShopType;
  date: Date;
  amount: number;
  fromPersonId: string;
  fromPersonName: string;
  toPersonId: string;
  toPersonName: string;
  fromHistory: boolean;
}

const fmt = (n: number) => n.toLocaleString("en-US");
const day = (d: Date) => d.toISOString().slice(0, 10);

async function backfillKioskRentAttribution() {
  const apply = process.argv.includes("--apply");

  const shops = await db.shop.findMany({
    where: { type: { in: RENTABLE } },
    select: {
      id: true,
      plaque: true,
      type: true,
      ownerId: true,
      ownerName: true,
      renterId: true,
      renterName: true,
    },
  });

  const rentables = shops.filter((shop) => isRentableShopType(shop.type));
  const shopById = new Map(rentables.map((shop) => [shop.id, shop]));

  // Only rows credited to the unit's owner are suspect. A rent payment already
  // sitting on a tenant was either resolved correctly or fixed by hand.
  const payments = await db.payment.findMany({
    where: {
      proprietor: true,
      shopId: { in: rentables.map((shop) => shop.id) },
    },
    select: {
      id: true,
      shopId: true,
      personId: true,
      personName: true,
      amount: true,
      date: true,
    },
    orderBy: [{ plaque: "asc" }, { date: "asc" }],
  });

  const candidates = payments.filter(
    (payment) => payment.personId === shopById.get(payment.shopId)!.ownerId
  );

  console.log(
    `${rentables.length} rented-out units, ${payments.length} proprietor payments, ` +
      `${candidates.length} credited to the owner${apply ? "" : " (dry run)"}`
  );

  const moves: Move[] = [];
  const vacant: Move[] = [];

  for (const payment of candidates) {
    const shop = shopById.get(payment.shopId)!;

    const resolved = await resolveShopPersonAtDate(
      db as unknown as Prisma.TransactionClient,
      shop as OccupantShop,
      payment.date,
      true
    );

    const move: Move = {
      paymentId: payment.id,
      plaque: shop.plaque,
      shopType: shop.type,
      date: payment.date,
      amount: payment.amount,
      fromPersonId: payment.personId,
      fromPersonName: payment.personName,
      toPersonId: resolved.personId,
      toPersonName: resolved.personName,
      fromHistory: resolved.fromHistory,
    };

    if (resolved.personId === payment.personId) vacant.push(move);
    else moves.push(move);
  }

  const byUnit = new Map<number, Move[]>();
  for (const move of moves) {
    if (!byUnit.has(move.plaque)) byUnit.set(move.plaque, []);
    byUnit.get(move.plaque)!.push(move);
  }

  for (const plaque of Array.from(byUnit.keys()).sort((a, b) => a - b)) {
    const unitMoves = byUnit.get(plaque)!;
    const total = unitMoves.reduce((sum, move) => sum + move.amount, 0);
    console.log(
      `\n${unitMoves[0].shopType} ${plaque}  ${unitMoves.length} payment(s)  ${fmt(total)}`
    );
    for (const move of unitMoves) {
      const source = move.fromHistory ? "history" : "fallback";
      console.log(
        `   ${day(move.date)}  ${fmt(move.amount).padStart(13)}  ` +
          `${move.fromPersonName} -> ${move.toPersonName}  (${source})`
      );
    }
  }

  if (vacant.length) {
    const total = vacant.reduce((sum, move) => sum + move.amount, 0);
    console.log(
      `\nLeft with management (vacant on that date): ${vacant.length} payment(s), ${fmt(total)}`
    );
  }

  const moved = moves.reduce((sum, move) => sum + move.amount, 0);
  const fallbacks = moves.filter((move) => !move.fromHistory).length;
  console.log(
    `\nTo re-attribute: ${moves.length} payment(s), ${fmt(moved)} rial, ` +
      `across ${byUnit.size} unit(s). ${fallbacks} resolved by fallback, not history.`
  );

  if (!moves.length) {
    console.log("Nothing to do.");
    return;
  }

  if (!apply) {
    console.log("\nDry run — no rows written. Re-run with --apply to write.");
    return;
  }

  const backupDir = join(process.cwd(), "backups");
  mkdirSync(backupDir, { recursive: true });
  const backupPath = join(
    backupDir,
    `kiosk-rent-attribution-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
  );
  writeFileSync(
    backupPath,
    JSON.stringify(
      moves.map((move) => ({
        paymentId: move.paymentId,
        plaque: move.plaque,
        date: move.date,
        amount: move.amount,
        previousPersonId: move.fromPersonId,
        previousPersonName: move.fromPersonName,
        newPersonId: move.toPersonId,
        newPersonName: move.toPersonName,
      })),
      null,
      2
    ),
    "utf8"
  );
  console.log(`\nSnapshot of previous values: ${backupPath}`);

  // One transaction: either every payment moves or none does, so a dropped
  // connection cannot leave the ledger half-repaired.
  await db.$transaction(
    moves.map((move) =>
      db.payment.update({
        where: { id: move.paymentId },
        data: { personId: move.toPersonId, personName: move.toPersonName },
      })
    )
  );

  console.log(`Updated ${moves.length} payment(s).`);
}

backfillKioskRentAttribution()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
