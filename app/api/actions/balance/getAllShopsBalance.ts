"use server";

import { ShopsBalanceData } from "@/schema/balanceSchema";
import { calculateAllShopMonthlyBalance } from "@/utils/calculateBalance";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person } from "@prisma/client";

interface FindBalanceResponse {
  success: boolean;
  message: string;
  shopsBalance?: ShopsBalanceData[];
  totalCount?: number;
}

async function getAllShopsBalance(
  user: Person,
  propreitor: boolean,
  skip?: number,
  take?: number
): Promise<FindBalanceResponse> {
  // Check authentication
  if (!user) {
    throw new Error(errorMSG.unauthorized);
  }

  if (user?.role !== "ADMIN" && user?.role !== "MANAGER") {
    throw new Error(errorMSG.unauthorized);
  }
  // Calculate balances for all shops
  const { results, totalCount } = await calculateAllShopMonthlyBalance(
    propreitor,
    skip,
    take
  );

  console.log(
    "shops balance from server action",
    results,
    "total:",
    totalCount
  );

  return {
    success: true,
    message: successMSG.balancesFound,
    shopsBalance: results,
    totalCount,
  };
}

export default async function findBalanceAllShops(
  propreitor: boolean,
  skip?: number,
  take?: number
) {
  return handleServerAction<FindBalanceResponse>((user) =>
    getAllShopsBalance(user, propreitor, skip, take)
  );
}
