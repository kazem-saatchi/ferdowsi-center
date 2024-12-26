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
  endOfMonth,
  parseISO,
  startOfDay,
  startOfMonth,
} from "date-fns-jalali";

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

  const { month, shopId, title } = validation.data;

  // Normalize dates for the specified month
  const parsedMonth = parseISO(`${month}-01`);
  const normalizedFromDate = startOfMonth(parsedMonth);
  const normalizedToDate = endOfMonth(parsedMonth);

  if (normalizedToDate <= normalizedFromDate) {
    throw new Error(errorMSG.invalidDateRange);
  }

  // Calculate total days in the month
  const totalDays = differenceInDays(normalizedToDate, normalizedFromDate) + 1;

  // Fetch ShopHistory entries of specified types
  const relevantHistories = await db.shopHistory.findMany({
    where: {
      shopId,
      type: { in: ["ActiveByOwner", "ActiveByRenter", "InActive"] },
      startDate: { lte: normalizedToDate.toISOString() },
      OR: [
        { endDate: null }, // Include ongoing periods
        { endDate: { gte: normalizedFromDate.toISOString() } },
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
        : normalizedToDate;

      const chargeStartDate =
        historyStartDate > normalizedFromDate
          ? historyStartDate
          : normalizedFromDate;
      const chargeEndDate =
        historyEndDate < normalizedToDate ? historyEndDate : normalizedToDate;

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
