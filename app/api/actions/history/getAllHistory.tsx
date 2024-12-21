"use server";

import { db } from "@/lib/db";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { ShopHistory, Person } from "@prisma/client";

interface FindHistoryResponse {
  success: boolean;
  message: string;
  histories?: ShopHistory[];
}

async function getAllHistories(user: Person): Promise<FindHistoryResponse> {
  // Check authentication
  if (!user || user.role !== "ADMIN") {
    throw new Error(errorMSG.unauthorized);
  }

  // Get ShopHistories
  const shopHistoryList = await db.shopHistory.findMany({
    orderBy: { createdAt: "desc" },
  });

  return {
    success: true,
    message: successMSG.shopHistoryFound,
    histories: shopHistoryList,
  };
}

export default async function findAllShopHistory() {
  return handleServerAction<FindHistoryResponse>((user) =>
    getAllHistories(user)
  );
}
