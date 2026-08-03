"use server";

import { ShopBalanceDetails } from "@/schema/balanceSchema";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person, ShopType } from "@prisma/client";
import { db } from "@/lib/db";

interface FindAllShopsBalanceResponse {
  success: boolean;
  message: string;
  shopsData: ShopBalanceDetails[];
  totalCount: number;
}

// KIOSK pays a monthly charge AND a proprietor charge, on a different cadence
// than STORE/OFFICE (which pay proprietor once a year). It is included in both
// views for now; where it really belongs is still an open question.
const BALANCE_SHOP_TYPES: ShopType[] = ["STORE", "OFFICE", "KIOSK"];

async function getAllShopsBalance(
  user: Person,
  proprietor: boolean
): Promise<FindAllShopsBalanceResponse> {
  if (!user) {
    throw new Error(errorMSG.unauthorized);
  }

  if (user.role !== "ADMIN" && user.role !== "MANAGER") {
    throw new Error(errorMSG.unauthorized);
  }

  const shopWhere = { type: { in: BALANCE_SHOP_TYPES } };

  // Three queries for every shop, not two per shop. Postgres does the summing,
  // so we ship one row per (shop, person) pair instead of one row per charge.
  // These are read-only aggregates: no transaction, so no pooled connection is
  // held open while the batch runs.
  const [shops, chargeSums, paymentSums] = await Promise.all([
    db.shop.findMany({
      where: shopWhere,
      orderBy: { plaque: "asc" },
      select: {
        id: true,
        plaque: true,
        ownerName: true,
        renterName: true,
        renterId: true,
      },
    }),
    db.charge.groupBy({
      by: ["shopId", "personId"],
      where: { proprietor, shop: shopWhere },
      _sum: { amount: true },
    }),
    db.payment.groupBy({
      by: ["shopId", "personId"],
      where: { proprietor, shop: shopWhere },
      _sum: { amount: true },
    }),
  ]);

  const totals = new Map(
    shops.map((shop) => [
      shop.id,
      {
        renterId: shop.renterId,
        charge: 0,
        payment: 0,
        renterCharge: 0,
        renterPayment: 0,
      },
    ])
  );

  for (const row of chargeSums) {
    const shopTotals = totals.get(row.shopId);
    if (!shopTotals) continue;
    const amount = row._sum.amount ?? 0;
    shopTotals.charge += amount;
    if (shopTotals.renterId && row.personId === shopTotals.renterId) {
      shopTotals.renterCharge += amount;
    }
  }

  for (const row of paymentSums) {
    const shopTotals = totals.get(row.shopId);
    if (!shopTotals) continue;
    const amount = row._sum.amount ?? 0;
    shopTotals.payment += amount;
    if (shopTotals.renterId && row.personId === shopTotals.renterId) {
      shopTotals.renterPayment += amount;
    }
  }

  const shopsData: ShopBalanceDetails[] = shops.map((shop) => {
    const shopTotals = totals.get(shop.id)!;
    const { charge, payment, renterCharge, renterPayment } = shopTotals;

    return {
      plaque: shop.plaque,
      ownerName: shop.ownerName,
      renterName: shop.renterName,
      totalBalance: payment - charge,
      // Debt follows the shop: anything not booked to the CURRENT renter is the
      // owner's, including a departed renter's arrears and a previous owner's.
      ownerBalance: payment - renterPayment - (charge - renterCharge),
      renterBalance: shop.renterId ? renterPayment - renterCharge : 0,
    };
  });

  return {
    success: true,
    message: successMSG.balancesFound,
    shopsData,
    totalCount: shopsData.length,
  };
}

export default async function findBalanceAllShops(proprietor: boolean) {
  return handleServerAction<FindAllShopsBalanceResponse>((user) =>
    getAllShopsBalance(user, proprietor)
  );
}
