"use server";

import { db } from "@/lib/db";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person, ShopChargeReference } from "@prisma/client";

interface FindchargeResponse {
  success: boolean;
  message: string;
  chargeList?: ShopChargeReference[];
  rentList?: ShopChargeReference[];
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

  const rentList = await db.shopChargeReference.findMany({
    where: { proprietor: true, forRent: true },
  });

  const annualChargeList = await db.shopChargeReference.findMany({
    where: { proprietor: true, forRent: false },
    orderBy: { plaque: "asc" },
  });

  return {
    success: true,
    message: successMSG.chargesFound,
    chargeList: chargeList,
    rentList: rentList,
    annualChargeList: annualChargeList,
  };
}

export default async function findAllChargesReference() {
  return handleServerAction<FindchargeResponse>((user) =>
    getAllChargesReference(user)
  );
}
