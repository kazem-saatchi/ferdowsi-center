"use server";

import { db } from "@/lib/db";
import { ShopBalanceData, ShopsBalanceData } from "@/schema/balanceSchema";
import {
  calculateAllShopMonthlyBalance,
  calculateShopBalance,
} from "@/utils/calculateBalance";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person } from "@prisma/client";

interface FindBalanceResponse {
  success: boolean;
  message: string;
  shopsBalance?: ShopsBalanceData[];
}

async function getAllShopsBalance(user: Person,propreitor:boolean): Promise<FindBalanceResponse> {
  // Check authentication
  if (!user || user.role !== "ADMIN") {
    throw new Error(errorMSG.unauthorized);
  }
  // Calculate balances for all shops
  const shopsBalance: ShopsBalanceData[] =
    await calculateAllShopMonthlyBalance(propreitor);

  console.log("shops balance from server action", shopsBalance);

  return {
    success: true,
    message: successMSG.balancesFound,
    shopsBalance,
  };
}

export default async function findBalanceAllShops(propreitor:boolean) {
  return handleServerAction<FindBalanceResponse>((user) =>
    getAllShopsBalance(user,propreitor)
  );
}
