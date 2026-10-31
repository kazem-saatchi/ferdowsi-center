"use server";

import { db } from "@/lib/db";
import { adminReadAction } from "@/utils/handleServerAction";
import { successMSG } from "@/utils/messages";
import { Person, Charge } from "@prisma/client";

interface FindchargeResponse {
  success: boolean;
  message: string;
  charges?: Charge[];
}

async function getAllCharges(user: Person): Promise<FindchargeResponse> {
  // Get ShopCharges
  const chargeList = await db.charge.findMany({
    orderBy: [{ date: "desc" }, { plaque: "asc" }],
  });

  return {
    success: true,
    message: successMSG.chargesFound,
    charges: chargeList,
  };
}

export default async function findAllCharges() {
  return adminReadAction<FindchargeResponse>((user) => getAllCharges(user));
}
