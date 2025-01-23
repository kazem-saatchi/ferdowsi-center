"use server";

import { db } from "@/lib/db";
import { ShopBalanceData } from "@/schema/balanceSchema";
import { calculateShopBalance } from "@/utils/calculateBalance";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person } from "@prisma/client";

interface FindBalanceResponse {
  success: boolean;
  message: string;
  shopsBalance?: ShopBalanceData[];
}

async function getAllShopsBalance(user: Person): Promise<FindBalanceResponse> {
  // Check authentication
  if (!user || user.role !== "ADMIN") {
    throw new Error(errorMSG.unauthorized);
  }

  // Get all shops
  const shops = await db.shop.findMany();

  // Calculate balances for all shops
  const shopsBalance: ShopBalanceData[] = await Promise.all(
    shops.map(async (shop) => {
      const { shopBalance } = await calculateShopBalance({
        shopId: shop.id,
        plaque: shop.plaque,
      });

      return shopBalance;
    })
  );

  return {
    success: true,
    message: successMSG.balancesFound,
    shopsBalance,
  };
}

export default async function findBalanceAllShops() {
  return handleServerAction<FindBalanceResponse>((user) =>
    getAllShopsBalance(user)
  );
}
