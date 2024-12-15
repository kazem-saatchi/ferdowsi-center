"use server";

import { db } from "@/lib/db";
import { AddShopData, addShopSchema } from "@/schema/shopSchema";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person } from "@prisma/client";

interface AddPersonResponse {
  plaque: number;
  message: string;
}

async function createShop(data: AddShopData, person: Person) {
  // Only admins or authorized roles can add new people
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

  // Check for duplicate IdNumber
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

  let renter: Person | null = null;
  if (validation.data.renterId && validation.data.renterId !== "") {
    renter = await db.person.findUnique({
      where: { id: validation.data.renterId },
    });
    if (!renter) {
      throw new Error(errorMSG.renterNotFound);
    }
  }

  const ownerName = owner.firstName + " " + owner.lastName;
  const renterName = renter ? renter.firstName + " " + renter.lastName : null;


  const newShop = await db.shop.create({
    data: {
      plaque: validation.data.plaque,
      area: validation.data.area,
      floor: validation.data.floor,
      ownerId: validation.data.ownerId,
      renterId: validation.data.renterId || null,
      ownerName: ownerName,
      renterName: renterName,
    },
  });

  return { message: successMSG.shopAdded, plaque: newShop.plaque };
}

export default async function addShop(data: AddShopData) {
  return handleServerAction<AddPersonResponse>((user) =>
    createShop(data, user)
  );
}
