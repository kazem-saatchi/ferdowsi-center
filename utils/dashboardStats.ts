import type { ShopType } from "@prisma/client";

/** Charges that belong to each balance list, mirrored from the list pages so a
 *  dashboard figure always matches the page it links to. KIOSK deliberately
 *  appears in both the proprietor and the rent bucket — that is how the two
 *  lists already count it. */
export const BALANCE_BUCKETS = {
  monthly: {
    types: ["STORE", "OFFICE", "KIOSK"] as ShopType[],
    proprietor: false,
  },
  proprietor: {
    types: ["STORE", "OFFICE", "KIOSK"] as ShopType[],
    proprietor: true,
  },
  rent: {
    types: ["KIOSK", "BOARD", "PARKING"] as ShopType[],
    proprietor: true,
  },
} as const;

export type BalanceBucket = keyof typeof BALANCE_BUCKETS;

/** One balance list, summarised. Balances are payment − charge, so debts are
 *  reported here as positive amounts and `net` stays negative while the complex
 *  is owed money. */
export interface BucketSummary {
  unitCount: number;
  debtorCount: number;
  debtTotal: number;
  creditorCount: number;
  creditTotal: number;
  net: number;
  chargeTotal: number;
  paymentTotal: number;
}

export interface DebtorRow {
  shopId: string;
  plaque: number;
  ownerName: string;
  renterName: string | null;
  /** Positive rials still owed, across every kind of charge. */
  debt: number;
}

/** The shop fields the summary needs — a subset of the Prisma model, so callers
 *  can select only these columns. */
export interface DashboardShop {
  id: string;
  plaque: number;
  type: ShopType;
  isActive: boolean;
  ownerName: string;
  renterName: string | null;
  renterId: string | null;
}

/** A `groupBy(["shopId", "proprietor"])` row, flattened. */
export interface ShopAmount {
  shopId: string;
  proprietor: boolean;
  amount: number;
}

export interface DashboardStats {
  balances: Record<BalanceBucket, BucketSummary>;
  topDebtors: DebtorRow[];
  byType: Array<{ type: ShopType; count: number }>;
}

const emptySummary = (): BucketSummary => ({
  unitCount: 0,
  debtorCount: 0,
  debtTotal: 0,
  creditorCount: 0,
  creditTotal: 0,
  net: 0,
  chargeTotal: 0,
  paymentTotal: 0,
});

/** Turns per-shop charge and payment sums into the figures the dashboard shows.
 *  Pure, so it can be checked against the balance pages without a request. */
export function summariseDashboard(
  shops: DashboardShop[],
  charges: ShopAmount[],
  payments: ShopAmount[],
  topDebtorCount: number
): DashboardStats {
  const shopIds = new Set(shops.map((shop) => shop.id));

  // Per (shop, proprietor flag), plus one running debt per shop that spans both
  // flags for the "worst debtors" list.
  const sums = new Map<string, { charge: number; payment: number }>();
  const totalDebt = new Map<string, number>();

  const bump = (row: ShopAmount, isCharge: boolean) => {
    if (!shopIds.has(row.shopId)) return;
    const key = `${row.shopId}-${row.proprietor}`;
    const entry = sums.get(key) ?? { charge: 0, payment: 0 };
    if (isCharge) entry.charge += row.amount;
    else entry.payment += row.amount;
    sums.set(key, entry);
    totalDebt.set(
      row.shopId,
      (totalDebt.get(row.shopId) ?? 0) + (isCharge ? row.amount : -row.amount)
    );
  };

  charges.forEach((row) => bump(row, true));
  payments.forEach((row) => bump(row, false));

  const balances: Record<BalanceBucket, BucketSummary> = {
    monthly: emptySummary(),
    proprietor: emptySummary(),
    rent: emptySummary(),
  };

  (Object.keys(BALANCE_BUCKETS) as BalanceBucket[]).forEach((bucketName) => {
    const bucket = BALANCE_BUCKETS[bucketName];
    const summary = balances[bucketName];

    shops.forEach((shop) => {
      if (!bucket.types.includes(shop.type)) return;
      const entry = sums.get(`${shop.id}-${bucket.proprietor}`);
      const charge = entry?.charge ?? 0;
      const payment = entry?.payment ?? 0;
      const balance = payment - charge;

      summary.unitCount += 1;
      summary.chargeTotal += charge;
      summary.paymentTotal += payment;
      summary.net += balance;
      if (balance < 0) {
        summary.debtorCount += 1;
        summary.debtTotal += -balance;
      } else if (balance > 0) {
        summary.creditorCount += 1;
        summary.creditTotal += balance;
      }
    });
  });

  const shopsById = new Map(shops.map((shop) => [shop.id, shop]));

  // Worst debtors across every kind of charge, so one list answers "who owes
  // the most" without the reader adding up three pages.
  const topDebtors: DebtorRow[] = Array.from(totalDebt.entries())
    .filter(([, debt]) => debt > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topDebtorCount)
    .map(([shopId, debt]) => {
      const shop = shopsById.get(shopId)!;
      return {
        shopId,
        plaque: shop.plaque,
        ownerName: shop.ownerName,
        renterName: shop.renterName,
        debt,
      };
    });

  const counts = new Map<ShopType, number>();
  shops.forEach((shop) => {
    counts.set(shop.type, (counts.get(shop.type) ?? 0) + 1);
  });
  const byType = Array.from(counts.entries()).map(([type, count]) => ({
    type,
    count,
  }));

  return { balances, topDebtors, byType };
}
