"use server";

import { db } from "@/lib/db";
import { updateShopRenter, UpdateShopRenterData } from "@/schema/shopSchema";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person } from "@prisma/client";

interface UpdateShopResponse {
  renterName: string | null; // Allow null if renter is being cleared
  message: string;
}

async function updateShop(data: UpdateShopRenterData, user: Person) {
  if (user.role !== "ADMIN") {
    throw new Error(errorMSG.noPermission);
  }

  const validation = updateShopRenter.safeParse(data);
  if (!validation.success) {
    throw new Error(validation.error.errors.map((err) => err.message).join(", "));
  }

  const newRenter = validation.data.renterId
    ? await db.person.findUnique({
        where: { id: validation.data.renterId },
        select: { id: true, firstName: true, lastName: true },
      })
    : null;

  if (validation.data.renterId && !newRenter) {
    throw new Error(errorMSG.userNotFound);
  }

  const renterName = newRenter
    ? `${newRenter.firstName} ${newRenter.lastName}`
    : null;

  const newStartDate = new Date(validation.data.startDate);

  const currentRentalHistory = await db.shopHistory.findFirst({
    where: { shopId: validation.data.shopId, type: "ActiveByRenter", endDate: null },
  });

  if (currentRentalHistory) {
    const currentStartDate = new Date(currentRentalHistory.startDate);
    if (newStartDate < currentStartDate) {
      throw new Error(errorMSG.invalidEndDate);
    }
  }

  const transaction = await db.$transaction(async (prisma) => {
    const updatedShop = await prisma.shop.update({
      where: { id: validation.data.shopId },
      data: {
        renterId: newRenter?.id || null,
        renterName,
      },
    });

    if (currentRentalHistory) {
      await prisma.shopHistory.update({
        where: { id: currentRentalHistory.id },
        data: {
          endDate: newStartDate.toISOString(),
        },
      });
    }

    if (newRenter && renterName) {
      await prisma.shopHistory.create({
        data: {
          shopId: updatedShop.id,
          plaque: updatedShop.plaque,
          personId: newRenter.id,
          personName: renterName,
          type: "ActiveByRenter",
          startDate: newStartDate.toISOString(),
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
  return handleServerAction<UpdateShopResponse>((user) => updateShop(data, user));
}
