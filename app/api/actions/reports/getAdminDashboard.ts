"use server";

import { db } from "@/lib/db";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG } from "@/utils/messages";
import {
  summariseDashboard,
  type BalanceBucket,
  type BucketSummary,
  type DebtorRow,
} from "@/utils/dashboardStats";
import { Person, ShopType } from "@prisma/client";

export type {
  BalanceBucket,
  BucketSummary,
  DebtorRow,
} from "@/utils/dashboardStats";

export interface AdminDashboardData {
  shops: {
    total: number;
    active: number;
    rented: number;
    byType: Array<{ type: ShopType; count: number }>;
  };
  personCount: number;
  bank: {
    /** Newest imported statement row: every figure here is only as fresh as
     *  this date. */
    lastTransactionDate: Date | null;
    /** Account balance carried by that newest row. */
    lastBalance: number | null;
    /** Incoming card transfers still waiting to be booked as payments. */
    pendingCardTransfers: number;
  };
  balances: Record<BalanceBucket, BucketSummary>;
  /** Units owing the most, counting every kind of charge together. */
  topDebtors: DebtorRow[];
  /** Payments and charges booked in the last `days` days. */
  recent: {
    days: number;
    paymentCount: number;
    paymentTotal: number;
    chargeCount: number;
    chargeTotal: number;
  };
}

const RECENT_DAYS = 30;
const TOP_DEBTORS = 8;

/** The rows the unregistered-payments list shows — kept identical to
 *  getBankCardTransfer so the count matches that page. */
const PENDING_CARD_TRANSFER_WHERE = {
  recieverAccount: { not: null },
  senderAccount: { not: null },
  registered: false,
  registerAble: true,
  type: "INCOME",
} as const;

async function getAdminDashboard(user: Person): Promise<AdminDashboardData> {
  if (!user) {
    throw new Error(errorMSG.unauthorized);
  }

  if (user.role !== "ADMIN" && user.role !== "MANAGER") {
    throw new Error(errorMSG.unauthorized);
  }

  const since = new Date();
  since.setDate(since.getDate() - RECENT_DAYS);

  // Postgres does the summing: two groupBy queries cover all three balance
  // lists instead of one aggregate per shop. Read-only aggregates, so no
  // transaction holds a pooled connection open.
  const [
    shops,
    chargeSums,
    paymentSums,
    personCount,
    lastTransaction,
    pendingCardTransfers,
    recentPayments,
    recentCharges,
  ] = await Promise.all([
    db.shop.findMany({
      orderBy: { plaque: "asc" },
      select: {
        id: true,
        plaque: true,
        type: true,
        isActive: true,
        ownerName: true,
        renterName: true,
        renterId: true,
      },
    }),
    db.charge.groupBy({
      by: ["shopId", "proprietor"],
      _sum: { amount: true },
    }),
    db.payment.groupBy({
      by: ["shopId", "proprietor"],
      _sum: { amount: true },
    }),
    db.person.count(),
    db.bankTransaction.findFirst({
      orderBy: { date: "desc" },
      select: { date: true, balance: true },
    }),
    db.bankTransaction.count({ where: PENDING_CARD_TRANSFER_WHERE }),
    db.payment.aggregate({
      where: { date: { gte: since } },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    db.charge.aggregate({
      where: { date: { gte: since } },
      _sum: { amount: true },
      _count: { _all: true },
    }),
  ]);

  const flatten = (
    rows: Array<{ shopId: string; proprietor: boolean; _sum: { amount: number | null } }>
  ) =>
    rows.map((row) => ({
      shopId: row.shopId,
      proprietor: row.proprietor,
      amount: row._sum.amount ?? 0,
    }));

  const { balances, topDebtors, byType } = summariseDashboard(
    shops,
    flatten(chargeSums),
    flatten(paymentSums),
    TOP_DEBTORS
  );

  return {
    shops: {
      total: shops.length,
      active: shops.filter((shop) => shop.isActive).length,
      rented: shops.filter((shop) => !!shop.renterId).length,
      byType,
    },
    personCount,
    bank: {
      lastTransactionDate: lastTransaction?.date ?? null,
      // BigInt in the column, Number here: a rial balance stays far below
      // Number.MAX_SAFE_INTEGER, and a BigInt cannot cross the server-action
      // boundary.
      lastBalance:
        lastTransaction?.balance != null
          ? Number(lastTransaction.balance)
          : null,
      pendingCardTransfers,
    },
    balances,
    topDebtors,
    recent: {
      days: RECENT_DAYS,
      paymentCount: recentPayments._count._all,
      paymentTotal: recentPayments._sum.amount ?? 0,
      chargeCount: recentCharges._count._all,
      chargeTotal: recentCharges._sum.amount ?? 0,
    },
  };
}

export default async function findAdminDashboard() {
  return handleServerAction<AdminDashboardData>((user) =>
    getAdminDashboard(user)
  );
}
