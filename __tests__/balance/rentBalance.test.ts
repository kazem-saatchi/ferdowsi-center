import { labels } from "@/utils/label";
import {
  buildRentBalanceRows,
  RENT_PDF_COLUMNS,
  rentBalancePdfRows,
  monthsBehind,
  RentShopInput,
  rentStatus,
  sortRentBalances,
  summarizeRentBalances,
} from "@/utils/rentBalance";

const shop = (overrides: Partial<RentShopInput> & { id: string; plaque: number }): RentShopInput => ({
  type: "BOARD",
  ownerName: "مدیریت",
  renterName: null,
  RentAmount: null,
  rentDate: null,
  ...overrides,
});

const agg = (shopId: string, amount: number, date: string) => ({
  shopId,
  _sum: { amount },
  _max: { date: new Date(date) },
});

describe("monthsBehind", () => {
  it("divides the debt by the monthly rent, one decimal", () => {
    expect(monthsBehind(-25_000_000, 10_000_000)).toBe(2.5);
    expect(monthsBehind(-10_000_000, 3_000_000)).toBe(3.3);
  });

  it("is null when nothing is owed or there is no rent to divide by", () => {
    expect(monthsBehind(0, 10_000_000)).toBeNull();
    expect(monthsBehind(5_000_000, 10_000_000)).toBeNull();
    expect(monthsBehind(-5_000_000, 0)).toBeNull();
  });
});

describe("buildRentBalanceRows", () => {
  const shops = [
    shop({ id: "a", plaque: 901, RentAmount: 4_000_000, rentDate: new Date("2026-03-21") }),
    shop({ id: "b", plaque: 902, type: "PARKING", renterName: "علی", RentAmount: 1_000_000 }),
    shop({ id: "c", plaque: 903 }),
  ];
  const rows = buildRentBalanceRows(
    shops,
    [agg("a", 12_000_000, "2026-10-23"), agg("b", 3_000_000, "2026-10-23")],
    [agg("a", 4_000_000, "2026-08-01"), agg("b", 4_000_000, "2026-11-01")],
    // The reference wins over the unit's own RentAmount.
    [{ shopId: "a", totalAmount: 4_000_000 }, { shopId: "b", totalAmount: 0 }]
  );

  it("keeps payment − charge as the balance and both totals", () => {
    expect(rows[0]).toMatchObject({
      shopId: "a",
      totalCharge: 12_000_000,
      totalPayment: 4_000_000,
      balance: -8_000_000,
      monthlyRent: 4_000_000,
      monthsBehind: 2,
      lastPaymentDate: new Date("2026-08-01"),
      lastChargeDate: new Date("2026-10-23"),
      rentStartDate: new Date("2026-03-21"),
    });
  });

  it("falls back to the unit's RentAmount when the reference is empty", () => {
    expect(rows[1]).toMatchObject({ monthlyRent: 1_000_000, balance: 1_000_000, monthsBehind: null });
  });

  it("gives a unit with no charges, payments or rent zeros and nulls", () => {
    expect(rows[2]).toMatchObject({
      balance: 0,
      totalCharge: 0,
      totalPayment: 0,
      monthlyRent: 0,
      monthsBehind: null,
      lastPaymentDate: null,
      lastChargeDate: null,
    });
  });

  it("summarizes debt, credit and units with no rent set", () => {
    expect(summarizeRentBalances(rows)).toEqual({
      unitCount: 3,
      debtorCount: 1,
      totalDebt: 8_000_000,
      totalCredit: 1_000_000,
      net: -7_000_000,
      missingRentCount: 1,
    });
  });

  it("labels each balance by status", () => {
    expect(rows.map((row) => rentStatus(row.balance))).toEqual([
      "debtor",
      "creditor",
      "settled",
    ]);
  });

  it("sorts by biggest debt or most months behind, ties by plaque", () => {
    expect(sortRentBalances(rows, "debt").map((r) => r.plaque)).toEqual([901, 903, 902]);
    expect(sortRentBalances(rows, "monthsBehind").map((r) => r.plaque)).toEqual([901, 902, 903]);
    expect(sortRentBalances([...rows].reverse(), "plaque").map((r) => r.plaque)).toEqual([901, 902, 903]);
  });

  it("prints PDF rows with every column filled and the sign as a status word", () => {
    const pdf = rentBalancePdfRows(rows);
    expect(pdf[0]).toEqual({
      plaque: "۹۰۱",
      type: labels.board,
      owner: "مدیریت",
      renter: labels.noValue,
      rent: "۴,۰۰۰,۰۰۰",
      charged: "۱۲,۰۰۰,۰۰۰",
      paid: "۴,۰۰۰,۰۰۰",
      remaining: "۸,۰۰۰,۰۰۰",
      status: labels.statusDebtor,
      months: "۲",
    });
    expect(pdf[2]).toMatchObject({ rent: labels.rentNotSet, status: labels.statusSettled, months: labels.noValue });
    for (const column of RENT_PDF_COLUMNS) {
      // exportToPDF reformats any accessor containing these words.
      expect(column.accessor).not.toMatch(/balance|amount/i);
      expect(pdf[0][column.accessor]).not.toBeUndefined();
    }
  });
});
