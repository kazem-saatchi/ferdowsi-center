"use server";

import { db } from "@/lib/db";
import { AddShopData, addShopSchema } from "@/schema/shopSchema";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person, Prisma, ShopType } from "@prisma/client";

interface AddShopResponse {
  shopId: string;
  plaque: number;
  message: string;
}

async function createShop(data: AddShopData, person: Person) {
  if (person.role !== "ADMIN") {
    throw new Error(errorMSG.noPermission);
  }

  const validation = addShopSchema.safeParse(data);
  if (!validation.success) {
    throw new Error(
      validation.error.errors.map((err) => err.message).join(", ")
    );
  }

  // a constant date for all shop start date
  const currentDate = "2024-01-01T00:00:00.000Z";

  const existingShop = await db.shop.findUnique({
    where: { plaque: validation.data.plaque },
    select: { id: true },
  });
  if (existingShop) {
    throw new Error(errorMSG.duplicatePlaque);
  }

  const owner = await db.person.findUnique({
    where: { id: validation.data.ownerId },
    select: { firstName: true, lastName: true },
  });
  if (!owner) {
    throw new Error(errorMSG.ownerNotFound);
  }

  let renter = null;
  if (validation.data.renterId) {
    renter = await db.person.findUnique({
      where: { id: validation.data.renterId },
      select: { firstName: true, lastName: true },
    });
    if (!renter) {
      throw new Error(errorMSG.renterNotFound);
    }
  }

  const transaction = await db.$transaction(async (prisma) => {
    const newShop = await prisma.shop.create({
      data: {
        plaque: validation.data.plaque,
        area: validation.data.area,
        floor: validation.data.floor,
        type: validation.data.type as ShopType,
        ownerId: validation.data.ownerId,
        renterId: validation.data.renterId || null,
        ownerName: `${owner.firstName} ${owner.lastName}`,
        renterName: renter ? `${renter.firstName} ${renter.lastName}` : null,
        bankCardMonthly:validation.data.bankCardMonthly,
        bankCardYearly:validation.data.bankCardYearly,
      },
    });

    const historyEntries: Prisma.ShopHistoryCreateManyInput[] = [
      {
        shopId: newShop.id,
        plaque: newShop.plaque,
        personId: newShop.ownerId,
        personName: newShop.ownerName,
        type: "Ownership",
        startDate: currentDate,
        shopType: newShop.type,
      },
      {
        shopId: newShop.id,
        plaque: newShop.plaque,
        personId: newShop.renterId || newShop.ownerId,
        personName: newShop.renterName || newShop.ownerName,
        type: newShop.renterId ? "ActiveByRenter" : "ActiveByOwner",
        startDate: currentDate,
        shopType: newShop.type,
      },
    ];

    await prisma.shopHistory.createMany({
      data: historyEntries,
    });

    return newShop;
  });

  return {
    shopId: transaction.id,
    plaque: transaction.plaque,
    message: successMSG.shopAdded,
  };
}

export default async function addShop(data: AddShopData) {
  return handleServerAction<AddShopResponse>((user) => createShop(data, user));
}
