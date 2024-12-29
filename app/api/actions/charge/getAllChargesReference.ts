"use server";

import { db } from "@/lib/db";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person, ShopChargeReference } from "@prisma/client";

interface FindchargeResponse {
  success: boolean;
  message: string;
  chargeList?: ShopChargeReference[];
}

async function getAllChargesReference(
  user: Person
): Promise<FindchargeResponse> {
  // Check authentication
  if (!user || user.role !== "ADMIN") {
    throw new Error(errorMSG.unauthorized);
  }

  // Get ShopCharges
  const chargeList = await db.shopChargeReference.findMany({
    orderBy: { plaque: "asc" },
  });

  return {
    success: true,
    message: successMSG.chargesFound,
    chargeList: chargeList,
  };
}

export default async function findAllChargesReference() {
  return handleServerAction<FindchargeResponse>((user) =>
    getAllChargesReference(user)
  );
}
