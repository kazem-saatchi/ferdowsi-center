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

async function getAllHistories(
  personId: string,
  user: Person
): Promise<FindHistoryResponse> {
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
  return adminReadAction<FindHistoryResponse>((user) =>
    getAllHistories(personId, user)
  );
}
