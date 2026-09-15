"use server";

import { db } from "@/lib/db";
import {
  addPaymentByBankIdData,
  addPaymentByBankIdSchema,
} from "@/schema/paymentSchema";

import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { PaymentType, Person, Prisma } from "@prisma/client";
import { toInt4Amount } from "@/utils/bankAmount";
import { claimBankTransaction } from "@/utils/bankRegistration";

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

  // `date` is deliberately not read out of the payload: the payment is dated
  // from the bank row itself inside the transaction below.
  const {
    amount,
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

  await db.$transaction(async (prisma) => {
    // The form disables the amount and date inputs, but that is cosmetic: the
    // action is reachable directly. The bank row is the only trustworthy source
    // for how much money actually moved, so reconcile against it here.
    const bankTransaction = await prisma.bankTransaction.findUnique({
      where: { id: bankTransactionId },
    });

    if (!bankTransaction) {
      throw new Error(errorMSG.invalidBankId);
    }

    // BankTransaction.amount is BigInt, Payment.amount is Int — cross that
    // boundary loudly instead of silently truncating. See utils/bankAmount.ts.
    const bankAmount = toInt4Amount(bankTransaction.amount, "مبلغ پرداخت");

    if (bankAmount !== amount) {
      throw new Error(errorMSG.invalidAmount);
    }

    const payment = await prisma.payment.create({
      data: {
        // Server-side values, not the client's, for both money and date.
        amount: bankAmount,
        personName: `${user.firstName} ${user.lastName}`,
        plaque: shop.plaque,
        date: bankTransaction.date,
        description,
        proprietor,
        type: type as PaymentType,
        title: titleMap[type as PaymentType] || "روش پرداخت نامعلوم",
        bankTransactionId,
        shop: { connect: { id: shop.id } },
        person: { connect: { id: user.id } },
      },
    });

    // Claim after creating, inside the same transaction: a losing claim throws
    // and rolls the payment back. This is also the only check that catches a
    // row already consumed as a Charge or a Cost.
    await claimBankTransaction(prisma, {
      bankTransactionId,
      referenceId: payment.id,
      referenceType: "PAYMENT",
      category: proprietor ? "YEARLY" : "MONTHLY",
    });
  });

  return {
    message: successMSG.paymentCreated,
  };
}

export default async function addPaymentByBankId(data: addPaymentByBankIdData) {
  return handleServerAction(async (person) => createPayment(data, person));
}
