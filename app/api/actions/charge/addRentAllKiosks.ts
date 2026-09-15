"use server";

import { db } from "@/lib/db";
import {
  AddChargeAllShopsData,
  addChargeAllShopsSchema,
} from "@/schema/chargeSchema";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person, Prisma, ShopHistory } from "@prisma/client";
import {
  getRelatedHistories,
  isRentBillableHistory,
  prorateWindow,
} from "./utils";

interface AddChargeResponse {
  message: string;
}

async function createCharge(data: AddChargeAllShopsData, person: Person) {
  // Only admins or authorized roles can add new people
  if (person.role !== "ADMIN") {
    throw new Error(errorMSG.noPermission);
  }

  const validation = addChargeAllShopsSchema.safeParse(data);

  if (!validation.success) {
    throw new Error(
      validation.error.errors.map((err) => err.message).join(", ")
    );
  }
  const { startDate, endDate, title } = validation?.data;

  const {
    data: allHistories,
    success,
    message,
    totalDays,
  } = await getRelatedHistories({
    startDate,
    endDate,
  });

  if (!success) {
    throw new Error(message);
  }

  if (!allHistories || !totalDays) {
    throw new Error(errorMSG.noRelevantHistory);
  }

  const currentTime = new Date().toISOString();

  const operation = await db.operation.create({
    data: { date: currentTime, title },
  });

  if (!operation) {
    throw new Error(errorMSG.unknownError);
  }

  const shopsChargeList = await db.shopChargeReference.findMany({
    where: { proprietor: true, forRent: true },
  });

  if (!shopsChargeList.length) {
    throw new Error("No shop charge references found in the database.");
  }

  const relevantHistories = allHistories.filter(isRentBillableHistory);

  // Each unit's rent is split only among that unit's own tenancy spans, so the
  // per-unit slices always sum back to that unit's reference total.
  const historiesByShop = relevantHistories.reduce<Map<string, ShopHistory[]>>(
    (acc, history) => {
      const list = acc.get(history.shopId) ?? [];
      list.push(history);
      acc.set(history.shopId, list);
      return acc;
    },
    new Map()
  );

  // Calculate charges for each history period
  const charges: Prisma.ChargeCreateManyInput[] = [];

  for (const [shopId, shopHistories] of Array.from(historiesByShop.entries())) {
    const shopChargeReference = shopsChargeList.find(
      (charge) => charge.shopId === shopId
    );

    if (!shopChargeReference || shopChargeReference.totalAmount <= 0) {
      console.warn(`*** No Rent Reference found for shop ${shopId} ***`);
      continue;
    }

    const segments = prorateWindow(
      shopHistories,
      { startDate, endDate },
      shopChargeReference.totalAmount,
      totalDays
    );

    for (const { span: history, days, startDate: chargeStartDate, amount } of segments) {
      charges.push({
        title: operation.title,
        amount,
        shopId: history.shopId,
        plaque: history.plaque,
        personId: history.personId,
        personName: history.personName,
        date: chargeStartDate,
        operationId: operation.id,
        operationName: operation.title,
        daysCount: days,
        proprietor: true,
        forRent: true,
      });
    }
  }

  // Batch insert charges
  if (charges.length) {
    await db.$transaction(async (prisma) => {
      if (charges.length) {
        await prisma.charge.createMany({ data: charges });
      }
    });
  } else {
    throw new Error(errorMSG.noChargeGenerated);
  }

  return { success: true, message: successMSG.chargesCreated };
}

export default async function addRentToAllKiosks(data: AddChargeAllShopsData) {
  return handleServerAction<AddChargeResponse>(async (person) =>
    createCharge(data, person)
  );
}
