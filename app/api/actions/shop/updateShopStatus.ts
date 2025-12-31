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
  // Only admins can update shop status
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

  // Extract validated data
  const { shopId, newStatus, date } = validation.data;
  const newStartDate = new Date(date);

  // Find the shop
  const shop = await db.shop.findUnique({
    where: { id: shopId },
    select: {
      id: true,
      plaque: true,
      ownerId: true,
      ownerName: true,
      renterId: true,
      isActive: true,
      type: true,
    },
  });

  if (!shop) {
    throw new Error(errorMSG.shopNotFound);
  }

  // Determine current and new history types
  const isActivating = newStatus === "ACTIVATE";
  const currentType = isActivating
    ? "InActive"
    : shop.renterId
    ? "ActiveByRenter"
    : "ActiveByOwner";
  const newType = isActivating ? "ActiveByOwner" : "InActive";

  // Find the current status history
  const currentStatusHistory = await db.shopHistory.findFirst({
    where: { shopId, type: currentType, endDate: null },
  });

  if (!currentStatusHistory) {
    throw new Error(errorMSG.incorrectStatus);
  }

  // Validate dates
  const startDate = new Date(currentStatusHistory.startDate);
  if (newStartDate < startDate) {
    throw new Error(errorMSG.invalidEndDate);
  }

  // Perform updates within a transaction
  await db.$transaction(async (prisma) => {
    // Update shop's active status and renter information
    await prisma.shop.update({
      where: { id: shopId },
      data: {
        isActive: isActivating,
        renterId: null, // Clear renter on inactivation
        renterName: null,
      },
    });

    // Close the current status history
    await prisma.shopHistory.update({
      where: { id: currentStatusHistory.id },
      data: {
        endDate: newStartDate.toISOString(),
        isActive: false,
      },
    });

    // Add a new history entry for the updated status
    await prisma.shopHistory.create({
      data: {
        shopId: shop.id,
        plaque: shop.plaque,
        personId: shop.ownerId, // Always associate with the owner
        personName: shop.ownerName,
        type: newType,
        startDate: newStartDate.toISOString(),
        isActive: isActivating,
        shopType: shop.type,
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
