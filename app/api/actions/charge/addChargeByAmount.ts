"use server";

import { db } from "@/lib/db";
import {
  AddChargeByAmount,
  addChargeByAmountSchema,
} from "@/schema/chargeSchema";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person } from "@prisma/client";

async function createCharge(data: AddChargeByAmount, user: Person) {
  // Authorization check
  if (user.role !== "ADMIN") {
    throw new Error(errorMSG.noPermission);
  }

  // Schema validation
  const validation = addChargeByAmountSchema.safeParse(data);
  if (!validation.success) {
    throw new Error(
      validation.error.errors.map((err) => err.message).join(", ")
    );
  }

  const { date, amount, shopId, title, personId } = validation.data;

  const [shop, person] = await Promise.all([
    db.shop.findUnique({ where: { id: shopId } }),
    db.person.findUnique({ where: { id: personId } }),
  ]);

  if (!shop) {
    throw new Error(errorMSG.shopNotFound);
  }

  if (!person) {
    throw new Error(errorMSG.personNotFound);
  }

  const isoDate = date.toISOString();
  
   // Use a transaction to ensure consistency
   await db.$transaction(async (prisma) => {
    const operation = await prisma.operation.create({
      data: { date: isoDate, title },
    });

    await prisma.charge.create({
      data: {
        amount,
        date: isoDate,
        daysCount: 0,
        title,
        operationName: operation.title,
        plaque: shop.plaque,
        shopId: shop.id,
        personId: person.id,
        personName: `${person.firstName} ${person.lastName}`,
        operationId: operation.id,
      },
    });
  });

  return { success: true, message: successMSG.chargesCreated };
}

export default async function addChargeByAmount(data: AddChargeByAmount) {
  return handleServerAction(async (person) => createCharge(data, person));
}
