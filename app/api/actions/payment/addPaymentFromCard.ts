"use server";

import { db } from "@/lib/db";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG } from "@/utils/messages";
import { Person } from "@prisma/client";
import { resolveShopPersonAtDate } from "./resolveOccupant";
import { toInt4Amount } from "@/utils/bankAmount";
import { claimBankTransaction } from "@/utils/bankRegistration";

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

  // Fast, friendly pre-check only. The authoritative check is the conditional
  // claim inside the transaction below — this read cannot be trusted, because
  // another request can register the row between here and the write.
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
          type: true,
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

      // Attribute to whoever occupied the shop on the transaction date, so the
      // payment lands on the same person the charge for those days did.
      const { personId, personName } = await resolveShopPersonAtDate(
        prisma,
        shop,
        bankTransaction.date,
        isProprietor
      );

      const payment = await prisma.payment.create({
        data: {
          // Payment.amount is still Int while BankTransaction.amount is BigInt.
          // Convert explicitly so an oversized transfer fails loudly here
          // instead of vanishing the way the import used to.
          amount: toInt4Amount(bankTransaction.amount, "مبلغ پرداخت"),
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

      // Claim after creating, inside the same transaction: a losing claim
      // throws and rolls the payment back, so a double submit can never credit
      // the shop twice for one bank row.
      await claimBankTransaction(prisma, {
        bankTransactionId: id,
        referenceId: payment.id,
        referenceType: "PAYMENT",
        category: isProprietor ? "YEARLY" : "MONTHLY",
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
      // Surface the real reason — "تراکنش قبلا ثبت شده است", "واحد پیدا نشد",
      // or the overflow diagnostic from utils/bankAmount.ts. Collapsing every
      // failure into one opaque sentence hid exactly the messages the operator
      // needs. Every throw on this path carries a Persian, user-facing message.
      message: error instanceof Error ? error.message : "ثبت اطلاعات ناموفق بود",
      errorCode: "PROCESSING_ERROR",
    };
  }
}

export default async function addPaymentFromCard(id: string) {
  return handleServerAction(async (person) =>
    addPaymentFromCardTransfer(id, person)
  );
}
