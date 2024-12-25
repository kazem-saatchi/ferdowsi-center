"use server";

import { db } from "@/lib/db";
import { AddChargeByShopData } from "@/schema/chargeSchema";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { addDays, differenceInDays, startOfDay } from "date-fns-jalali";


async function createCharge(data: AddChargeByShopData) {
  const { fromDate, toDate, shopId, dailyAmount } = data;

  // Normalize dates to the start of the day (ignoring hours)
  const normalizedFromDate = startOfDay(new Date(fromDate));
  const normalizedToDate = startOfDay(new Date(toDate));

  if (normalizedToDate <= normalizedFromDate) {
    throw new Error(errorMSG.invalidDateRange);
  }

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

  console.log(relevantHistories)

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

    // Calculate the amount based on the daily rate
    const amount = days * dailyAmount;

    return {
      title: `Charge for ${
        history.type
      } (${chargeStartDate.toISOString()} - ${chargeEndDate.toISOString()})`,
      amount,
      shopId: history.shopId,
      plaque: history.plaque,
      personId: history.personId,
      date: chargeStartDate, // Date associated with the charge
      operationId: "generatedOperationId", // Replace with a valid operation ID
      daysCount: days,
    };
  });

  console.log(charges)

  const filteredCharges = charges.filter(Boolean);

  if (!filteredCharges.length) {
    throw new Error(errorMSG.noChargeGenerated);
  }

  

  // Save the charges in the database using a transaction
  await db.$transaction(async (prisma) => {
    for (const charge of filteredCharges) {
      if (charge) {
        console.log("saving..")
        await prisma.charge.create({
          data: {
            title: charge.title,
            amount: charge?.amount,
            shopId: charge.shopId,
            pelaque: charge?.plaque,
            personId: charge.personId,
            date: charge?.date,
            operationId: charge.operationId,
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
