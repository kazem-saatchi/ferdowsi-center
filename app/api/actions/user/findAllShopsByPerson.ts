"use server";

import { db } from "@/lib/db";
import { PersonBalanceByShopData } from "@/schema/balanceSchema";
import {
  calculatePersonBalanceByShop,
  calculateShopBalance,
  ShopBalanceResponce,
} from "@/utils/calculateBalance";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person, Shop } from "@prisma/client";

export interface PersonBalancesResponse {
  shopsOwned: Shop[];
  shopsRented: Shop[];
  message: string;
  shopsBalance: ShopBalanceResponce[];
  shopsBalanceByPerson: PersonBalanceByShopData[];
}

async function findAllShops(user: Person): Promise<PersonBalancesResponse> {
  // check authentication
  if (!user) {
    throw new Error(errorMSG.unauthorized);
  }

  // Find shops related to a person (either owned or rented)
  // const shops = await db.shop.findMany({
  //   where: {
  //     OR: [
  //       { ownerId: user.id }, // Owned by the user
  //       { renterId: user.id }, // Rented by the user
  //     ],
  //   },
  // });

  // if (!shops) {
  //   throw new Error(errorMSG.shopIdNotFound);
  // }

  const shopsOwned = await db.shop.findMany({
    where: { ownerId: user.id }, // Owned by the user
  });

  const shopsRented = await db.shop.findMany({
    where: { renterId: user.id }, // Owned by the user
  });

  const shopsOwnedBalance: ShopBalanceResponce[] = await Promise.all(
    shopsOwned.map(async (shop) =>
      calculateShopBalance({
        shopId: shop.id,
        plaque: shop.plaque,
      })
    )
  );

  const shopsRentedBalance: ShopBalanceResponce[] = await Promise.all(
    shopsRented.map(async (shop) =>
      calculateShopBalance({
        shopId: shop.id,
        plaque: shop.plaque,
      })
    )
  );

  const shopsBalanceByPerson: PersonBalanceByShopData[] = await Promise.all(
    [...shopsOwned, ...shopsRented].map((shop) =>
      calculatePersonBalanceByShop({
        personId: user.id,
        personName: `${user.firstName} ${user.lastName}`,
        shopId: shop.id,
        plaque: shop.plaque,
      })
    )
  );

  return {
    message: successMSG.shopsFound,
    shopsOwned,
    shopsRented,
    shopsBalance: [...shopsOwnedBalance, ...shopsRentedBalance],
    shopsBalanceByPerson,
  };
}

export default async function findAllShopsByPerson() {
  return handleServerAction<PersonBalancesResponse>((user) =>
    findAllShops(user)
  );
}
