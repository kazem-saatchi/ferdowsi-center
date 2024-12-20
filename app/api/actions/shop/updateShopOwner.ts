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
  // Only admins or authorized roles can update the shop owner
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

  // Find new owner
  const newOwner = await db.person.findUnique({
    where: { id: validation.data.ownerId },
  });
  if (!newOwner) {
    throw new Error(errorMSG.userNotFound);
  }

  const ownerName = `${newOwner.firstName} ${newOwner.lastName}`;

  // Find the current ownership history (active ownership)
  const currentOwnershipHistory = await db.shopHistory.findFirst({
    where: { shopId: validation.data.shopId, type: "ownership", endDate: null },
  });

  if (!currentOwnershipHistory) {
    throw new Error(errorMSG.noActiveOwnership);
  }

 // Validate that the new startDate is not earlier than the current ownership's startDate
  const startDate = new Date(currentOwnershipHistory.startDate);
  const endDate = new Date(validation.data.startDate);

  if (endDate < startDate) {
    throw new Error(errorMSG.invalidEndDate);
  }

  // Update shop owner and history in a transaction
  const transaction = await db.$transaction(async (prisma) => {
    // Update shop with the new owner
    const updatedShop = await prisma.shop.update({
      where: { id: validation.data.shopId },
      data: {
        ownerId: newOwner.id,
        ownerName,
      },
    });

    // Update the end date of the current ownership record
    await prisma.shopHistory.update({
      where: { id: currentOwnershipHistory.id },
      data: {
        endDate: new Date(validation.data.startDate).toISOString(),
      },
    });

    // Add a new ownership history record for the new owner
    await prisma.shopHistory.create({
      data: {
        shopId: updatedShop.id,
        personId: newOwner.id,
        type: "ownership",
        startDate: new Date(validation.data.startDate).toISOString(),
      },
    });

    return updatedShop;
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
