"use server";

import { db } from "@/lib/db";
import { PersonBalanceData, ShopBalanceData } from "@/schema/balanceSchema";
import { GetChargeByShopData } from "@/schema/chargeSchema";
import {
  calculatePersonBalanceByShop,
  calculateShopBalance,
} from "@/utils/calculateBalance";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person, Charge, Payment } from "@prisma/client";

interface FindBalanceResponse {
  success: boolean;
  message: string;
  charges?: Charge[];
  payments?: Payment[];
  shopBalance?: ShopBalanceData;
  personsBalance?: PersonBalanceData[];
}

async function getAllBalance(
  data: GetChargeByShopData,
  user: Person
): Promise<FindBalanceResponse> {
  // Check authentication
  if (!user || user.role !== "ADMIN") {
    throw new Error(errorMSG.unauthorized);
  }

  // Extract ShopId
  const { shopId } = data;

  //-------------Shop-Total-Balance-Block-------------

  // Get Shop
  const shop = await db.shop.findUnique({ where: { id: shopId } });

  if (!shop) {
    throw new Error(errorMSG.shopNotFound);
  }

  // Calculate shop balance from utils
  const { chargeList, paymentList, shopBalance } = await calculateShopBalance({
    shopId,
    plaque: shop.plaque,
  });

  //-------------Shop-Persons-Balance-Block-------------

  const uniquePersonIds = await db.charge.findMany({
    where: { shopId }, // Filter charges for the specific shop
    select: { personId: true, personName: true }, // Select only the personId and personName field
    distinct: ["personId"], // Ensure personId is unique
  });

  const personsBalance: PersonBalanceData[] = await Promise.all(
    uniquePersonIds.map(async (person) => {
      // calculate person balance from the shop
      return await calculatePersonBalanceByShop({
        personId: person.personId,
        personName: person.personName,
        shopId,
        plaque: shop.plaque,
      });
    })
  );

  return {
    success: true,
    message: successMSG.chargesFound,
    charges: chargeList,
    payments: paymentList,
    shopBalance,
    personsBalance,
  };
}

export default async function findBalanceByShop(data: GetChargeByShopData) {
  return handleServerAction<FindBalanceResponse>((user) =>
    getAllBalance(data, user)
  );
}
