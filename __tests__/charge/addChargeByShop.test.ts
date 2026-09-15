import { Prisma, ShopHistory } from "@prisma/client";
import addChargeByShop from "@/app/api/actions/charge/addChargeByShop";
import { db } from "@/lib/db";

jest.mock("@/lib/db", () => ({
  db: {
    shopHistory: { findMany: jest.fn() },
    shopChargeReference: { findFirst: jest.fn() },
    operation: { create: jest.fn() },
    charge: { createMany: jest.fn() },
    $transaction: jest.fn(),
  },
}));

// The action itself only cares that it was handed an ADMIN; auth is covered
// elsewhere, so run the inner action directly.
jest.mock("@/utils/handleServerAction", () => ({
  handleServerAction: async (action: (user: unknown) => Promise<unknown>) => {
    try {
      return { success: true, message: "ok", data: await action({ role: "ADMIN" }) };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "unknown",
      };
    }
  },
}));

const SHOP_ID = "shop-804";
const OWNER = { id: "owner-1", name: "محمد صفری" };
const RENTER = { id: "renter-1", name: "رامین قدردان" };

/**
 * Local midnight, matching what `startOfDay` produces. Using UTC here would
 * make every assertion timezone-dependent.
 */
const d = (iso: string) => {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
};

let seq = 0;

function history(over: Partial<ShopHistory>): ShopHistory {
  return {
    id: `history-${++seq}`,
    shopId: SHOP_ID,
    plaque: 804,
    personId: OWNER.id,
    personName: OWNER.name,
    type: "ActiveByOwner",
    startDate: d("2024-01-01"),
    endDate: null,
    isActive: true,
    shopType: "OFFICE",
    createdAt: d("2024-01-01"),
    ...over,
  };
}

/** مرداد 1404: a 31-day window, billed inclusively on both ends. */
const WINDOW = { startDate: d("2025-07-22"), endDate: d("2025-08-21") };
const TOTAL_AMOUNT = 11_600_000;

const created: Prisma.ChargeCreateManyInput[] = [];

function setup(histories: ShopHistory[], totalAmount = TOTAL_AMOUNT) {
  created.length = 0;

  (db.shopHistory.findMany as jest.Mock).mockResolvedValue(histories);
  (db.shopChargeReference.findFirst as jest.Mock).mockResolvedValue({
    shopId: SHOP_ID,
    totalAmount,
    proprietor: false,
  });
  (db.operation.create as jest.Mock).mockResolvedValue({
    id: "op-1",
    title: "شارژ مرداد 1404",
  });
  (db.charge.createMany as jest.Mock).mockImplementation(
    async (args: { data: Prisma.ChargeCreateManyInput[] }) => {
      created.push(...args.data);
      return { count: args.data.length };
    }
  );
  (db.$transaction as jest.Mock).mockImplementation(
    async (fn: (client: typeof db) => Promise<unknown>) => fn(db)
  );
}

const run = () =>
  addChargeByShop({ ...WINDOW, shopId: SHOP_ID, title: "شارژ مرداد 1404" });

describe("addChargeByShop", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("a month with a mid-month handover", () => {
    /**
     * The outgoing span is closed on the SAME date the incoming one opens, so
     * the shared date must be billed once — to the incoming occupant. The old
     * `differenceInDays(...) + 1` billed it to both, producing 32 billed days
     * in a 31-day month and a 3.2% over-charge on the unit.
     */
    const handoverCase = () => [
      history({ endDate: d("2025-08-17"), isActive: false }),
      history({
        personId: RENTER.id,
        personName: RENTER.name,
        type: "ActiveByRenter",
        startDate: d("2025-08-17"),
        endDate: null,
      }),
    ];

    it("bills exactly the days in the window, never one more", async () => {
      setup(handoverCase());

      const result = await run();

      expect(result.success).toBe(true);
      expect(created).toHaveLength(2);
      expect(created.map((c) => c.daysCount)).toEqual([26, 5]);
      expect(created.reduce((sum, c) => sum + (c.daysCount ?? 0), 0)).toBe(31);
    });

    it("does not bill the handover date to both people", async () => {
      setup(handoverCase());

      await run();

      const [outgoing, incoming] = created;

      // The outgoing charge starts at the window start and stops before the
      // handover; the incoming charge starts on it.
      expect(outgoing.date).toEqual(d("2025-07-22"));
      expect(outgoing.personId).toBe(OWNER.id);
      expect(incoming.date).toEqual(d("2025-08-17"));
      expect(incoming.personId).toBe(RENTER.id);
    });

    it("splits the shop's reference total without creating money", async () => {
      setup(handoverCase());

      await run();

      // 11,600,000 / 31 is not an integer, so neither slice can be either
      // unless it is rounded — and the two must still add back up exactly.
      expect(created.reduce((sum, c) => sum + c.amount, 0)).toBe(TOTAL_AMOUNT);
      expect(created.every((c) => Number.isInteger(c.amount))).toBe(true);
    });
  });

  describe("amounts written to the Int column", () => {
    it("never writes a fractional Rial, whatever the day split", async () => {
      // A total that divides into nothing clean over 31 days.
      setup(
        [
          history({ endDate: d("2025-08-01"), isActive: false }),
          history({
            personId: RENTER.id,
            personName: RENTER.name,
            type: "ActiveByRenter",
            startDate: d("2025-08-01"),
            endDate: null,
          }),
        ],
        7_300_000
      );

      await run();

      expect(created.every((c) => Number.isInteger(c.amount))).toBe(true);
      expect(created.reduce((sum, c) => sum + c.amount, 0)).toBe(7_300_000);
    });

    it("bills the whole reference total to a single uninterrupted occupant", async () => {
      setup([history({})]);

      await run();

      expect(created).toHaveLength(1);
      expect(created[0].amount).toBe(TOTAL_AMOUNT);
      expect(created[0].daysCount).toBe(31);
    });
  });

  describe("spans that cover none of the window", () => {
    it("refuses to generate a charge rather than writing an empty batch", async () => {
      // A span that ends on the window's first day covers no billed day.
      setup([history({ endDate: d("2025-07-22"), isActive: false })]);

      const result = await run();

      expect(result.success).toBe(false);
      expect(db.charge.createMany).not.toHaveBeenCalled();
    });
  });
});
