"use server";

import { db } from "@/lib/db";
import {
  ShopChargeReferenceData,
  ShopChargeReferenceSchema,
} from "@/schema/chargeSchema";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person, Prisma } from "@prisma/client";
import { getYear } from "date-fns-jalali";

async function generateShopChargeReference(
  data: ShopChargeReferenceData,
  person: Person
) {
  // Only admins or authorized roles
  if (person.role !== "ADMIN" && person.role !== "MANAGER") {
    throw new Error(errorMSG.noPermission);
  }

  // Validate input
  const validation = ShopChargeReferenceSchema.safeParse(data);
  if (!validation.success) {
    throw new Error(
      validation.error.errors.map((err) => err.message).join(", ")
    );
  }

  const { officeConst, officeMetric, storeConst, storeMetric, savingPercent } =
    validation.data;

  // Fetch all active shops
  const shopsList = await db.shop.findMany({
    where: { OR: [{ type: "OFFICE" }, { type: "STORE" }] },
    orderBy: { plaque: "asc" },
  });

  const kioskList = await db.shop.findMany({
    where: { OR: [{ type: "KIOSK" }, { type: "PARKING" }, { type: "BOARD" }] },
    orderBy: { plaque: "asc" },
  });

  if (shopsList.length === 0) {
    throw new Error("No active shops found to generate charge references.");
  }

  // Prepare new charge reference data
  const currentYear = getYear(new Date());
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
        totalAmount:
          Math.round(
            ((shop.area * metricValue + constValue) *
              (1 + savingPercent / 100)) /
              100000
          ) * 100000,
        year: currentYear,
      };

      return chargeObject;
    });

  const newKioskChargeList: Prisma.ShopChargeReferenceCreateManyInput[] =
    kioskList.map((shop) => {
      const totalAmount = shop.ChargeAmount;
      const chargeObject = {
        shopId: shop.id,
        plaque: shop.plaque,
        area: shop.area,
        constantAmount: 0,
        metricAmount: 0,
        totalAmount: totalAmount ?? 0,
        year: currentYear,
        proprietor: false,
      };

      return chargeObject;
    });

  // Transaction: Clear old references for these shops and insert new ones
  await db.$transaction(async (prisma) => {
    await prisma.shopChargeReference.deleteMany({
      where: {
        shopId: { in: shopsList.map((shop) => shop.id) },
        proprietor: false,
      },
    });

    await prisma.shopChargeReference.createMany({
      data: [...newChargeList, ...newKioskChargeList],
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
