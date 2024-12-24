"use server";

import { db } from "@/lib/db";
import { updateShopOwner, UpdateShopOwnerData } from "@/schema/shopSchema";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person } from "@prisma/client";

interface UpdateShopResponse {
  ownerName: string;
  message: string;
}

async function updateShop(data: UpdateShopOwnerData, user: Person) {
  if (user.role !== "ADMIN") {
    throw new Error(errorMSG.noPermission);
  }

  const validation = updateShopOwner.safeParse(data);
  if (!validation.success) {
    throw new Error(validation.error.errors.map((err) => err.message).join(", "));
  }

  const newOwner = await db.person.findUnique({
    where: { id: validation.data.ownerId },
    select: { id: true, firstName: true, lastName: true },
  });
  if (!newOwner) {
    throw new Error(errorMSG.userNotFound);
  }

  const ownerName = `${newOwner.firstName} ${newOwner.lastName}`;

  const currentOwnershipHistory = await db.shopHistory.findFirst({
    where: { shopId: validation.data.shopId, type: "Ownership", endDate: null },
  });

  if (!currentOwnershipHistory) {
    throw new Error(errorMSG.noActiveOwnership);
  }

  const activeHistory = await db.shopHistory.findFirst({
    where: {
      shopId: validation.data.shopId,
      type: { in: ["ActiveByOwner", "ActiveByRenter"] },
      endDate: null,
    },
  });

  if (!activeHistory) {
    throw new Error(errorMSG.noActiveOwnership);
  }

  const startDate = new Date(currentOwnershipHistory.startDate);
  const newStartDate = new Date(validation.data.startDate);

  if (newStartDate < startDate) {
    throw new Error(errorMSG.invalidEndDate);
  }

  const transaction = await db.$transaction(async (prisma) => {
    const updatedShop = await prisma.shop.update({
      where: { id: validation.data.shopId },
      data: {
        ownerId: newOwner.id,
        ownerName,
      },
    });

    await prisma.shopHistory.update({
      where: { id: currentOwnershipHistory.id },
      data: { endDate: newStartDate.toISOString() },
    });

    await prisma.shopHistory.create({
      data: {
        shopId: updatedShop.id,
        plaque: updatedShop.plaque,
        personId: newOwner.id,
        personName: ownerName,
        type: "Ownership",
        startDate: newStartDate.toISOString(),
      },
    });

    if (activeHistory.type === "ActiveByOwner") {
      await prisma.shopHistory.create({
        data: {
          shopId: updatedShop.id,
          plaque: updatedShop.plaque,
          personId: newOwner.id,
          personName: ownerName,
          type: "ActiveByOwner",
          startDate: newStartDate.toISOString(),
        },
      });
    }

    return updatedShop;
  });

  return {
    message: successMSG.shopUpdated,
    ownerName,
  };
}

export default async function updateShopOwnerId(data: UpdateShopOwnerData) {
  return handleServerAction<UpdateShopResponse>((user) => updateShop(data, user));
}
