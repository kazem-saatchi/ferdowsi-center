"use server";

import { db } from "@/lib/db";

import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person } from "@prisma/client";

interface DeletePaymentResponse {
  success: boolean;
  message: string;
  shopId: string;
  personId: string;
}

async function deletePayment(
  paymentId: string,
  person: Person
): Promise<DeletePaymentResponse> {
  // Authorization check
  if (person.role !== "ADMIN") {
    throw new Error(errorMSG.noPermission);
  }

  // Find Payment
  const payment = await db.payment.findUnique({ where: { id: paymentId } });

  // Check If Payment Founded
  if (!payment) {
    throw new Error(errorMSG.paymentNotFound);
  }

  // Delete Payment, and release the bank transaction it consumed in the same
  // transaction. Without the release the row stays `registered = true` and
  // points at a deleted Payment: it is filtered out of /card-transfer (which
  // requires `registered: false`), so the money sits in the bank, absent from
  // every balance, and can never be re-registered through the UI.
  await db.$transaction(async (prisma) => {
    await prisma.payment.delete({ where: { id: paymentId } });

    if (payment.bankTransactionId) {
      // `referenceId: paymentId` guards against clobbering a link that was
      // since re-pointed at another record.
      await prisma.bankTransaction.updateMany({
        where: {
          id: payment.bankTransactionId,
          referenceId: paymentId,
        },
        data: {
          registered: false,
          referenceId: null,
          referenceType: null,
        },
      });
    }
  });

  return {
    success: true,
    message: successMSG.paymentDeleted,
    personId: payment?.personId,
    shopId: payment.shopId,
  };
}

export default async function deletePaymentById(paymentId: string) {
  return handleServerAction<DeletePaymentResponse>(async (person) =>
    deletePayment(paymentId, person)
  );
}
