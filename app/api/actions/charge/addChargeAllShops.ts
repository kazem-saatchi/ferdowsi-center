"use server";

import { db } from "@/lib/db";
import {
  AddChargeAllShopsData,
  addChargeAllShopsSchema,
} from "@/schema/chargeSchema";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person, Prisma } from "@prisma/client";
import {
  differenceInDays,
  startOfDay,
} from "date-fns";

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
  const { startDate,endDate, title } = validation?.data;


  if (endDate <= startDate) {
    throw new Error(errorMSG.invalidDateRange);
  }

  // Calculate the number of days (inclusive)
  const totalDays = differenceInDays(endDate, startDate) + 1;



  // Fetch ShopHistory entries of specified types
  const relevantHistories = await db.shopHistory.findMany({
    where: {
      type: { in: ["ActiveByOwner", "ActiveByRenter", "InActive"] }, // Exclude "Ownership"
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


  const currentTime = new Date().toISOString();

  const operation = await db.operation.create({
    data: { date: currentTime, title },
  });

  if (!operation) {
    throw new Error(errorMSG.unknownError);
  }

  const shopsChargeList = await db.shopChargeReference.findMany();

  if (!shopsChargeList.length) {
    throw new Error("No shop charge references found in the database.");
  }

  // Calculate charges for each history period
  const charges = relevantHistories.reduce<Prisma.ChargeCreateManyInput[]>(
    (acc, history) => {
      const shopChargeReference = shopsChargeList.find(
        (charge) => charge.shopId === history.shopId
      );

      if (!shopChargeReference) {
        console.warn(`No monthly charge found for shop ${history.shopId}`);
        throw new Error(
          `No charge reference found for shopId: ${history.shopId}`
        );
      }

      const dailyAmount = shopChargeReference.totalAmount / totalDays;

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

      console.log("days",days)

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

  return {
    message: successMSG.chargesCreated,
  };
}

export default async function addChargeToAllShops(data: AddChargeAllShopsData) {
  return handleServerAction<AddChargeResponse>(async (person) =>
    createCharge(data, person)
  );
}
