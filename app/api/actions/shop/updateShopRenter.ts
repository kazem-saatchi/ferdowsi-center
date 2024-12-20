"use server";

import { db } from "@/lib/db";
import { updateShopRenter, UpdateShopRenterData } from "@/schema/shopSchema";

import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person } from "@prisma/client";

interface updateShopResponse {
  renterName: string;
  message: string;
}

async function updateShop(data: UpdateShopRenterData, user: Person) {
  // Only admins or authorized roles can update new people
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

  // Find New Renter
  const newRenter = await db.person.findUnique({
    where: { id: validation.data.renterId },
  });

  if (!newRenter) {
    throw new Error(errorMSG.userNotFound);
  }

  const renterName = newRenter.firstName + " " + newRenter.lastName;

  // Update Shop Renter
  const updatedShop = await db.shop.update({
    where: { id: validation.data.shopId },
    data: {
      renterId: newRenter.id,
      renterName,
    },
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
