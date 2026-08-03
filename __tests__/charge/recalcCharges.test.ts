import { Charge, Payment, ShopHistory, Prisma } from "@prisma/client";
import { recomputeShopMonthlyCharges } from "@/app/api/actions/charge/recalcCharges";

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

function charge(over: Partial<Charge>): Charge {
  return {
    id: `charge-${++seq}`,
    title: "شارژ مرداد 1404",
    amount: 0,
    shopId: SHOP_ID,
    plaque: 804,
    personId: OWNER.id,
    personName: OWNER.name,
    date: d("2025-07-22"),
    operationId: "op-1",
    operationName: "شارژ مرداد 1404",
    daysCount: 0,
    proprietor: false,
    description: "",
    forRent: false,
    bankTransactionId: null,
    ...over,
  };
}

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

function payment(over: Partial<Payment>): Payment {
  return {
    id: `payment-${++seq}`,
    amount: 0,
    title: "ثبت شارژ سیتمی",
    shopId: SHOP_ID,
    plaque: 804,
    personId: OWNER.id,
    personName: OWNER.name,
    date: d("2025-08-05"),
    proprietor: false,
    type: "BANK_TRANSFER",
    description: "",
    receiptImageUrl: "",
    bankTransactionId: null,
    ...over,
  };
}

/**
 * In-memory stand-in for the Prisma transaction client. Records every write so
 * a test can assert both what changed and — just as importantly — what didn't.
 */
function makeTx(data: {
  charges: Charge[];
  histories: ShopHistory[];
  payments?: Payment[];
}) {
  const deleted: unknown[] = [];
  const created: Prisma.ChargeCreateManyInput[] = [];
  const paymentWrites: string[] = [];

  const paymentGuard = new Proxy(
    {
      findMany: async () => data.payments ?? [],
    },
    {
      get(target, prop: string) {
        if (prop in target) return (target as Record<string, unknown>)[prop];
        // Any write to Payment is a contract violation: recalc must never move money.
        return async () => {
          paymentWrites.push(prop);
        };
      },
    }
  );

  const tx = {
    charge: {
      findMany: async () => data.charges,
      deleteMany: async (args: unknown) => {
        deleted.push(args);
        return { count: data.charges.length };
      },
      createMany: async (args: { data: Prisma.ChargeCreateManyInput[] }) => {
        created.push(...args.data);
        return { count: args.data.length };
      },
    },
    shopHistory: {
      findMany: async () => data.histories,
    },
    payment: paymentGuard,
  } as unknown as Prisma.TransactionClient;

  return { tx, deleted, created, paymentWrites };
}

/**
 * The plaque-804 scenario: a full month billed to the owner, then a renter is
 * backdated into the middle of it. The charge must re-split, and because the
 * owner already paid that month the diff has to say so out loud.
 */
const backdatedRenterCase = () => ({
  charges: [
    charge({ personId: OWNER.id, personName: OWNER.name, amount: 11_600_000, daysCount: 31 }),
  ],
  histories: [
    history({ endDate: d("2025-07-27"), isActive: false }),
    history({
      personId: RENTER.id,
      personName: RENTER.name,
      type: "ActiveByRenter",
      startDate: d("2025-07-27"),
      endDate: null,
    }),
  ],
});

describe("recomputeShopMonthlyCharges", () => {
  describe("re-splitting a window after a backdated renter", () => {
    it("splits the month by occupied days without changing the window total", async () => {
      const { tx } = makeTx(backdatedRenterCase());

      const diffs = await recomputeShopMonthlyCharges(tx, SHOP_ID, {
        apply: false,
      });

      expect(diffs).toHaveLength(1);
      const [window] = diffs;
      expect(window.windowStart).toBe(d("2025-07-22").toISOString());
      expect(window.windowEnd).toBe(d("2025-08-21").toISOString());

      const owner = window.perPerson.find((p) => p.personId === OWNER.id)!;
      const renter = window.perPerson.find((p) => p.personId === RENTER.id)!;

      // 31-day window at 11,600,000: owner keeps 22→27 Jul, renter takes the rest.
      expect(owner.oldDays).toBe(31);
      expect(owner.oldAmount).toBe(11_600_000);
      expect(owner.newDays).toBe(5);
      expect(owner.newAmount).toBe(1_870_968);

      expect(renter.oldDays).toBe(0);
      expect(renter.oldAmount).toBe(0);
      expect(renter.newDays).toBe(26);
      expect(renter.newAmount).toBe(9_729_032);

      // No money may be created or destroyed by a re-attribution.
      expect(owner.newAmount + renter.newAmount).toBe(11_600_000);
      expect(owner.newDays + renter.newDays).toBe(31);
    });

    it("flags the payment conflict when charges leave a person who already paid", async () => {
      const { tx } = makeTx({
        ...backdatedRenterCase(),
        payments: [payment({ amount: 11_600_000, date: d("2025-08-05") })],
      });

      const [window] = await recomputeShopMonthlyCharges(tx, SHOP_ID, {
        apply: false,
      });

      const owner = window.perPerson.find((p) => p.personId === OWNER.id)!;
      const renter = window.perPerson.find((p) => p.personId === RENTER.id)!;

      // This is the 804 bug: the owner loses 9.7M of charge but keeps 11.6M of
      // money, so the pair would silently become a credit and a debt.
      expect(owner.paidInWindow).toBe(11_600_000);
      expect(owner.needsPaymentReview).toBe(true);

      // The renter gains charge; nothing is stranded on them.
      expect(renter.paidInWindow).toBe(0);
      expect(renter.needsPaymentReview).toBe(false);

      expect(window.hasPaymentConflict).toBe(true);
    });

    it("does not flag a conflict when the losing person has paid nothing", async () => {
      const { tx } = makeTx(backdatedRenterCase());

      const [window] = await recomputeShopMonthlyCharges(tx, SHOP_ID, {
        apply: false,
      });

      expect(window.hasPaymentConflict) .toBe(false);
      expect(window.perPerson.every((p) => p.paidInWindow === 0)).toBe(true);
      expect(window.perPerson.every((p) => !p.needsPaymentReview)).toBe(true);
    });

    it("only counts payments dated inside the window", async () => {
      const { tx } = makeTx({
        ...backdatedRenterCase(),
        payments: [
          payment({ amount: 500_000, date: d("2025-07-21") }), // day before windowStart
          payment({ amount: 11_600_000, date: d("2025-07-22") }), // first day — inside
          payment({ amount: 700_000, date: d("2025-08-21") }), // last day — inside
          payment({ amount: 900_000, date: d("2025-08-22") }), // windowEndExclusive
        ],
      });

      const [window] = await recomputeShopMonthlyCharges(tx, SHOP_ID, {
        apply: false,
      });

      const owner = window.perPerson.find((p) => p.personId === OWNER.id)!;
      expect(owner.paidInWindow).toBe(12_300_000);
    });
  });

  describe("write behaviour", () => {
    it("persists the new split under the original operation when apply is true", async () => {
      const { tx, deleted, created } = makeTx(backdatedRenterCase());

      await recomputeShopMonthlyCharges(tx, SHOP_ID, { apply: true });

      expect(deleted).toEqual([
        { where: { shopId: SHOP_ID, operationId: "op-1", proprietor: false, forRent: false } },
      ]);

      expect(created).toHaveLength(2);
      expect(created.map((c) => [c.personId, c.amount, c.daysCount])).toEqual([
        [OWNER.id, 1_870_968, 5],
        [RENTER.id, 9_729_032, 26],
      ]);
      // The operation identity has to survive so the window stays groupable.
      expect(created.every((c) => c.operationId === "op-1")).toBe(true);
      expect(created.every((c) => c.proprietor === false && c.forRent === false)).toBe(true);
    });

    it("writes nothing when apply is false", async () => {
      const { tx, deleted, created } = makeTx(backdatedRenterCase());

      await recomputeShopMonthlyCharges(tx, SHOP_ID, { apply: false });

      expect(deleted).toEqual([]);
      expect(created).toEqual([]);
    });

    it("never touches payments, even when applying", async () => {
      const { tx, paymentWrites } = makeTx({
        ...backdatedRenterCase(),
        payments: [payment({ amount: 11_600_000 })],
      });

      await recomputeShopMonthlyCharges(tx, SHOP_ID, { apply: true });

      expect(paymentWrites).toEqual([]);
    });
  });

  describe("no-op cases", () => {
    it("returns no diff when the split is already correct", async () => {
      const { tx, deleted, created } = makeTx({
        charges: [
          charge({ amount: 1_870_968, daysCount: 5, date: d("2025-07-22") }),
          charge({
            personId: RENTER.id,
            personName: RENTER.name,
            amount: 9_729_032,
            daysCount: 26,
            date: d("2025-07-27"),
          }),
        ],
        histories: backdatedRenterCase().histories,
      });

      const diffs = await recomputeShopMonthlyCharges(tx, SHOP_ID, {
        apply: true,
      });

      expect(diffs).toEqual([]);
      expect(deleted).toEqual([]);
      expect(created).toEqual([]);
    });

    it("returns no diff when the shop has no charges at all", async () => {
      const { tx } = makeTx({ charges: [], histories: [] });

      expect(
        await recomputeShopMonthlyCharges(tx, SHOP_ID, { apply: true })
      ).toEqual([]);
    });
  });

  describe("rounding", () => {
    it("preserves the window total exactly, absorbing drift on the longest segment", async () => {
      // 10,000,000 over 3 days does not divide evenly.
      const { tx } = makeTx({
        charges: [charge({ amount: 10_000_000, daysCount: 3, date: d("2025-07-22") })],
        histories: [
          history({ endDate: d("2025-07-23"), isActive: false }),
          history({
            personId: RENTER.id,
            personName: RENTER.name,
            type: "ActiveByRenter",
            startDate: d("2025-07-23"),
            endDate: null,
          }),
        ],
      });

      const [window] = await recomputeShopMonthlyCharges(tx, SHOP_ID, {
        apply: false,
      });

      const total = window.perPerson.reduce((sum, p) => sum + p.newAmount, 0);
      expect(total).toBe(10_000_000);

      const owner = window.perPerson.find((p) => p.personId === OWNER.id)!;
      const renter = window.perPerson.find((p) => p.personId === RENTER.id)!;
      expect(owner.newDays).toBe(1);
      expect(renter.newDays).toBe(2);
      // Drift lands on the renter (2 days), not the owner.
      expect(owner.newAmount).toBe(3_333_333);
      expect(renter.newAmount).toBe(6_666_667);
    });
  });

  describe("multiple operations", () => {
    it("re-splits each operation window independently", async () => {
      const { tx } = makeTx({
        charges: [
          charge({ amount: 11_600_000, daysCount: 31, date: d("2025-07-22") }),
          charge({
            operationId: "op-2",
            operationName: "شارژ شهریور 1404",
            title: "شارژ شهریور 1404",
            amount: 11_600_000,
            daysCount: 31,
            date: d("2025-08-22"),
          }),
        ],
        histories: backdatedRenterCase().histories,
      });

      const diffs = await recomputeShopMonthlyCharges(tx, SHOP_ID, {
        apply: false,
      });

      expect(diffs).toHaveLength(2);

      // First window straddles the handover, second is entirely the renter's.
      const first = diffs.find((o) => o.operationId === "op-1")!;
      const second = diffs.find((o) => o.operationId === "op-2")!;

      expect(first.perPerson.find((p) => p.personId === RENTER.id)!.newDays).toBe(26);

      const secondRenter = second.perPerson.find((p) => p.personId === RENTER.id)!;
      expect(secondRenter.newDays).toBe(31);
      expect(secondRenter.newAmount).toBe(11_600_000);
      expect(second.perPerson.find((p) => p.personId === OWNER.id)!.newAmount).toBe(0);
    });
  });
});
