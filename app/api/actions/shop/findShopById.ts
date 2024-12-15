"use server";

import { db } from "@/lib/db";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person, Shop } from "@prisma/client";

interface findShopResponse {
  shop: Shop;
  message: string;
}

async function findShop(id: string, user: Person) {
  // check authentication
  if (!user) {
    throw new Error(errorMSG.unauthorized);
  }

  // find Shop by Id
  const shop = await db.shop.findUnique({
    where: { id },
  });
  if (!shop) {
    throw new Error(errorMSG.shopIdNotFound);
  }

  return { message: successMSG.shopIdFound, shop: shop };
}

export default async function findShopById(id: string) {
  return handleServerAction<findShopResponse>((user) => findShop(id, user));
}
