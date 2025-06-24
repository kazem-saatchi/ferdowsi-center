"use server";

import { db } from "@/lib/db";
import {
  AddChargeAllShopsData,
  addChargeAllShopsSchema,
} from "@/schema/chargeSchema";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person, Prisma } from "@prisma/client";
import { differenceInDays, startOfDay, endOfDay, addDays } from "date-fns";
import { getRelatedHistories } from "./utils";

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

  // Calculate charges for each history period
  const charges = relevantHistories.reduce<Prisma.ChargeCreateManyInput[]>(
    (acc, history) => {
      const shopChargeReference = shopsChargeRefList.find(
        (charge) => charge.shopId === history.shopId
      );

      console.log("--------------------------------------------------------");

      console.log(
        "shopCharge reference",
        shopChargeReference ?? "undefined",
        history
      );

      if (!shopChargeReference) {
        console.warn(`No monthly charge found for shop ${history.shopId}`);

        // throw new Error(
        //   `No charge reference found for shopId: ${history.shopId}`
        // );
      }

      const dailyAmount = shopChargeReference
        ? shopChargeReference.totalAmount / totalDays
        : 0;

      const historyStartDate = startOfDay(new Date(history.startDate));

      const historyEndDate = history.endDate
        ? startOfDay(new Date(history.endDate))
        : startOfDay(endDate);

      const chargeStartDate =
        historyStartDate > startOfDay(startDate)
          ? historyStartDate
          : startOfDay(startDate);
      const chargeEndDate =
        historyEndDate < startOfDay(endDate)
          ? startOfDay(historyEndDate)
          : addDays(startOfDay(endDate), 1);

      const days = differenceInDays(chargeEndDate, chargeStartDate);

      if (days > 0 && dailyAmount > 0) {
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
