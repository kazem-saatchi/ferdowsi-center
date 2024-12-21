"use server";

import { db } from "@/lib/db";
import { updateShopRenter, UpdateShopRenterData } from "@/schema/shopSchema";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person } from "@prisma/client";

interface updateShopResponse {
  renterName: string | null; // Allow null if renter is being cleared
  message: string;
}

async function updateShop(data: UpdateShopRenterData, user: Person) {
  // Only admins or authorized roles can update the shop renter
  if (user.role !== "ADMIN") {
    throw new Error(errorMSG.noPermission);
  }

  // Validate input
  const validation = updateShopRenter.safeParse(data);
  if (!validation.success) {
    throw new Error(
      validation.error.errors.map((err) => err.message).join(", ")
    );
  }

  // Check for the new renter by renterId (if not null)
  const newRenter = await db.person.findUnique({
    where: { id: validation.data.renterId },
  });

  // If renterId is provided but not found, throw an error
  if (validation.data.renterId && !newRenter) {
    throw new Error(errorMSG.userNotFound);
  }

  const renterName = newRenter
    ? `${newRenter.firstName} ${newRenter.lastName}`
    : null;

  // Find the current rental history (if any) for this shop
  const currentRentalHistory = await db.shopHistory.findFirst({
    where: { shopId: validation.data.shopId, type: "rental", endDate: null },
  });

  if (currentRentalHistory) {
    // Validate that the new startDate is not earlier than the current rental's startDate
    const startDate = new Date(currentRentalHistory.startDate);
    const endDate = new Date(validation.data.startDate);

    if (endDate < startDate) {
      throw new Error(errorMSG.invalidEndDate);
    }
  }

  // Perform updates using a transaction
  const transaction = await db.$transaction(async (prisma) => {
    // Update the shop with the new renter information
    const updatedShop = await prisma.shop.update({
      where: { id: validation.data.shopId },
      data: {
        renterId: newRenter?.id || null,
        renterName,
      },
    });

    // Close the current rental history if it exists
    if (currentRentalHistory) {
      await prisma.shopHistory.update({
        where: { id: currentRentalHistory.id },
        data: {
          endDate: new Date(validation.data.startDate).toISOString(),
        },
      });
    }

    // Create a new rental history entry if there’s a new renter
    if (newRenter && renterName) {
      await prisma.shopHistory.create({
        data: {
          shopId: updatedShop.id,
          plaque:updatedShop.plaque,
          personId: newRenter.id,
          personName:renterName,
          type: "rental",
          startDate: new Date(validation.data.startDate).toISOString(),
        },
      });
    }

    return updatedShop;
  });

  return {
    message: successMSG.shopUpdated,
    renterName,
  };
}

export default async function updateShopRenterId(data: UpdateShopRenterData) {
  return handleServerAction<updateShopResponse>((user) =>
    updateShop(data, user)
  );
}
