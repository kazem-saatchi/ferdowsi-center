"use server";

import { db } from "@/lib/db";
import {
  addPaymentByBankIdData,
  addPaymentByBankIdSchema,
} from "@/schema/paymentSchema";

import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { PaymentType, Person, Prisma } from "@prisma/client";

async function createPayment(data: addPaymentByBankIdData, person: Person) {
  // Authorization check
  if (person.role !== "ADMIN") {
    throw new Error(errorMSG.noPermission);
  }

  // Schema validation
  const validation = addPaymentByBankIdSchema.safeParse(data);
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
    type,
    bankTransactionId,
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

  if (bankTransactionId === "") {
    throw new Error(errorMSG.invalidBankId);
  }

  const existPayment = await db.payment.findFirst({
    where: { bankTransactionId },
  });

  if (existPayment) {
    throw new Error(errorMSG.txAlreadyExist);
  }

  try {
    const result = await db.$transaction(async (prisma) => {
      const payment = await prisma.payment.create({
        data: {
          amount,
          personName: `${user.firstName} ${user.lastName}`,
          plaque: shop.plaque,
          date: new Date(date).toISOString(),
          description,
          proprietor,
          type: type as PaymentType,
          title: titleMap[type as PaymentType] || "روش پرداخت نامعلوم",
          bankTransactionId,
          //   personId: user.id,
          //   shopId: shop.id,
          shop: { connect: { id: shop.id } }, // Connect shop by ID
          person: { connect: { id: user.id } }, // Connect person by ID
        },
      });

      await prisma.bankTransaction.update({
        where: { id: bankTransactionId },
        data: {
          registered: true,
          referenceId: payment.id,
          referenceType: "PAYMENT",
          category: proprietor ? "YEARLY" : "MONTHLY",
        },
      });

      console.log("[Payment] Created:", {
        paymentId: payment.id,
        amount: payment.amount,
        shopId: payment.shopId,
      });
    });
  } catch (error) {
    console.error("[Payment] Failed:", {
      error: error instanceof Error && error.message,
      transactionId: bankTransactionId,
    });
    return {
      message: "ثبت اطلاعات ناموفق بود",
    };
  }
  return {
    message: successMSG.paymentCreated,
  };
}

export default async function addPaymentByBankId(data: addPaymentByBankIdData) {
  return handleServerAction(async (person) => createPayment(data, person));
}
