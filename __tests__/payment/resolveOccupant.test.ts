import { Prisma, ShopType } from "@prisma/client";
import {
  resolveShopPersonAtDate,
  isRentableShopType,
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
  type: ShopType.STORE,
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

  it("attributes a STORE proprietor transaction to the owner without a lookup", async () => {
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

  it("attributes an OFFICE proprietor transaction to the owner too", async () => {
    const { tx, calls } = makeTx(rows);

    const result = await resolveShopPersonAtDate(
      tx,
      { ...shop, type: ShopType.OFFICE },
      d("2026-04-22"),
      true
    );

    expect(result.personId).toBe(OWNER.id);
    expect(calls).toHaveLength(0);
  });
});

// The building management owns every rented-out unit, so on these types
// `proprietor` marks rent that the OCCUPANT owes. Crediting it to the owner
// billed the renter and paid the landlord: charge on one person, payment on the
// other, forever.
describe("resolveShopPersonAtDate on units the management rents out", () => {
  const MGMT = { id: "mgmt-1", name: "مجتمع فردوسی آبادگران" };
  const KIOSK_RENTER = { id: "renter-kiosk", name: "یاسین حمیدی" };

  const kiosk: OccupantShop = {
    id: "shop-239",
    type: ShopType.KIOSK,
    ownerId: MGMT.id,
    ownerName: MGMT.name,
    renterId: KIOSK_RENTER.id,
    renterName: KIOSK_RENTER.name,
  };

  const kioskRows: Row[] = [
    {
      personId: MGMT.id,
      personName: MGMT.name,
      type: "ActiveByOwner",
      startDate: d("2024-01-01"),
      endDate: d("2025-03-01"),
    },
    {
      personId: KIOSK_RENTER.id,
      personName: KIOSK_RENTER.name,
      type: "ActiveByRenter",
      startDate: d("2025-03-01"),
      endDate: null,
    },
  ];

  it.each([ShopType.KIOSK, ShopType.PARKING, ShopType.BOARD])(
    "date-resolves a proprietor payment on a %s to the renter who owes the rent",
    async (type) => {
      const { tx, calls } = makeTx(kioskRows);

      const result = await resolveShopPersonAtDate(
        tx,
        { ...kiosk, type },
        d("2026-04-22"),
        true
      );

      expect(result).toEqual({
        personId: KIOSK_RENTER.id,
        personName: KIOSK_RENTER.name,
        fromHistory: true,
      });
      // It must actually consult occupancy rather than short-circuit.
      expect(calls).toHaveLength(1);
    }
  );

  it("still credits the management owner while the unit sat vacant", async () => {
    const { tx } = makeTx(kioskRows);

    // Before the tenancy began the unit was held by management, so rent booked
    // then really is theirs. This is what proves the lookup is date-driven and
    // not just "renter on rentables".
    const result = await resolveShopPersonAtDate(tx, kiosk, d("2024-06-15"), true);

    expect(result).toEqual({
      personId: MGMT.id,
      personName: MGMT.name,
      fromHistory: true,
    });
  });

  it("splits a proprietor payment across the handover the same way rent is billed", async () => {
    const { tx } = makeTx(kioskRows);

    const dayBefore = await resolveShopPersonAtDate(tx, kiosk, d("2025-02-28"), true);
    const handover = await resolveShopPersonAtDate(tx, kiosk, d("2025-03-01"), true);

    expect(dayBefore.personId).toBe(MGMT.id);
    expect(handover.personId).toBe(KIOSK_RENTER.id);
  });

  it("falls back to the renter when no history covers the date", async () => {
    const { tx } = makeTx([]);

    const result = await resolveShopPersonAtDate(tx, kiosk, d("2026-04-22"), true);

    expect(result).toEqual({
      personId: KIOSK_RENTER.id,
      personName: KIOSK_RENTER.name,
      fromHistory: false,
    });
  });
});

describe("isRentableShopType", () => {
  it("covers exactly the units the management rents out", () => {
    expect(isRentableShopType(ShopType.KIOSK)).toBe(true);
    expect(isRentableShopType(ShopType.PARKING)).toBe(true);
    expect(isRentableShopType(ShopType.BOARD)).toBe(true);
    expect(isRentableShopType(ShopType.STORE)).toBe(false);
    expect(isRentableShopType(ShopType.OFFICE)).toBe(false);
  });

  it("classifies every type in the enum, so a new one cannot slip through", () => {
    // If a type is added to the schema this fails until someone decides which
    // side of the rent/مالکانه line it belongs on.
    const classified = Object.values(ShopType).map((t) => [t, isRentableShopType(t)]);
    expect(classified).toEqual([
      [ShopType.STORE, false],
      [ShopType.OFFICE, false],
      [ShopType.KIOSK, true],
      [ShopType.PARKING, true],
      [ShopType.BOARD, true],
    ]);
  });
});
