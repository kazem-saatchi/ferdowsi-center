"use server";

import { db } from "@/lib/db";
import {
  AddChargeByShopData,
  addChargeByShopSchema,
} from "@/schema/chargeSchema";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person, Prisma } from "@prisma/client";
import { getRelatedHistories, prorateWindow } from "./utils";

async function createCharge(data: AddChargeByShopData, person: Person) {
  // Authorization check
  if (person.role !== "ADMIN") {
    throw new Error(errorMSG.noPermission);
  }

  // Schema validation
  const validation = addChargeByShopSchema.safeParse(data);
  if (!validation.success) {
    throw new Error(
      validation.error.errors.map((err) => err.message).join(", ")
    );
  }

  const { startDate, endDate, shopId, title } = validation.data;

  const {
    data: relevantHistories,
    totalDays,
    success,
    message,
  } = await getRelatedHistories({
    startDate,
    endDate,
    shopId,
  });

  if (!success) {
    throw new Error(message);
  }

  if (!relevantHistories || !totalDays) {
    throw new Error(errorMSG.noRelevantHistory);
  }

  // Retrieve the shop's charge reference
  const shopChargeReference = await db.shopChargeReference.findFirst({
    where: { shopId, proprietor: false },
  });

  if (!shopChargeReference) {
    throw new Error(errorMSG.shopChargeReferenceNotFound);
  }

  // Create a new operation record
  const currentTime = new Date().toISOString();
  const operation = await db.operation.create({
    data: { date: currentTime, title },
  });

  // Prepare charges for batch insertion. The shared helper owns both the
  // half-open day count and the whole-Rial split of the shop's total.
  const charges: Prisma.ChargeCreateManyInput[] = prorateWindow(
    relevantHistories,
    { startDate, endDate },
    shopChargeReference.totalAmount,
    totalDays
  ).map(({ span: history, days, startDate: chargeStartDate, amount }) => ({
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
  }));

  if (!charges.length) {
    throw new Error(errorMSG.noChargeGenerated);
  }

  // Use a transaction to ensure atomicity
  await db.$transaction(async (prisma) => {
    await prisma.charge.createMany({ data: charges });
  });

  return { success: true, message: successMSG.chargesCreated };
}

export default async function addChargeByShop(data: AddChargeByShopData) {
  return handleServerAction(async (person) => createCharge(data, person));
}
