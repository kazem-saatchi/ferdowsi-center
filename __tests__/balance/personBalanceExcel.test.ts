import type {
  LedgerTotals,
  PersonBalanceSummary,
  PersonUnitBalance,
} from "@/app/api/actions/balance/getPersonBalance";
import {
  buildPersonBalanceWorkbook,
  monthlyShareRows,
  sectionUnits,
} from "@/utils/personBalanceExcel";
import { labels } from "@/utils/label";

const totals = (charge: number, payment: number): LedgerTotals => ({
  charge,
  payment,
  balance: charge - payment,
});

function unit(
  plaque: number,
  monthly: LedgerTotals,
  proprietor: LedgerTotals,
  monthlyShare: PersonUnitBalance["monthlyShare"] = null
): PersonUnitBalance {
  return {
    shopId: `shop-${plaque}`,
    plaque,
    type: "STORE",
    isOwner: true,
    isRenter: false,
    totalCharge: monthly.charge + proprietor.charge,
    totalPayment: monthly.payment + proprietor.payment,
    balance: monthly.balance + proprietor.balance,
    ownCharge: 0,
    ownPayment: 0,
    monthly,
    proprietor,
    monthlyShare,
  };
}

// 101 has both ledgers and a renter; 102 only a monthly ledger and no renter.
const units = [
  unit(101, totals(1000, 400), totals(5000, 5000), {
    renterName: "رضا",
    ownerName: "علی احمدی",
    renter: totals(700, 400),
    owner: totals(300, 0),
  }),
  unit(102, totals(300, 0), totals(0, 0)),
];

const summary: PersonBalanceSummary = {
  unitCount: 2,
  debtUnitCount: 2,
  totalCharge: 6300,
  totalPayment: 5400,
  balance: 900,
  monthly: totals(1300, 400),
  proprietor: totals(5000, 5000),
};

const person = {
  firstName: "علی",
  lastName: "احمدی",
  IdNumber: "0012345678",
  phoneOne: "09121234567",
};

describe("monthlyShareRows", () => {
  it("is empty for a unit without a renter", () => {
    expect(monthlyShareRows(units[1])).toEqual([]);
  });

  it("gives renter then owner, each adding up to the monthly ledger", () => {
    const [renter, owner] = monthlyShareRows(units[0]);
    expect(renter.totals.balance + owner.totals.balance).toBe(units[0].monthly.balance);
    expect(renter.totals.charge + owner.totals.charge).toBe(units[0].monthly.charge);
  });
});

describe("sectionUnits", () => {
  it("keeps only units with activity in that ledger", () => {
    expect(sectionUnits(units, "monthly").map((u) => u.plaque)).toEqual([101, 102]);
    expect(sectionUnits(units, "proprietor").map((u) => u.plaque)).toEqual([101]);
  });
});

describe("buildPersonBalanceWorkbook", () => {
  it("prints a monthly and a proprietor section, each with its subtotal, then the overall total", async () => {
    const workbook = await buildPersonBalanceWorkbook({ person, units, summary });
    const sheet = workbook.worksheets[0];

    const rows: Array<Array<unknown>> = [];
    sheet.eachRow((row) => {
      rows.push((row.values as unknown[]).slice(1));
    });
    const indexOf = (label: string) => rows.findIndex((row) => row[0] === label);

    const monthlyTitle = indexOf(labels.monthlyChargeSection);
    const monthlyTotal = indexOf(labels.totalChargeBalance);
    const proprietorTitle = indexOf(labels.proprietorChargeSection);
    const proprietorTotal = indexOf(labels.totalProprietorBalance);
    const grandTotal = indexOf(labels.totalBalance);

    expect(monthlyTitle).toBeGreaterThan(-1);
    expect(monthlyTitle).toBeLessThan(monthlyTotal);
    expect(monthlyTotal).toBeLessThan(proprietorTitle);
    expect(proprietorTitle).toBeLessThan(proprietorTotal);
    expect(proprietorTotal).toBeLessThan(grandTotal);

    // Two monthly rows, the rented one followed by its renter and owner shares;
    // one proprietor row with no shares. Figures come from the right ledger.
    const monthlyRows = rows.slice(monthlyTitle + 1, monthlyTotal);
    expect(monthlyRows.map((row) => [row[1], row[4], row[5], row[6]])).toEqual([
      [101, 1000, 400, 600],
      [`${labels.renterShareOfMonthly} — رضا`, 700, 400, 300],
      [`${labels.ownerShareOfMonthly} — علی احمدی`, 300, 0, 300],
      [102, 300, 0, 300],
    ]);
    // The ex-renter footnote follows the monthly subtotal, and only that one.
    expect(rows[monthlyTotal + 1][0]).toBe(labels.exRenterShareNote);
    expect(rows.filter((row) => row[0] === labels.exRenterShareNote)).toHaveLength(1);
    const proprietorRows = rows.slice(proprietorTitle + 1, proprietorTotal);
    expect(proprietorRows.map((row) => [row[1], row[4], row[5], row[6]])).toEqual([
      [101, 5000, 5000, 0],
    ]);

    expect(rows[monthlyTotal].slice(4, 7)).toEqual([1300, 400, 900]);
    expect(rows[proprietorTotal].slice(4, 7)).toEqual([5000, 5000, 0]);
    expect(rows[grandTotal].slice(4, 7)).toEqual([6300, 5400, 900]);
  });
});
