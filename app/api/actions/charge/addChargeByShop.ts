"use server";

import { db } from "@/lib/db";
import {
  AddChargeByShopData,
  addChargeByShopSchema,
} from "@/schema/chargeSchema";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person, Prisma } from "@prisma/client";
import { differenceInDays, startOfDay } from "date-fns";
import { getRelatedHistories } from "./utils";

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

  const dailyAmount = shopChargeReference.totalAmount / totalDays;

  // Create a new operation record
  const currentTime = new Date().toISOString();
  const operation = await db.operation.create({
    data: { date: currentTime, title },
  });

  // Prepare charges for batch insertion
  const charges = relevantHistories.reduce<Prisma.ChargeCreateManyInput[]>(
    (acc, history) => {
      const historyStartDate = startOfDay(new Date(history.startDate));
      const historyEndDate = history.endDate
        ? startOfDay(new Date(history.endDate))
        : endDate;

      const chargeStartDate =
        historyStartDate > startDate ? historyStartDate : startDate;
      const chargeEndDate = historyEndDate < endDate ? historyEndDate : endDate;

      const days = differenceInDays(chargeEndDate, chargeStartDate) + 1;

      if (days > 0) {
        acc.push({
          title: operation.title,
          amount: days * dailyAmount,
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

      return acc;
    },
    []
  );

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
