"use server";

import { db } from "@/lib/db";
import { GetChargeByShopData } from "@/schema/chargeSchema";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person } from "@prisma/client";

interface FindBalanceResponse {
  success: boolean;
  message: string;
  shopsBalance?: ShopBalance[];
}

interface ShopBalance {
  plaque: number;
  totalCharge: number;
  totalPayment: number;
}

async function getAllShopsBalance(
  
  user: Person
): Promise<FindBalanceResponse> {
  // Check authentication
  if (!user || user.role !== "ADMIN") {
    throw new Error(errorMSG.unauthorized);
  }

  // Get all shops
  const shops = await db.shop.findMany();

  // Calculate balances for all shops
  const shopsBalance: ShopBalance[] = await Promise.all(
    shops.map(async (shop) => {
      // Fetch charges and payments for the shop
      const [chargeList, paymentList] = await Promise.all([
        db.charge.findMany({
          where: { shopId: shop.id },
          orderBy: [{ date: "desc" }],
        }),
        db.payment.findMany({
          where: { shopId: shop.id },
          orderBy: { date: "desc" },
        }),
      ]);

      // Calculate totals
      const totalCharge = chargeList.reduce(
        (total, charge) => total + charge.amount,
        0
      );

      const totalPayment = paymentList.reduce(
        (total, payment) => total + payment.amount,
        0
      );

      return {
        plaque: shop.plaque,
        totalCharge,
        totalPayment,
      };
    })
  );

  return {
    success: true,
    message: successMSG.chargesFound,
    shopsBalance,
  };
}

export default async function findBalanceAllShops() {
  return handleServerAction<FindBalanceResponse>((user) =>
    getAllShopsBalance( user)
  );
}
