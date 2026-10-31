"use server";

import { db } from "@/lib/db";
import { adminReadAction } from "@/utils/handleServerAction";
import { successMSG } from "@/utils/messages";
import { Person, Shop } from "@prisma/client";

interface findShopsResponse {
  shops: Shop[];
  message: string;
}

async function findShops(user: Person) {
  // find Shops
  const shops = await db.shop.findMany({ orderBy: { plaque: "asc" } });

  return { message: successMSG.shopsFound, shops: shops };
}

export default async function findAllShops() {
  return adminReadAction<findShopsResponse>((user) => findShops(user));
}
