"use server";

import { db } from "@/lib/db";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person, Shop } from "@prisma/client";

interface findShopResponse {
  shops: Shop[];
  message: string;
}

async function findShop(user: Person) {
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

  return { message: successMSG.shopIdFound, shops: shops };
}

export default async function findShopById() {
  return handleServerAction<findShopResponse>((user) => findShop(user));
}
