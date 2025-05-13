"use server";

import { db } from "@/lib/db";
import { UpdateShopInfoData, updateShopInfoSchema } from "@/schema/shopSchema";

import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person, ShopType } from "@prisma/client";

interface updateShopResponse {
  plaque: number;
  message: string;
}

async function updateShop(data: UpdateShopInfoData, user: Person) {
  // Only admins or authorized roles can update new people
  if (user.role !== "ADMIN") {
    throw new Error(errorMSG.noPermission);
  }

  // Validate input
  const validation = updateShopInfoSchema.safeParse(data);
  if (!validation.success) {
    throw new Error(
      validation.error.errors.map((err) => err.message).join(", ")
    );
  }

  // Check for duplicate IdNumber
  const updatedShop = await db.shop.update({
    where: { id: validation.data.id },
    data: {
      plaque: validation.data.plaque,
      area: validation.data.area,
      floor: validation.data.floor,
      bankCardMonthly: validation.data.bankCardMonthly,
      bankCardYearly: validation.data.bankCardYearly,
      type: validation.data.type as ShopType,
    },
  });

  return {
    message: successMSG.shopUpdated,
    plaque: updatedShop.plaque,
  };
}

export default async function updateShopInfo(data: UpdateShopInfoData) {
  return handleServerAction<updateShopResponse>((user) =>
    updateShop(data, user)
  );
}
