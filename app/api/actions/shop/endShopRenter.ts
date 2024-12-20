"use server";

import { db } from "@/lib/db";
import {
  updateShopRenter,
  EndShopRenterData,
  endShopRenter,
} from "@/schema/shopSchema";

import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person } from "@prisma/client";

interface updateShopResponse {
  message: string;
}

async function updateShop(data: EndShopRenterData, user: Person) {
  // Only admins or authorized roles can update new people
  if (user.role !== "ADMIN") {
    throw new Error(errorMSG.noPermission);
  }

  // Validate input
  const validation = endShopRenter.safeParse(data);
  if (!validation.success) {
    throw new Error(
      validation.error.errors.map((err) => err.message).join(", ")
    );
  }

  // Find Shop
  const shop = await db.shop.findUnique({
    where: { id: validation.data.shopId },
  });

  if (!shop) {
    throw new Error(errorMSG.shopNotFound);
  }

  // Find the current rental history (if any) for this shop
  const currentRentalHistory = await db.shopHistory.findFirst({
    where: { shopId: validation.data.shopId, type: "rental", endDate: null },
  });

  if (!currentRentalHistory) {
    throw new Error(errorMSG.noActiveRental);
  }

    // Validate that the endDate is not earlier than the startDate of the rental
    const startDate = new Date(currentRentalHistory.startDate);
    const endDate = new Date(validation.data.endDate);
  
    if (endDate < startDate) {
      throw new Error(errorMSG.invalidEndDate);
    }

  // Perform updates using a transaction
  const transaction = await db.$transaction(async (prisma) => {
    // Remove Shop Renter
    await prisma.shop.update({
      where: { id: validation.data.shopId },
      data: { renterId: null, renterName: null },
    });

    // Close the current rental history if it exists
    if (currentRentalHistory) {
      await prisma.shopHistory.update({
        where: { id: currentRentalHistory.id },
        data: {
          endDate: new Date(validation.data.endDate).toISOString(),
        },
      });
    }
  });

  return {
    message: successMSG.shopUpdated,
  };
}

export default async function endShopRenterId(data: EndShopRenterData) {
  return handleServerAction<updateShopResponse>((user) =>
    updateShop(data, user)
  );
}
