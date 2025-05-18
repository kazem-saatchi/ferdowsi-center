"use server";

import { db } from "@/lib/db";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person, Charge } from "@prisma/client";

interface FindchargeResponse {
  success: boolean;
  message: string;
  charges?: Charge[];
}

async function getAllCharges(user: Person): Promise<FindchargeResponse> {
  // Check authentication
  if (user.role !== "ADMIN" && user.role !== "MANAGER") {
    throw new Error(errorMSG.unauthorized);
  }

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
  return handleServerAction<FindchargeResponse>((user) => getAllCharges(user));
}
