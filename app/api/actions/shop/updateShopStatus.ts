"use server";

import { db } from "@/lib/db";
import {
  UpdateShopStatusData,
  updateShopStatusSchema,
} from "@/schema/shopSchema";

import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person } from "@prisma/client";

interface UpdateShopResponse {
  message: string;
}

async function updateShop(data: UpdateShopStatusData, user: Person) {
  // Only admins or authorized roles can update shop status
  if (user.role !== "ADMIN") {
    throw new Error(errorMSG.noPermission);
  }

  // Validate input
  const validation = updateShopStatusSchema.safeParse(data);
  if (!validation.success) {
    throw new Error(
      validation.error.errors.map((err) => err.message).join(", ")
    );
  }

  // Find the shop
  const shop = await db.shop.findUnique({
    where: { id: validation.data.shopId },
  });

  if (!shop) {
    throw new Error(errorMSG.shopNotFound);
  }

  // Determine the current status history type based on the new status
  const currentType = validation.data.newStatus ? "deactivePeriod" : "activePeriod";
  const newType = validation.data.newStatus ? "activePeriod" : "deactivePeriod";

  // Find the current status history (active or inactive)
  const currentStatusHistory = await db.shopHistory.findFirst({
    where: {
      shopId: validation.data.shopId,
      type: currentType,
      endDate: null,
    },
  });

  // If no matching history found, throw an error
  if (!currentStatusHistory) {
    throw new Error(errorMSG.incorrectStatus);
  }

  // Validate that the end date is not earlier than the start date
  const startDate = new Date(currentStatusHistory.startDate);
  const endDate = new Date(validation.data.date);

  if (endDate < startDate) {
    throw new Error(errorMSG.invalidEndDate);
  }

  // Perform updates using a transaction
  await db.$transaction(async (prisma) => {
    // Update the shop's active status
    await prisma.shop.update({
      where: { id: validation.data.shopId },
      data: { isActive: validation.data.newStatus },
    });

    // Close the current active or inactive period
    await prisma.shopHistory.update({
      where: { id: currentStatusHistory.id },
      data: {
        endDate: endDate.toISOString(),
      },
    });

    // Add a new history record for the updated status
    await prisma.shopHistory.create({
      data: {
        shopId: shop.id,
        plaque: shop.plaque,
        personId: shop.ownerId,
        personName: shop.ownerName,
        type: newType,
        startDate: endDate.toISOString(),
      },
    });
  });

  return {
    message: successMSG.shopUpdated,
  };
}

export default async function updateShopStatus(data: UpdateShopStatusData) {
  return handleServerAction<UpdateShopResponse>((user) =>
    updateShop(data, user)
  );
}
