"use server";

import { db } from "@/lib/db";
import {
  AddPaymentByInfoData,
  addPaymentByInfoSchema,
} from "@/schema/paymentSchema";

import { adminWriteAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { PaymentType, Person, Prisma } from "@prisma/client";

async function createPayment(data: AddPaymentByInfoData, person: Person) {
  // Schema validation
  const validation = addPaymentByInfoSchema.safeParse(data);
  if (!validation.success) {
    throw new Error(
      validation.error.errors.map((err) => err.message).join(", ")
    );
  }

  const {
    amount,
    date,
    personId,
    shopId,
    description,
    proprietor,
    receiptImageUrl,
    type,
  } = validation.data;

  const titleMap = {
    CASH: "پرداخت نقدی",
    CHEQUE: "پرداخت با چک",
    POS_MACHINE: "پرداخت بوسیله کارتخوان",
    BANK_TRANSFER: "پرداخت کارت به کارت",
    OTHER: "روش پرداخت نامعلوم",
  };

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
      description,
      proprietor,
      receiptImageUrl,
      type: type as PaymentType,
      title: titleMap[type as PaymentType] || "روش پرداخت نامعلوم",
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
  return adminWriteAction(async (person) => createPayment(data, person));
}
