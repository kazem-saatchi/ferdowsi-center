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

async function getAllHistories(
  personId: string,
  user: Person
): Promise<FindHistoryResponse> {
  // Check authentication
  if (!user || user.role !== "ADMIN") {
    throw new Error(errorMSG.unauthorized);
  }
  
  // Get ShopHistories
  const shopHistoryList = await db.shopHistory.findMany({
    where: { personId },
    orderBy: [{ createdAt: "desc" }, { plaque: "desc" }],
  });

  return {
    success: true,
    message: successMSG.shopHistoryFound,
    histories: shopHistoryList,
  };
}

export default async function findHistoryByPerson(personId: string) {
  return handleServerAction<FindHistoryResponse>((user) =>
    getAllHistories(personId, user)
  );
}
