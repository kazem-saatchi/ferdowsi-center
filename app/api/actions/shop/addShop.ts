"use server";

import { db } from "@/lib/db";
import { AddShopData, addShopSchema } from "@/schema/shopSchema";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person } from "@prisma/client";
import { Prisma } from "@prisma/client";

interface AddPersonResponse {
  plaque: number;
  message: string;
}

async function createShop(data: AddShopData, person: Person) {
  // Only admins or authorized roles can add new shops
  if (person.role !== "ADMIN") {
    throw new Error(errorMSG.noPermission);
  }

  // Validate input
  const validation = addShopSchema.safeParse(data);
  if (!validation.success) {
    throw new Error(
      validation.error.errors.map((err) => err.message).join(", ")
    );
  }

  // Check for duplicate plaque
  const existingShop = await db.shop.findUnique({
    where: { plaque: validation.data.plaque },
  });
  if (existingShop) {
    throw new Error(errorMSG.duplicatePlaque);
  }

  // Find owner
  const owner = await db.person.findUnique({
    where: { id: validation.data.ownerId },
  });
  if (!owner) {
    throw new Error(errorMSG.ownerNotFound);
  }

  // Find renter if specified
  let renter: Person | null = null;
  if (validation.data.renterId) {
    renter = await db.person.findUnique({
      where: { id: validation.data.renterId },
    });
    if (!renter) {
      throw new Error(errorMSG.renterNotFound);
    }
  }

  // Create shop and history entries in a transaction
  const transaction = await db.$transaction(async (prisma) => {
    const newShop = await prisma.shop.create({
      data: {
        plaque: validation.data.plaque,
        area: validation.data.area,
        floor: validation.data.floor,
        ownerId: validation.data.ownerId,
        renterId: validation.data.renterId || null,
        ownerName: `${owner.firstName} ${owner.lastName}`,
        renterName: renter ? `${renter.firstName} ${renter.lastName}` : null,
      },
    });

    const historyEntries: Prisma.ShopHistoryCreateManyInput[] = [
      {
        shopId: newShop.id,
        plaque: newShop.plaque,
        personId: newShop.ownerId,
        personName: newShop.ownerName,
        type: "ownership",
        startDate: new Date().toISOString(),
      },
      {
        shopId: newShop.id,
        plaque: newShop.plaque,
        personId: newShop.ownerId,
        personName: newShop.ownerName,
        type: "activePeriod",
        startDate: new Date().toISOString(),
      },
    ];

    if (newShop.renterId && newShop.renterName) {
      historyEntries.push({
        shopId: newShop.id,
        plaque: newShop.plaque,
        personId: newShop.renterId,
        personName: newShop.renterName,
        type: "rental",
        startDate: new Date().toISOString(),
      });
    }

    await prisma.shopHistory.createMany({
      data: historyEntries,
    });

    return newShop;
  });

  return { message: successMSG.shopAdded, plaque: transaction.plaque };
}

export default async function addShop(data: AddShopData) {
  return handleServerAction<AddPersonResponse>((user) =>
    createShop(data, user)
  );
}
