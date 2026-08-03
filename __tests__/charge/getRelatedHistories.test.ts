import { getRelatedHistories } from "@/app/api/actions/charge/utils";
import { db } from "@/lib/db";

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
