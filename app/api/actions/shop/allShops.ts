"use server";

import { db } from "@/lib/db";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person, Shop } from "@prisma/client";

interface findShopsResponse {
  shops: Shop[];
  message: string;
}

async function findShops(user: Person) {
  // check authentication
  if ( user.role !== "ADMIN" && user.role !== "MANAGER") {
    throw new Error(errorMSG.unauthorized);
  }

  // find Shops
  const shops = await db.shop.findMany({ orderBy: { plaque: "asc" } });

  return { message: successMSG.shopsFound, shops: shops };
}

export default async function findAllShops() {
  return handleServerAction<findShopsResponse>((user) => findShops(user));
}
