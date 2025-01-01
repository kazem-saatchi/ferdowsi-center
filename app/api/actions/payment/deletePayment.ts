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

  // Delete Payment
  await db.payment.delete({ where: { id: paymentId } });

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
