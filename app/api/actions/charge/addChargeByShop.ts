"use server";

import { db } from "@/lib/db";
import { AddChargeByShopData } from "@/schema/chargeSchema";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import {
  differenceInDays,
  endOfMonth,
  parseISO,
  startOfDay,
  startOfMonth,
} from "date-fns-jalali";

async function createCharge(data: AddChargeByShopData) {
  const { month, shopId, title } = data;

  // Parse the month and calculate the start and end of the month
  const parsedMonth = parseISO(`${month}-01`); // Convert "YYYY-MM" to a date
  const normalizedFromDate = startOfMonth(parsedMonth);
  const normalizedToDate = endOfMonth(parsedMonth);

  if (normalizedToDate <= normalizedFromDate) {
    throw new Error(errorMSG.invalidDateRange);
  }

  // Calculate the number of days (inclusive)
  const totalDays = differenceInDays(normalizedToDate, normalizedFromDate) + 1;

  // Fetch ShopHistory entries of specified types
  const relevantHistories = await db.shopHistory.findMany({
    where: {
      shopId,
      type: { in: ["ActiveByOwner", "ActiveByRenter", "InActive"] }, // Exclude "Ownership"
      startDate: { lte: normalizedToDate.toISOString() },
      OR: [
        { endDate: null }, // Include ongoing periods
        { endDate: { gte: normalizedFromDate.toISOString() } }, // Include overlapping periods
      ],
    },
    orderBy: { startDate: "asc" },
  });

  if (!relevantHistories.length) {
    throw new Error(errorMSG.noRelevantHistory);
  }

  const currentTime = new Date().toISOString();

  const operation = await db.operation.create({
    data: { date: currentTime, title },
  });

  if (!operation) {
    throw new Error(errorMSG.unknownError);
  }

  const monthlyChargeList = await db.monthlyCharge.findMany({
    where: { shopId },
  });

  // Calculate the amount based on the daily rate
  const dailyAmount = monthlyChargeList[0].totalAmount / totalDays;

  // Calculate charges for each history period
  const charges = relevantHistories.map((history) => {
    // Normalize the start and end dates of the history
    const historyStartDate = startOfDay(new Date(history.startDate));
    const historyEndDate = history.endDate
      ? startOfDay(new Date(history.endDate))
      : normalizedToDate;

    // Calculate the overlap between the provided range and the history period
    const chargeStartDate =
      historyStartDate > normalizedFromDate
        ? historyStartDate
        : normalizedFromDate;
    const chargeEndDate =
      historyEndDate < normalizedToDate ? historyEndDate : normalizedToDate;

    // Calculate the number of days (inclusive)
    const days = differenceInDays(chargeEndDate, chargeStartDate) + 1;

    // Skip if no overlap
    if (days <= 0) return null;

    return {
      title: `Charge for ${history.type}`,
      amount:days * dailyAmount,
      shopId: history.shopId,
      plaque: history.plaque,
      personId: history.personId,
      personName: history.personName,
      date: chargeStartDate, // Date associated with the charge
      operationId: operation.id,
      operationName: operation.title,
      daysCount: days,
    };
  });

  console.log(charges);

  const filteredCharges = charges.filter(Boolean);

  if (!filteredCharges.length) {
    throw new Error(errorMSG.noChargeGenerated);
  }

  // Save the charges in the database using a transaction
  await db.$transaction(async (prisma) => {
    for (const charge of filteredCharges) {
      if (charge) {
        console.log("saving..");
        await prisma.charge.create({
          data: {
            title: charge.title,
            amount: charge?.amount,
            shopId: charge.shopId,
            pelaque: charge?.plaque,
            personId: charge.personId,
            personName: charge.personName,
            date: charge?.date,
            operationId: charge.operationId,
            operationName: charge.operationName,
            daysCount: charge?.daysCount,
          },
        });
      }
    }
  });

  return {
    message: successMSG.chargesCreated,
  };
}

export default async function handleCreateCharge(data: AddChargeByShopData) {
  return handleServerAction(async () => createCharge(data));
}
