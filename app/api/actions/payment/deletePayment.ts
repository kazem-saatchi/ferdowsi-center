"use server";

import { db } from "@/lib/db";

import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import {  Person } from "@prisma/client";

interface FindPaymentResponse {
  success: boolean;
  message: string;
}

async function deletePayment(
  paymentId: string,
  person: Person
): Promise<FindPaymentResponse> {
  // Authorization check
  if (person.role !== "ADMIN") {
    throw new Error(errorMSG.noPermission);
  }

  // find payment and delete it
  await db.payment.delete({ where: { id: paymentId } });

  return {
    success: true,
    message: successMSG.paymentDeleted,
  };
}

export default async function deletePaymentById(paymentId: string) {
  return handleServerAction<FindPaymentResponse>(async (person) =>
    deletePayment(paymentId, person)
  );
}
