"use server";

import { db } from "@/lib/db";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person } from "@prisma/client";

interface findPersonByShopResponse {
  persons: Person[];
  message: string;
}

async function findPerson(shopId: string, user: Person) {
  // check authentication
  if (!user) {
    throw new Error(errorMSG.unauthorized);
  }

  // find Person by Id
  const shop = await db.shop.findUnique({
    where: { id: shopId },
    include: {
      owner: true,
      renter: true,
      histories: true && { include: { person: true } },
    },
  });

  if (!shop) {
    throw new Error(errorMSG.shopNotFound);
  }

  const personsSet = new Set<Person>();

  // Add owners
  if (shop.owner) {
    personsSet.add(shop.owner);
  }

  // Add renters
  if (shop.renter) {
    personsSet.add(shop.renter);
  }

  // Add persons from ShopHistory
  if (shop.histories) {
    shop.histories.forEach((history) => {
      if (history.person) {
        personsSet.add(history.person);
      }
    });
  }

  // Convert Set to Array (to remove duplicates)
  const persons = Array.from(personsSet);

  return { message: successMSG.personsFound, persons };
}

export default async function findPersonByShop(shopId: string) {
  return handleServerAction<findPersonByShopResponse>((user) =>
    findPerson(shopId, user)
  );
}
