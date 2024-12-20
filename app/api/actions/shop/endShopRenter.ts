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

  // Remove Shop Renter
  await db.shop.update({
    where: { id: validation.data.shopId },
    data: { renterId: null, renterName: null },
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
