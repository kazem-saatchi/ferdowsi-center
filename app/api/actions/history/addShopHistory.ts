"use server";

import { db } from "@/lib/db";
import { AddShopHistoryData, addShopHistorySchema } from "@/schema/shopSchema";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { ShopHistory, Person } from "@prisma/client";

interface AddHistoryResponse {
  success: boolean;
  message: string;
}

async function addShopHistoryEntry(
  historyData: AddShopHistoryData,
  user: Person
): Promise<AddHistoryResponse> {
  // Check authentication
  if (!user || user.role !== "ADMIN") {
    throw new Error(errorMSG.unauthorized);
  }

  // Validate input
  const validation = addShopHistorySchema.safeParse(historyData);
  if (!validation.success) {
    throw new Error(
      validation.error.errors.map((err) => err.message).join(", ")
    );
  }

  // Extract validated data
  const { shopId, personId, type, startDate, endDate } = validation.data;

  // Ensure shop and person exist
  const shop = await db.shop.findUnique({ where: { id: shopId } });
  if (!shop) {
    throw new Error(errorMSG.shopNotFound);
  }

  const person = await db.person.findUnique({ where: { id: personId } });
  if (!person) {
    throw new Error(errorMSG.personNotFound);
  }

  // Create ShopHistory entry
  await db.shopHistory.create({
    data: {
      plaque: shop.plaque,
      personName: `${person.firstName} ${person.lastName}`,
      type,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      // shopId:shop.id,
      // personId:person.id,
      shop: { connect: { id: shop.id } },
      person: { connect: { id: person.id } },
      shopType:shop.type,
    },
  });

  return { success: true, message: successMSG.shopHistoryAdded };
}

export default async function addShopHistory(historyData: AddShopHistoryData) {
  return handleServerAction<AddHistoryResponse>((user) =>
    addShopHistoryEntry(historyData, user)
  );
}
