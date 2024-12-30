"use server";

import { db } from "@/lib/db";
import {
  AddPaymentByInfoData,
  addPaymentByInfoSchema,
} from "@/schema/paymentSchema";

import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person, Prisma } from "@prisma/client";

async function createPayment(data: AddPaymentByInfoData, person: Person) {
  // Authorization check
  if (person.role !== "ADMIN") {
    throw new Error(errorMSG.noPermission);
  }

  // Schema validation
  const validation = addPaymentByInfoSchema.safeParse(data);
  if (!validation.success) {
    throw new Error(
      validation.error.errors.map((err) => err.message).join(", ")
    );
  }

  const { amount, date, personId, shopId } = validation.data;

  // Fetch user and shop in parallel
  const [user, shop] = await Promise.all([
    db.person.findUnique({ where: { id: personId } }),
    db.shop.findUnique({ where: { id: shopId } }),
  ]);

  if (!user) {
    throw new Error(errorMSG.userNotFound);
  }

  if (!shop) {
    throw new Error(errorMSG.shopNotFound);
  }

  if (amount <= 0) {
    throw new Error(errorMSG.invalidAmount);
  }

  // Create payment
  await db.payment.create({
    data: {
      amount,
      personName: `${user.firstName} ${user.lastName}`,
      plaque: shop.plaque,
      date: new Date(date).toISOString(),
      //   personId: user.id,
      //   shopId: shop.id,
      shop: { connect: { id: shop.id } }, // Connect shop by ID
      person: { connect: { id: user.id } }, // Connect person by ID
    },
  });

  return {
    message: successMSG.paymentCreated,
  };
}

export default async function addPaymentByInfo(data: AddPaymentByInfoData) {
  return handleServerAction(async (person) => createPayment(data, person));
}
