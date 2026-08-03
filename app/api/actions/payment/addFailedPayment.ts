"use server";

import { db } from "@/lib/db";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG } from "@/utils/messages";
import { Person } from "@prisma/client";
import { resolveShopPersonAtDate } from "./resolveOccupant";
import { toInt4Amount } from "@/utils/bankAmount";

type PaymentResponse = {
  success: boolean;
  message: string;
  chargeId?: string;
  errorCode?: string;
};

async function addFailedPaymentFromCard(
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

  const chargeCheck = await db.charge.findFirst({
    where: { bankTransactionId: bankTransaction.id },
  });

  if (chargeCheck) {
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

      // A returned transaction must be charged back to the person who was
      // credited for it — i.e. the occupant on the transaction date.
      const { personId, personName } = await resolveShopPersonAtDate(
        prisma,
        shop,
        bankTransaction.date,
        isProprietor
      );

      const operation = await prisma.operation.create({
        data: {
          title: `ثبت برگشتی برای واحد ${shop.plaque}`,
          date: new Date(),
        },
      });

      const charge = await prisma.charge.create({
        data: {
          // Charge.amount is still Int while BankTransaction.amount is BigInt.
          // Convert explicitly so an oversized return fails loudly.
          amount: toInt4Amount(bankTransaction.amount, "مبلغ برگشتی"),
          date: bankTransaction.date,
          plaque: shop.plaque,
          description: bankTransaction.description,
          personName,
          personId,
          proprietor: isProprietor,
          shopId: shop.id,
          title: "ثبت برگشت از حساب بانکی",
          daysCount: 0,
          operationId: operation.id,
          operationName: operation.title,
          bankTransactionId: bankTransaction.id,
        },
      });

      await prisma.bankTransaction.update({
        where: { id },
        data: {
          registered: true,
          referenceId: charge.id,
          // NOTE: referenceId points at a Charge record, but the ReferenceType
          // enum has no "CHARGE" value — "PAYMENT" is the closest available option.
          // If a CHARGE enum value is added in the future, update this field.
          referenceType: "PAYMENT",
          category: isProprietor ? "YEARLY" : "MONTHLY",
        },
      });


      return charge;
    });

    return {
      success: true,
      message: "ردیف برگشتی با موفقیت ثبت شد",
      chargeId: result.id,
    };
  } catch (error) {
    console.error("[Charge] Failed:", {
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

export default async function addFailedPayment(id: string) {
  return handleServerAction(async (person) =>
    addFailedPaymentFromCard(id, person)
  );
}
