"use server";

import { db } from "@/lib/db";
import { adminReadAction } from "@/utils/handleServerAction";
import { successMSG } from "@/utils/messages";
import { ShopHistory, Person } from "@prisma/client";

interface FindHistoryResponse {
  success: boolean;
  message: string;
  histories?: ShopHistory[];
}

async function getAllHistories(user: Person): Promise<FindHistoryResponse> {
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
  return adminReadAction<FindHistoryResponse>((user) =>
    getAllHistories(user)
  );
}
