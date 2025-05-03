"use server";

import { db } from "@/lib/db";
import { EndShopRenterData, endShopRenter } from "@/schema/shopSchema";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person } from "@prisma/client";

interface UpdateShopResponse {
  message: string;
  shopId: string;
  renterStatus: string;
}

async function updateShop(data: EndShopRenterData, user: Person) {
  if (user.role !== "ADMIN") {
    throw new Error(errorMSG.noPermission);
  }

  const validation = endShopRenter.safeParse(data);
  if (!validation.success) {
    throw new Error(validation.error.errors.map((err) => err.message).join(", "));
  }

  const shop = await db.shop.findUnique({
    where: { id: validation.data.shopId },
    select: { id: true, plaque: true, ownerId: true, ownerName: true,type: true },
  });

  if (!shop) {
    throw new Error(errorMSG.shopNotFound);
  }

  if (!shop.ownerId) {
    throw new Error(errorMSG.ownerNotFound);
  }

  const currentRentalHistory = await db.shopHistory.findFirst({
    where: {
      shopId: validation.data.shopId,
      type: "ActiveByRenter",
      endDate: null,
    },
  });

  if (!currentRentalHistory) {
    throw new Error(errorMSG.noActiveRental);
  }

  const startDate = new Date(currentRentalHistory.startDate);
  const endDate = new Date(validation.data.endDate);

  if (endDate < startDate) {
    throw new Error(errorMSG.invalidEndDate);
  }

  const currentDate = endDate.toISOString();

  const transaction = await db.$transaction(async (prisma) => {
    // Update shop's renter status
    await prisma.shop.update({
      where: { id: shop.id },
      data: { renterId: null, renterName: null },
    });

    // Close the current rental history
    await prisma.shopHistory.update({
      where: { id: currentRentalHistory.id },
      data: { endDate: currentDate },
    });

    // Add new history entry for the owner
    await prisma.shopHistory.create({
      data: {
        shopId: shop.id,
        plaque: shop.plaque,
        personId: shop.ownerId,
        personName: shop.ownerName,
        type: "ActiveByOwner",
        startDate: currentDate,
        shopType: shop.type,
      },
    });
  });

  return {
    message: successMSG.shopUpdated,
    shopId: shop.id,
    renterStatus: "Removed",
  };
}

export default async function endShopRenterId(data: EndShopRenterData) {
  return handleServerAction<UpdateShopResponse>((user) => updateShop(data, user));
}
