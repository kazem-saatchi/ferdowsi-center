"use server";

import { db } from "@/lib/db";
import { GetChargeByShopData } from "@/schema/chargeSchema";
import { adminReadAction } from "@/utils/handleServerAction";
import { successMSG } from "@/utils/messages";
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
  return adminReadAction<FindchargeResponse>((user) =>
    getAllCharges(data, user)
  );
}
