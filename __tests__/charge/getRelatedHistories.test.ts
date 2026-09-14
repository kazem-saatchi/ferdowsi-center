import {
  getRelatedHistories,
  isRentBillableHistory,
} from "@/app/api/actions/charge/utils";
import { db } from "@/lib/db";
import { HistoryType, ShopType } from "@prisma/client";

jest.mock("@/lib/db", () => ({
  db: {
    shopHistory: {
      findMany: jest.fn(),
    },
  },
}));

const findMany = db.shopHistory.findMany as jest.Mock;

const d = (iso: string) => {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const lastWhere = () => findMany.mock.calls[0][0].where;

describe("getRelatedHistories", () => {
  beforeEach(() => {
    findMany.mockReset();
    findMany.mockResolvedValue([]);
  });

  it("restricts the query to one shop when shopId is given", async () => {
    const result = await getRelatedHistories({
      startDate: d("2025-07-22"),
      endDate: d("2025-08-21"),
      shopId: "shop-804",
    });

    expect(result.success).toBe(true);
    // Without this filter, a single-shop charge run bills every shop in the
    // building at that one shop's daily rate.
    expect(lastWhere().shopId).toBe("shop-804");
  });

  it("queries every shop when shopId is omitted", async () => {
    await getRelatedHistories({
      startDate: d("2025-07-22"),
      endDate: d("2025-08-21"),
    });

    expect(lastWhere()).not.toHaveProperty("shopId");
  });

  it("excludes Ownership rows, which carry no occupancy", async () => {
    await getRelatedHistories({
      startDate: d("2025-07-22"),
      endDate: d("2025-08-21"),
      shopId: "shop-804",
    });

    expect(lastWhere().type).toEqual({
      in: ["ActiveByOwner", "ActiveByRenter", "InActive"],
    });
  });

  it("counts the day range inclusively", async () => {
    const result = await getRelatedHistories({
      startDate: d("2025-07-22"),
      endDate: d("2025-08-21"),
      shopId: "shop-804",
    });

    expect(result.totalDays).toBe(31);
  });

  it("rejects a range whose end is not after its start", async () => {
    const result = await getRelatedHistories({
      startDate: d("2025-08-21"),
      endDate: d("2025-07-22"),
      shopId: "shop-804",
    });

    expect(result.success).toBe(false);
    expect(findMany).not.toHaveBeenCalled();
  });
});

describe("isRentBillableHistory", () => {
  const span = (shopType: ShopType, type: HistoryType) => ({ shopType, type });

  it.each([ShopType.KIOSK, ShopType.BOARD, ShopType.PARKING])(
    "bills a %s span that has a renter on it",
    (shopType) => {
      expect(
        isRentBillableHistory(span(shopType, HistoryType.ActiveByRenter))
      ).toBe(true);
    }
  );

  it.each([ShopType.KIOSK, ShopType.BOARD, ShopType.PARKING])(
    "does not bill a vacant %s span",
    (shopType) => {
      // These units belong to the building management, so an InActive span
      // carries the management person — billing it invoices the landlord for
      // their own empty unit. Four boards ran up 155,800,000 that way.
      expect(isRentBillableHistory(span(shopType, HistoryType.InActive))).toBe(
        false
      );
    }
  );

  it.each([ShopType.KIOSK, ShopType.BOARD, ShopType.PARKING])(
    "does not bill a %s the management is holding itself",
    (shopType) => {
      // The six months KIOSK 346 stood empty between two tenants.
      expect(
        isRentBillableHistory(span(shopType, HistoryType.ActiveByOwner))
      ).toBe(false);
    }
  );

  it.each([ShopType.STORE, ShopType.OFFICE])(
    "never bills rent on a %s, which the management does not let",
    (shopType) => {
      expect(
        isRentBillableHistory(span(shopType, HistoryType.ActiveByRenter))
      ).toBe(false);
    }
  );

  it("classifies every shop type, so a new one cannot slip through", () => {
    const billable = Object.values(ShopType).map((shopType) => [
      shopType,
      isRentBillableHistory(span(shopType, HistoryType.ActiveByRenter)),
    ]);

    expect(billable).toEqual([
      [ShopType.STORE, false],
      [ShopType.OFFICE, false],
      [ShopType.KIOSK, true],
      [ShopType.PARKING, true],
      [ShopType.BOARD, true],
    ]);
  });

  it("classifies every history type, so a new one cannot slip through", () => {
    const billable = Object.values(HistoryType).map((type) => [
      type,
      isRentBillableHistory(span(ShopType.BOARD, type)),
    ]);

    expect(billable).toEqual([
      [HistoryType.ActiveByOwner, false],
      [HistoryType.ActiveByRenter, true],
      [HistoryType.InActive, false],
      [HistoryType.Ownership, false],
    ]);
  });
});
