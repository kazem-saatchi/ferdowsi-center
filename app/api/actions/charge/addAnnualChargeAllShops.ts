"use server";

import { db } from "@/lib/db";
import {
  AddAnnualChargeAllShopsData,
  addAnnualChargeAllShopsSchema,
} from "@/schema/chargeSchema";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person, Prisma, ShopChargeReference } from "@prisma/client";

interface AddChargeResponse {
  message: string;
}

async function createCharge(data: AddAnnualChargeAllShopsData, person: Person) {
  // Only admins or authorized roles can add new people
  if (person.role !== "ADMIN") {
    throw new Error(errorMSG.noPermission);
  }

  const validation = addAnnualChargeAllShopsSchema.safeParse(data);

  if (!validation.success) {
    throw new Error(
      validation.error.errors.map((err) => err.message).join(", ")
    );
  }
  const { year, officeMetric, storeMetric, title } = validation?.data;

  const currentTime = new Date().toISOString();

  const operation = await db.operation.create({
    data: { date: currentTime, title },
  });

  if (!operation) {
    throw new Error(errorMSG.unknownError);
  }

  const shops = await db.shop.findMany({
    where: { OR: [{ type: "OFFICE" }, { type: "STORE" }] },
  });

  const annualChargeReferenceList = await db.shopChargeReference.findMany({
    where: { proprietor: true, forRent: false },
  });
  const annualChargeReferenceListMap = annualChargeReferenceList.reduce(
    (acc, item) => {
      acc[item.shopId] = item;
      return acc;
    },
    {} as Record<string, ShopChargeReference>
  );
  // Calculate charges for each history period
  const annualChargeList = shops.reduce<Prisma.ChargeCreateManyInput[]>(
    (acc, shop) => {
      // const metricValue = shop.type === "STORE" ? storeMetric : officeMetric;

      const amount = annualChargeReferenceListMap[shop.id]?.totalAmount;

      acc.push({
        title: `شارژ مالکانه ${year}`,
        amount: amount,
        shopId: shop.id,
        plaque: shop.plaque,
        personId: shop.ownerId,
        personName: shop.ownerName,
        date: currentTime,
        operationId: operation.id,
        operationName: operation.title,
        daysCount: 365,
        proprietor: true,
      });

      return acc;
    },
    []
  );

  // Batch insert charges
  if (annualChargeList.length) {
    await db.$transaction(async (prisma) => {
      if (annualChargeList.length) {
        await prisma.charge.createMany({ data: annualChargeList });
      }
    });
  } else {
    throw new Error(errorMSG.noChargeGenerated);
  }

  return { success: true, message: successMSG.chargesCreated };
}

export default async function addAnnualChargeToAllShops(
  data: AddAnnualChargeAllShopsData
) {
  return handleServerAction<AddChargeResponse>(async (person) =>
    createCharge(data, person)
  );
}
