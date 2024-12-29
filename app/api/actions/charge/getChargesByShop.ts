"use server";

import { db } from "@/lib/db";
import { GetChargeByShopData } from "@/schema/chargeSchema";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person, Charge } from "@prisma/client";

interface FindchargeResponse {
  success: boolean;
  message: string;
  charges?: Charge[];
}

async function getAllCharges(
  data: GetChargeByShopData,
  user: Person
): Promise<FindchargeResponse> {
  // Check authentication
  if (!user || user.role !== "ADMIN") {
    throw new Error(errorMSG.unauthorized);
  }

  // Get ShopCharges
  const chargeList = await db.charge.findMany({
    where: { shopId: data.shopId },
    orderBy: [{ date: "desc" }],
  });

  return {
    success: true,
    message: successMSG.chargesFound,
    charges: chargeList,
  };
}

export default async function findChargesByShop(data: GetChargeByShopData) {
  return handleServerAction<FindchargeResponse>((user) =>
    getAllCharges(data, user)
  );
}
