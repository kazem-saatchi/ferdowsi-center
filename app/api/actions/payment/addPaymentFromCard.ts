"use server";

import { db } from "@/lib/db";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG } from "@/utils/messages";
import { Person } from "@prisma/client";

type PaymentResponse = {
  success: boolean;
  message: string;
  paymentId?: string;
  errorCode?: string;
};

async function addPaymentFromCardTransfer(
  id: string,
  person: Person
): Promise<PaymentResponse> {
  // Input validation
  if (!id || typeof id !== "string") {
    return { success: false, message: "Invalid transaction ID" };
  }

  // Authorization
  if (person.role !== "ADMIN") {
    return { success: false, message: errorMSG.noPermission };
  }

  const bankTransaction = await db.bankTransaction.findUnique({
    where: { id },
  });

  if (!bankTransaction) {
    return { success: false, message: "تراکنش یافت نشد" };
  }

  if (bankTransaction.registered) {
    return { success: false, message: "تراکنش قبلا ثبت شده" };
  }

  if (!bankTransaction.recieverAccount || !bankTransaction.senderAccount) {
    return { success: false, message: "اطلاعات کارت بانکی یافت نشد" };
  }

  if (bankTransaction.amount <= 0) {
    return { success: false, message: "مبلغ نامتعبر" };
  }

  const paymentCheck = await db.payment.findFirst({
    where: { bankTransactionId: bankTransaction.id },
  });

  if (paymentCheck) {
    return {
      success: false,
      message: "تراکنش قبلا ثبت شده است",
    };
  }

  const bankCardNumber = bankTransaction.recieverAccount;

  try {
    const result = await db.$transaction(async (prisma) => {
      const shop = await prisma.shop.findFirst({
        where: {
          OR: [
            { bankCardMonthly: bankCardNumber },
            { bankCardYearly: bankCardNumber },
          ],
        },
        select: {
          id: true,
          plaque: true,
          ownerName: true,
          ownerId: true,
          renterName: true,
          renterId: true,
          bankCardYearly: true,
        },
      });

      if (!shop) {
        throw new Error("واحد پیدا نشد");
      }

      const isProprietor =
        shop.bankCardYearly === bankTransaction.recieverAccount;
      const personName = isProprietor
        ? shop.ownerName
        : shop.renterName || shop.ownerName;
      const personId = isProprietor
        ? shop.ownerId
        : shop.renterId || shop.ownerId;

      const payment = await prisma.payment.create({
        data: {
          amount: bankTransaction.amount,
          date: bankTransaction.date,
          plaque: shop.plaque,
          description: bankTransaction.description,
          personName,
          personId,
          proprietor: isProprietor,
          shopId: shop.id,
          title: "ثبت شارژ سیتمی",
          type: "BANK_TRANSFER",
          bankTransactionId: bankTransaction.id,
        },
      });

      await prisma.bankTransaction.update({
        where: { id },
        data: {
          registered: true,
          referenceId: payment.id,
          referenceType: "PAYMENT",
          category:isProprietor ? "YEARLY" : "MONTHLY"
        },
      });

      console.log("[Payment] Created:", {
        paymentId: payment.id,
        amount: payment.amount,
        shopId: payment.shopId,
      });

      return payment;
    });

    return {
      success: true,
      message: "ردیف با موفقیت ثبت شد",
      paymentId: result.id,
    };
  } catch (error) {
    console.error("[Payment] Failed:", {
      error: error instanceof Error && error.message,
      transactionId: id,
    });
    return {
      success: false,
      message: "ثبت اطلاعات ناموفق بود",
      errorCode: "PROCESSING_ERROR",
    };
  }
}

export default async function addPaymentFromCard(id: string) {
  return handleServerAction(async (person) =>
    addPaymentFromCardTransfer(id, person)
  );
}
