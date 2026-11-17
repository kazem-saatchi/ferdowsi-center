import type { ShopType } from "@prisma/client";
import type { ShopsBalanceData } from "@/schema/balanceSchema";
import { formatNumber, toPersianDigits } from "./formatNumber";
import { labels } from "./label";
import { shopTypeLabel } from "./shopType";

/** One row of the rent balance list (BOARD and PARKING units). It is a
 *  superset of ShopsBalanceData, so the existing rent PDF/Excel exports keep
 *  reading it unchanged. `balance` keeps that list's sign: payment − charge,
 *  so a negative balance is rent owed. */
export interface RentBalanceData extends ShopsBalanceData {
  shopId: string;
  type: ShopType;
  totalCharge: number;
  totalPayment: number;
  /** The monthly rent the generator bills: the rent reference, or the unit's
   *  own RentAmount when no reference exists yet. 0 when neither is set. */
  monthlyRent: number;
  /** Unpaid rent in months (debt ÷ monthly rent, one decimal). Null when the
   *  unit owes nothing or has no monthly rent to divide by. */
  monthsBehind: number | null;
  lastPaymentDate: Date | null;
  lastChargeDate: Date | null;
  rentStartDate: Date | null;
}

export type RentStatus = "debtor" | "settled" | "creditor";

export function rentStatus(balance: number): RentStatus {
  if (balance < 0) return "debtor";
  if (balance > 0) return "creditor";
  return "settled";
}

export function monthsBehind(balance: number, monthlyRent: number): number | null {
  if (balance >= 0 || monthlyRent <= 0) return null;
  return Math.round((-balance / monthlyRent) * 10) / 10;
}

export interface RentShopInput {
  id: string;
  plaque: number;
  type: ShopType;
  ownerName: string;
  renterName: string | null;
  RentAmount: number | null;
  rentDate: Date | null;
}

export interface RentAggregate {
  shopId: string;
  _sum: { amount: number | null };
  _max: { date: Date | null };
}

/** Joins the units with their charge/payment aggregates and rent reference.
 *  Kept free of the database so the arithmetic can be tested on its own. */
export function buildRentBalanceRows(
  shops: RentShopInput[],
  chargeSums: RentAggregate[],
  paymentSums: RentAggregate[],
  references: { shopId: string; totalAmount: number }[]
): RentBalanceData[] {
  const charges = new Map(chargeSums.map((row) => [row.shopId, row]));
  const payments = new Map(paymentSums.map((row) => [row.shopId, row]));
  const referenceRent = new Map(
    references.map((row) => [row.shopId, row.totalAmount])
  );

  return shops.map((shop) => {
    const charge = charges.get(shop.id);
    const payment = payments.get(shop.id);
    const totalCharge = charge?._sum.amount ?? 0;
    const totalPayment = payment?._sum.amount ?? 0;
    const balance = totalPayment - totalCharge;
    const reference = referenceRent.get(shop.id) ?? 0;
    const monthlyRent = reference > 0 ? reference : shop.RentAmount ?? 0;

    return {
      shopId: shop.id,
      plaque: shop.plaque,
      type: shop.type,
      ownerName: shop.ownerName,
      renterName: shop.renterName,
      balance,
      totalCharge,
      totalPayment,
      monthlyRent,
      monthsBehind: monthsBehind(balance, monthlyRent),
      lastPaymentDate: payment?._max.date ?? null,
      lastChargeDate: charge?._max.date ?? null,
      rentStartDate: shop.rentDate,
    };
  });
}

export interface RentBalanceSummary {
  unitCount: number;
  debtorCount: number;
  /** Sum of what the debtors owe, as a positive number. */
  totalDebt: number;
  /** Sum of the creditors' advance payments, as a positive number. */
  totalCredit: number;
  /** payment − charge over every row, same sign as `balance`. */
  net: number;
  missingRentCount: number;
}

export function summarizeRentBalances(rows: RentBalanceData[]): RentBalanceSummary {
  const summary: RentBalanceSummary = {
    unitCount: rows.length,
    debtorCount: 0,
    totalDebt: 0,
    totalCredit: 0,
    net: 0,
    missingRentCount: 0,
  };
  for (const row of rows) {
    summary.net += row.balance;
    if (row.balance < 0) {
      summary.debtorCount += 1;
      summary.totalDebt -= row.balance;
    } else if (row.balance > 0) {
      summary.totalCredit += row.balance;
    }
    if (row.monthlyRent <= 0) summary.missingRentCount += 1;
  }
  return summary;
}

export type RentSort = "plaque" | "debt" | "monthsBehind";

/** A sorted copy. Debt and months-behind put the biggest debt first, and
 *  fall back to plaque order so equal rows keep a stable order. */
export function sortRentBalances(
  rows: RentBalanceData[],
  sort: RentSort
): RentBalanceData[] {
  const byPlaque = (a: RentBalanceData, b: RentBalanceData) => a.plaque - b.plaque;
  const copy = [...rows];
  if (sort === "debt") {
    return copy.sort((a, b) => a.balance - b.balance || byPlaque(a, b));
  }
  if (sort === "monthsBehind") {
    return copy.sort(
      (a, b) =>
        (b.monthsBehind ?? -1) - (a.monthsBehind ?? -1) || byPlaque(a, b)
    );
  }
  return copy.sort(byPlaque);
}

export const RENT_STATUS_LABELS: Record<RentStatus, string> = {
  debtor: labels.statusDebtor,
  settled: labels.statusSettled,
  creditor: labels.statusCreditor,
};

export const rentStatusLabel = (balance: number): string =>
  RENT_STATUS_LABELS[rentStatus(balance)];

/** Columns of the rent PDF. The cells arrive already formatted, so none of
 *  these accessors may contain "balance" or "amount" — exportToPDF would run
 *  formatNumber over them a second time. */
export const RENT_PDF_COLUMNS = [
  { header: labels.plaque, accessor: "plaque" },
  { header: labels.type, accessor: "type" },
  { header: labels.ownerName, accessor: "owner" },
  { header: labels.renterName, accessor: "renter" },
  { header: labels.rentMonthly, accessor: "rent" },
  { header: labels.rentTotalCharged, accessor: "charged" },
  { header: labels.rentTotalPaid, accessor: "paid" },
  { header: labels.totalBalance, accessor: "remaining" },
  { header: labels.status, accessor: "status" },
  { header: labels.rentMonthsBehind, accessor: "months" },
] as const;

export type RentPdfRow = Record<(typeof RENT_PDF_COLUMNS)[number]["accessor"], string>;

/** One printable row per unit. The balance is printed without its sign, next
 *  to its status word, the way the screen shows it. */
export function rentBalancePdfRows(rows: RentBalanceData[]): RentPdfRow[] {
  return rows.map((row) => ({
    plaque: toPersianDigits(row.plaque),
    type: shopTypeLabel(row.type),
    owner: row.ownerName,
    renter: row.renterName || labels.noValue,
    rent: row.monthlyRent > 0 ? formatNumber(row.monthlyRent) : labels.rentNotSet,
    charged: formatNumber(row.totalCharge),
    paid: formatNumber(row.totalPayment),
    remaining: formatNumber(Math.abs(row.balance)),
    status: rentStatusLabel(row.balance),
    // The bare number: the header already says months, and jsPDF has no
    // bidi support, so "۲ ماه" would print as "ماه ۲".
    months:
      row.monthsBehind !== null ? toPersianDigits(row.monthsBehind) : labels.noValue,
  }));
}
