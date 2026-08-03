import { Prisma } from "@prisma/client";
import {
  resolveShopPersonAtDate,
  OccupantShop,
} from "@/app/api/actions/payment/resolveOccupant";

const OWNER = { id: "owner-1", name: "محمد صفری" };
const RENTER = { id: "renter-1", name: "رامین قدردان" };

const d = (iso: string) => {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const shop: OccupantShop = {
  id: "shop-804",
  ownerId: OWNER.id,
  ownerName: OWNER.name,
  renterId: RENTER.id,
  renterName: RENTER.name,
};

type Row = {
  personId: string;
  personName: string;
  startDate: Date;
  endDate: Date | null;
  type: string;
};

/**
 * Fake transaction client that applies the same where-clause semantics Prisma
 * would, so the test exercises the real boundary conditions rather than a stub
 * that always returns the first row.
 */
function makeTx(rows: Row[]) {
  const calls: unknown[] = [];
  const tx = {
    shopHistory: {
      findFirst: async (args: {
        where: {
          shopId: string;
          type: { in: string[] };
          startDate: { lte: Date };
          OR: [{ endDate: null }, { endDate: { gt: Date } }];
        };
      }) => {
        calls.push(args);
        const { where } = args;
        const date = where.startDate.lte;
        const matches = rows
          .filter(
            (r) =>
              where.type.in.includes(r.type) &&
              r.startDate <= date &&
              (r.endDate === null || r.endDate > date)
          )
          // orderBy: { startDate: "desc" }
          .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
        return matches[0] ?? null;
      },
    },
  } as unknown as Prisma.TransactionClient;

  return { tx, calls };
}

// The 804 timeline, as it exists after the renter was registered.
const rows: Row[] = [
  {
    personId: OWNER.id,
    personName: OWNER.name,
    type: "ActiveByOwner",
    startDate: d("2024-01-01"),
    endDate: d("2025-07-27"),
  },
  {
    personId: RENTER.id,
    personName: RENTER.name,
    type: "ActiveByRenter",
    startDate: d("2025-07-27"),
    endDate: null,
  },
];

describe("resolveShopPersonAtDate", () => {
  it("attributes a transaction to the occupant on its own date, not the current renter", async () => {
    const { tx } = makeTx(rows);

    // Dated while the owner still occupied the shop, even though a renter is
    // the shop's current occupant.
    const result = await resolveShopPersonAtDate(tx, shop, d("2025-05-10"), false);

    expect(result).toEqual({
      personId: OWNER.id,
      personName: OWNER.name,
      fromHistory: true,
    });
  });

  it("attributes a transaction dated inside the tenancy to the renter", async () => {
    const { tx } = makeTx(rows);

    const result = await resolveShopPersonAtDate(tx, shop, d("2025-10-24"), false);

    expect(result).toEqual({
      personId: RENTER.id,
      personName: RENTER.name,
      fromHistory: true,
    });
  });

  it("gives the handover day to the incoming person, matching the charge split", async () => {
    const { tx } = makeTx(rows);

    // Spans are half-open: the owner's endDate is exclusive.
    const dayBefore = await resolveShopPersonAtDate(tx, shop, d("2025-07-26"), false);
    const handover = await resolveShopPersonAtDate(tx, shop, d("2025-07-27"), false);

    expect(dayBefore.personId).toBe(OWNER.id);
    expect(handover.personId).toBe(RENTER.id);
  });

  it("respects the time of day on the handover boundary", async () => {
    const { tx } = makeTx(rows);
    const afternoonOfHandover = new Date(d("2025-07-27").getTime() + 14 * 3600_000);

    const result = await resolveShopPersonAtDate(tx, shop, afternoonOfHandover, false);

    expect(result.personId).toBe(RENTER.id);
  });

  it("always attributes proprietor transactions to the owner without a lookup", async () => {
    const { tx, calls } = makeTx(rows);

    // Dated deep inside the tenancy — مالکانه still follows ownership.
    const result = await resolveShopPersonAtDate(tx, shop, d("2026-04-22"), true);

    expect(result).toEqual({
      personId: OWNER.id,
      personName: OWNER.name,
      fromHistory: false,
    });
    expect(calls).toHaveLength(0);
  });

  it("falls back to the shop's current state when no history covers the date", async () => {
    const { tx } = makeTx(rows);

    // Before any recorded occupancy — this is the late-registration case the
    // date-aware lookup cannot solve.
    const result = await resolveShopPersonAtDate(tx, shop, d("2023-06-01"), false);

    expect(result).toEqual({
      personId: RENTER.id,
      personName: RENTER.name,
      fromHistory: false,
    });
  });

  it("falls back to the owner when the shop has no renter and no history", async () => {
    const { tx } = makeTx([]);

    const result = await resolveShopPersonAtDate(
      tx,
      { ...shop, renterId: null, renterName: null },
      d("2025-10-24"),
      false
    );

    expect(result).toEqual({
      personId: OWNER.id,
      personName: OWNER.name,
      fromHistory: false,
    });
  });

  it("uses the InActive occupant when the shop was closed on that date", async () => {
    const { tx } = makeTx([
      ...rows.slice(0, 1),
      {
        personId: OWNER.id,
        personName: OWNER.name,
        type: "InActive",
        startDate: d("2025-07-27"),
        endDate: null,
      },
    ]);

    const result = await resolveShopPersonAtDate(tx, shop, d("2025-10-24"), false);

    expect(result).toEqual({
      personId: OWNER.id,
      personName: OWNER.name,
      fromHistory: true,
    });
  });

  it("ignores Ownership rows, which describe title rather than occupancy", async () => {
    const { tx, calls } = makeTx(rows);

    await resolveShopPersonAtDate(tx, shop, d("2025-10-24"), false);

    const where = (calls[0] as { where: { type: { in: string[] } } }).where;
    expect(where.type.in).not.toContain("Ownership");
    expect(where.type.in).toEqual([
      "ActiveByOwner",
      "ActiveByRenter",
      "InActive",
    ]);
  });

  it("scopes the lookup to the shop being paid for", async () => {
    const { tx, calls } = makeTx(rows);

    await resolveShopPersonAtDate(tx, shop, d("2025-10-24"), false);

    const where = (calls[0] as { where: { shopId: string } }).where;
    expect(where.shopId).toBe("shop-804");
  });
});
