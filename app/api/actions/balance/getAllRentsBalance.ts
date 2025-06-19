"use server";

import { ShopsBalanceData } from "@/schema/balanceSchema";
import { calculateAllRentsBalance } from "@/utils/calculateBalance";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person } from "@prisma/client";

interface FindBalanceResponse {
  success: boolean;
  message: string;
  shopsBalance?: ShopsBalanceData[];
}

async function getAllRentsBalance(user: Person): Promise<FindBalanceResponse> {
  if (!user) {
    throw new Error(errorMSG.unauthorized);
  }

  if (user?.role !== "ADMIN" && user?.role !== "MANAGER") {
    throw new Error(errorMSG.unauthorized);
  }

  const shopsBalance: ShopsBalanceData[] = await calculateAllRentsBalance();

  console.log("shops balance from server action", shopsBalance);

  return {
    success: true,
    message: successMSG.balancesFound,
    shopsBalance,
  };
}

export default async function findRentBalanceAllShops() {
  return handleServerAction<FindBalanceResponse>((user) =>
    getAllRentsBalance(user)
  );
}
