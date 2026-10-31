"use server";

import { db } from "@/lib/db";
import { adminReadAction } from "@/utils/handleServerAction";
import { successMSG } from "@/utils/messages";
import { Person, ShopChargeReference, ShopType } from "@prisma/client";

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
  // Get ShopCharges
  const chargeList = await db.shopChargeReference.findMany({
    where: {
      proprietor: false,
      shopType: { in: [ShopType.STORE, ShopType.OFFICE, ShopType.KIOSK] },
    },
    orderBy: { plaque: "asc" },
  });

  const rentList = await db.shopChargeReference.findMany({
    where: {
      proprietor: true,
      forRent: true,
      shopType: { in: [ShopType.BOARD, ShopType.KIOSK, ShopType.PARKING] },
    },
    orderBy: { plaque: "asc" },
  });

  const annualChargeList = await db.shopChargeReference.findMany({
    where: {
      proprietor: true,
      forRent: false,
      shopType: { in: [ShopType.STORE, ShopType.OFFICE] },
    },
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
  return adminReadAction<FindchargeResponse>((user) =>
    getAllChargesReference(user)
  );
}
