"use server";

import { db } from "@/lib/db";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person, ShopChargeReference } from "@prisma/client";

interface FindchargeResponse {
  success: boolean;
  message: string;
  chargeList?: ShopChargeReference[];
  annualChargeList?: ShopChargeReference[];
}

async function getAllChargesReference(
  user: Person
): Promise<FindchargeResponse> {
  // Check authentication
  if (user.role !== "ADMIN" && user.role !== "MANAGER") {
    throw new Error(errorMSG.unauthorized);
  }

  // Get ShopCharges
  const chargeList = await db.shopChargeReference.findMany({
    where: { proprietor: false },
    orderBy: { plaque: "asc" },
  });

  const annualChargeList = await db.shopChargeReference.findMany({
    where: { proprietor: true },
    orderBy: { plaque: "asc" },
  });

  return {
    success: true,
    message: successMSG.chargesFound,
    chargeList: chargeList,
    annualChargeList: annualChargeList,
  };
}

export default async function findAllChargesReference() {
  return handleServerAction<FindchargeResponse>((user) =>
    getAllChargesReference(user)
  );
}
