"use server";

import { db } from "@/lib/db";
import {
  AddChargeAllShopsData,
  addChargeAllShopsSchema,
} from "@/schema/chargeSchema";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person, Prisma, ShopHistory } from "@prisma/client";
import { getRelatedHistories, prorateWindow } from "./utils";

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
    data: relevantHistories,
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

  if (!relevantHistories || !totalDays) {
    throw new Error(errorMSG.noRelevantHistory);
  }

  const currentTime = new Date().toISOString();

  const operation = await db.operation.create({
    data: { date: currentTime, title },
  });

  if (!operation) {
    throw new Error(errorMSG.unknownError);
  }

  const shopsChargeRefList = await db.shopChargeReference.findMany({
    where: { proprietor: false },
  });

  if (!shopsChargeRefList.length) {
    throw new Error("No shop charge references found in the database.");
  }

  // Each shop's total is split only among that shop's own spans, so the
  // per-shop slices always sum back to that shop's reference total.
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
    const shopChargeReference = shopsChargeRefList.find(
      (charge) => charge.shopId === shopId
    );

    if (!shopChargeReference || shopChargeReference.totalAmount <= 0) {
      console.warn(`No monthly charge found for shop ${shopId}`);
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
        proprietor: false,
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

export default async function addChargeToAllShops(data: AddChargeAllShopsData) {
  return handleServerAction<AddChargeResponse>(async (person) =>
    createCharge(data, person)
  );
}
