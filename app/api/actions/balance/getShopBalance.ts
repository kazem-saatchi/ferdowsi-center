"use server";

import { db } from "@/lib/db";
import { GetChargeByShopData } from "@/schema/chargeSchema";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person, Charge, Payment } from "@prisma/client";

interface FindBalanceResponse {
  success: boolean;
  message: string;
  charges?: Charge[];
  payments?: Payment[];
}

async function getAllBalance(
  data: GetChargeByShopData,
  user: Person
): Promise<FindBalanceResponse> {
  // Check authentication
  if (!user || user.role !== "ADMIN") {
    throw new Error(errorMSG.unauthorized);
  }

  // Get Shop Charges List
  const chargeList = await db.charge.findMany({
    where: { shopId: data.shopId },
    orderBy: [{ date: "desc" }],
  });

  //Get Payment List
  const paymentList = await db.payment.findMany({
    where: { shopId: data.shopId },
    orderBy: { date: "desc" },
  });

  return {
    success: true,
    message: successMSG.chargesFound,
    charges: chargeList,
    payments: paymentList,
  };
}

export default async function findBalanceByShop(data: GetChargeByShopData) {
  return handleServerAction<FindBalanceResponse>((user) =>
    getAllBalance(data, user)
  );
}
