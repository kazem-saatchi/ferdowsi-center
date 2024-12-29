"use server";

import { db } from "@/lib/db";
import {
  ShopChargeReferenceData,
  ShopChargeReferenceSchema,
} from "@/schema/chargeSchema";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person, Prisma } from "@prisma/client";

async function generateShopChargeReference(
  data: ShopChargeReferenceData,
  person: Person
) {
  // Validate input
  const validation = ShopChargeReferenceSchema.safeParse(data);
  if (!validation.success) {
    throw new Error(
      validation.error.errors.map((err) => err.message).join(", ")
    );
  }

  const { officeConst, officeMetric, storeConst, storeMetric } =
    validation.data;

  // Fetch all active shops
  const shopsList = await db.shop.findMany({
    orderBy: { plaque: "asc" },
  });

  if (shopsList.length === 0) {
    throw new Error("No active shops found to generate charge references.");
  }

  // Prepare new charge reference data
  const currentYear = new Date().getFullYear();
  const newChargeList: Prisma.ShopChargeReferenceCreateManyInput[] =
    shopsList.map((shop) => {
      const constValue = shop.type === "STORE" ? storeConst : officeConst;
      const metricValue = shop.type === "STORE" ? storeMetric : officeMetric;
      const chargeObject = {
        shopId: shop.id,
        plaque: shop.plaque,
        area: shop.area,
        constantAmount: constValue,
        metricAmount: metricValue,
        totalAmount: shop.area * metricValue + constValue,
        year: currentYear,
      };

      return chargeObject;
    });

  // Transaction: Clear old references for these shops and insert new ones
  await db.$transaction(async (prisma) => {
    await prisma.shopChargeReference.deleteMany({
      where: { shopId: { in: shopsList.map((shop) => shop.id) } },
    });

    await prisma.shopChargeReference.createMany({
      data: newChargeList,
    });
  });

  return {
    message: successMSG.chargesCreated,
    chargesCreated: newChargeList.length,
  };
}

export default async function generateShopChargeReferenceList(
  data: ShopChargeReferenceData
) {
  return handleServerAction(async (person) =>
    generateShopChargeReference(data, person)
  );
}
