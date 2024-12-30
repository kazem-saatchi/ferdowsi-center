"use server";

import { db } from "@/lib/db";
import {
  AddChargeByShopData,
  addChargeByShopSchema,
} from "@/schema/chargeSchema";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person, Prisma } from "@prisma/client";
import {
  differenceInDays,
  startOfDay,
} from "date-fns";

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

  if (endDate <= startDate) {
    throw new Error(errorMSG.invalidDateRange);
  }

  // Calculate the number of days (inclusive)
  const totalDays = differenceInDays(endDate, startDate) + 1;

  // Fetch ShopHistory entries of specified types
  const relevantHistories = await db.shopHistory.findMany({
    where: {
      type: { in: ["ActiveByOwner", "ActiveByRenter", "InActive"] },
      shopId,
      startDate: { lte: endDate },
      OR: [
        { endDate: null }, // Include ongoing periods
        { endDate: { gte: startDate } }, // Include overlapping periods
      ],
    },
    orderBy: { startDate: "asc" },
  });

  if (!relevantHistories.length) {
    throw new Error(errorMSG.noRelevantHistory);
  }

  // Retrieve the shop's charge reference
  const shopChargeReference = await db.shopChargeReference.findUnique({
    where: { shopId },
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
         historyStartDate > startDate
           ? historyStartDate
           : startDate;
       const chargeEndDate =
         historyEndDate < endDate ? historyEndDate : endDate;
 
       const days = differenceInDays(chargeEndDate, chargeStartDate) + 1;

      if (days > 0) {
        acc.push({
          title: `Charge for ${history.type}`,
          amount: days * dailyAmount,
          shopId: history.shopId,
          plaque: history.plaque,
          personId: history.personId,
          personName: history.personName,
          date: chargeStartDate,
          operationId: operation.id,
          operationName: operation.title,
          daysCount: days,
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

  return {
    message: successMSG.chargesCreated,
  };
}

export default async function addChargeByShop(data: AddChargeByShopData) {
  return handleServerAction(async (person) => createCharge(data, person));
}
