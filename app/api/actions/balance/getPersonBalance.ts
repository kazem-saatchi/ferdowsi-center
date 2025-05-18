"use server";

import { db } from "@/lib/db";
import {
  PersonBalanceByShopData,
  ShopBalanceData,
} from "@/schema/balanceSchema";
import { GetChargeByPersonData } from "@/schema/chargeSchema";
import {
  calculatePersonBalance,
  calculatePersonBalanceByShop,
  calculateShopBalance,
  PersonBalanceResponce,
  ShopBalanceResponce,
} from "@/utils/calculateBalance";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person, Charge, Payment } from "@prisma/client";

interface FindBalanceResponse {
  success: boolean;
  message: string;
  person: Person;
  personBalance: PersonBalanceResponce;
  shopsBalance?: ShopBalanceResponce[];
  personBalanceByShops?: PersonBalanceByShopData[];
}

async function getAllBalance(
  data: GetChargeByPersonData,
  user: Person
): Promise<FindBalanceResponse> {
  // Check authentication
  if (!user) {
    throw new Error(errorMSG.unauthorized);
  }


  // Extract ShopId
  const { personId } = data;

  const person = await db.person.findUnique({ where: { id: personId } });

  if (!person) {
    throw new Error(errorMSG.personNotFound);
  }

  const personBalance = await calculatePersonBalance({
    personId: person.id,
    personName: `${person.firstName} ${person.lastName}`,
  });

  //-------------Shop-Related-Person-Balance-Block-------------

  // Get Shops related to person
  const shops = await db.shop.findMany({
    where: { OR: [{ ownerId: person.id }, { renterId: person.id }] },
  });

  if (shops.length === 0) {
    throw new Error(errorMSG.shopNotFound);
  }

  // Calculate shop balance from utils
  const shopsBalance = await Promise.all(
    shops.map(
      async (shop) =>
        await calculateShopBalance({
          shopId: shop.id,
          plaque: shop.plaque,
        })
    )
  );

  //-------------Shops-Person-Balance-Block-------------

  const personBalanceByShops: PersonBalanceByShopData[] = await Promise.all(
    shops.map(async (shop) => {
      // calculate person balance from the shop
      return await calculatePersonBalanceByShop({
        personId: person.id,
        personName: person.firstName,
        shopId: shop.id,
        plaque: shop.plaque,
      });
    })
  );

  return {
    success: true,
    message: successMSG.balancesFound,
    person,
    personBalance,
    shopsBalance,
    personBalanceByShops,
  };
}

export default async function findBalanceByPerson(data: GetChargeByPersonData) {
  return handleServerAction<FindBalanceResponse>((user) =>
    getAllBalance(data, user)
  );
}
