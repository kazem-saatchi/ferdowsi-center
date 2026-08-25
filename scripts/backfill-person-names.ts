import { db } from "@/lib/db";

/**
 * Repairs name drift left behind by renames that happened before updatePerson
 * cascaded the new name into the denormalized copies (Shop.ownerName,
 * Shop.renterName, ShopHistory.personName, Charge.personName,
 * Payment.personName).
 *
 * Detection is four groupBy queries — one per table — rather than a scan per
 * person, because the free-tier pooler drops the connection long before a
 * few-hundred-person loop of per-row queries finishes. Writes are one
 * updateMany per person per table, and only for names that actually drifted.
 *
 * Run with:  npx tsx scripts/backfill-person-names.ts
 * Add --dry to only report what would change.
 */

interface Drift {
  personId: string;
  storedName: string;
  currentName: string;
  rows: number;
  table: "shop.ownerName" | "shop.renterName" | "history" | "charge" | "payment";
}

async function backfillPersonNames() {
  const dryRun = process.argv.includes("--dry");

  const persons = await db.person.findMany({
    select: { id: true, firstName: true, lastName: true },
  });
  const currentNames = new Map(
    persons.map((person) => [
      person.id,
      `${person.firstName} ${person.lastName}`,
    ])
  );

  console.log(`Loaded ${persons.length} persons${dryRun ? " (dry run)" : ""}`);

  // Distinct (personId, storedName) pairs per table — four queries total.
  const [chargePairs, paymentPairs, historyPairs, shops] = await Promise.all([
    db.charge.groupBy({
      by: ["personId", "personName"],
      _count: { _all: true },
    }),
    db.payment.groupBy({
      by: ["personId", "personName"],
      _count: { _all: true },
    }),
    db.shopHistory.groupBy({
      by: ["personId", "personName"],
      _count: { _all: true },
    }),
    db.shop.findMany({
      select: {
        id: true,
        plaque: true,
        ownerId: true,
        ownerName: true,
        renterId: true,
        renterName: true,
      },
    }),
  ]);

  const drifts: Drift[] = [];

  const collect = (
    pairs: {
      personId: string;
      personName: string;
      _count: { _all: number };
    }[],
    table: Drift["table"]
  ) => {
    for (const pair of pairs) {
      const currentName = currentNames.get(pair.personId);
      if (!currentName || currentName === pair.personName) continue;
      drifts.push({
        personId: pair.personId,
        storedName: pair.personName,
        currentName,
        rows: pair._count._all,
        table,
      });
    }
  };

  collect(chargePairs, "charge");
  collect(paymentPairs, "payment");
  collect(historyPairs, "history");

  for (const shop of shops) {
    const ownerName = currentNames.get(shop.ownerId);
    if (ownerName && ownerName !== shop.ownerName) {
      drifts.push({
        personId: shop.ownerId,
        storedName: shop.ownerName,
        currentName: ownerName,
        rows: 1,
        table: "shop.ownerName",
      });
    }

    if (!shop.renterId) continue;
    const renterName = currentNames.get(shop.renterId);
    if (renterName && renterName !== shop.renterName) {
      drifts.push({
        personId: shop.renterId,
        storedName: shop.renterName ?? "",
        currentName: renterName,
        rows: 1,
        table: "shop.renterName",
      });
    }
  }

  if (drifts.length === 0) {
    console.log("No stale names found");
    return;
  }

  // Report grouped by person, so a rename reads as one line per old name.
  const byPerson = new Map<string, Drift[]>();
  for (const drift of drifts) {
    byPerson.set(drift.personId, [
      ...(byPerson.get(drift.personId) ?? []),
      drift,
    ]);
  }

  let totalRows = 0;

  for (const [personId, personDrifts] of Array.from(byPerson.entries())) {
    const currentName = personDrifts[0].currentName;
    const rows = personDrifts.reduce((total, d) => total + d.rows, 0);
    const storedNames = Array.from(
      new Set(personDrifts.map((d) => d.storedName))
    );

    console.log(
      `[${storedNames.join("] [")}] -> [${currentName}]: ${rows} rows ` +
        `(${personDrifts.map((d) => `${d.table} ${d.rows}`).join(", ")})`
    );

    totalRows += rows;

    if (dryRun) continue;

    await db.$transaction([
      db.shop.updateMany({
        where: { ownerId: personId },
        data: { ownerName: currentName },
      }),
      db.shop.updateMany({
        where: { renterId: personId },
        data: { renterName: currentName },
      }),
      db.shopHistory.updateMany({
        where: { personId },
        data: { personName: currentName },
      }),
      db.charge.updateMany({
        where: { personId },
        data: { personName: currentName },
      }),
      db.payment.updateMany({
        where: { personId },
        data: { personName: currentName },
      }),
    ]);
  }

  console.log(
    dryRun
      ? `Would fix ${totalRows} rows across ${byPerson.size} persons`
      : `Fixed ${totalRows} rows across ${byPerson.size} persons`
  );
}

backfillPersonNames()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
