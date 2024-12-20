"use server";

import { db } from "@/lib/db";
import { updateShopOwner, UpdateShopOwnerData } from "@/schema/shopSchema";

import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person } from "@prisma/client";

interface updateShopResponse {
  ownerName: string;
  message: string;
}

async function updateShop(data: UpdateShopOwnerData, user: Person) {
  // Only admins or authorized roles can update new people
  if (user.role !== "ADMIN") {
    throw new Error(errorMSG.noPermission);
  }

  // Validate input
  const validation = updateShopOwner.safeParse(data);
  if (!validation.success) {
    throw new Error(
      validation.error.errors.map((err) => err.message).join(", ")
    );
  }

  // Find New Owner
  const newOwner = await db.person.findUnique({
    where: { id: validation.data.ownerId },
  });

  if (!newOwner) {
    throw new Error(errorMSG.userNotFound);
  }

  const ownerName = newOwner.firstName + " " + newOwner.lastName;

  // Update Shop Owner
  const updatedShop = await db.shop.update({
    where: { id: validation.data.shopId },
    data: {
      ownerId: newOwner.id,
      ownerName,
    },
  });

  return {
    message: successMSG.shopUpdated,
    ownerName,
  };
}

export default async function updateShopOwnerId(data: UpdateShopOwnerData) {
  return handleServerAction<updateShopResponse>((user) =>
    updateShop(data, user)
  );
}
