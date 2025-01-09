"use server";

import { db } from "@/lib/db";
import { PersonBalanceData } from "@/schema/balanceSchema";
import {
  calculatePersonBalanceByShop,
  calculateShopBalance,
  ShopBalanceResponce,
} from "@/utils/calculateBalance";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person, Shop } from "@prisma/client";

interface PersonBalancesResponse {
  shops: Shop[];
  message: string;
  shopsBalance: ShopBalanceResponce[];
  shopsBalanceByPerson: PersonBalanceData[];
}

async function findBalances(user: Person): Promise<PersonBalancesResponse> {
  // check authentication
  if (!user) {
    throw new Error(errorMSG.unauthorized);
  }

  // find Shops Related to a person
  const shops = await db.shop.findMany({
    where: { ownerId: user.id, OR: [{ renterId: user.id }] },
  });

  if (!shops) {
    throw new Error(errorMSG.shopIdNotFound);
  }

  const shopsBalance: ShopBalanceResponce[] = await Promise.all(
    shops.map(async (shop) =>
      calculateShopBalance({
        shopId: shop.id,
        plaque: shop.plaque,
      })
    )
  );

  const shopsBalanceByPerson: PersonBalanceData[] = await Promise.all(
    shops.map((shop) =>
      calculatePersonBalanceByShop({
        personId: user.id,
        personName: `${user.firstName} ${user.lastName}`,
        shopId: shop.id,
      })
    )
  );

  return {
    message: successMSG.shopsFound,
    shops: shops,
    shopsBalance,
    shopsBalanceByPerson,
  };
}

export default async function getBalancesByPerson() {
  return handleServerAction<PersonBalancesResponse>((user) =>
    findBalances(user)
  );
}
