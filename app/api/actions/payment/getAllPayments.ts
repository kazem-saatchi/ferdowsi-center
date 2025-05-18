"use server";

import { db } from "@/lib/db";

import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Payment, Person } from "@prisma/client";

interface FindPaymentResponse {
  success: boolean;
  message: string;
  payments?: Payment[];
}

async function findPayments(person: Person): Promise<FindPaymentResponse> {
  // Authorization check
  if (person.role !== "ADMIN" && person.role !== "MANAGER") {
    throw new Error(errorMSG.noPermission);
  }

  // Create payment
  const payments = await db.payment.findMany();

  return {
    success: true,
    message: successMSG.paymentCreated,
    payments,
  };
}

export default async function findAllPayments() {
  return handleServerAction<FindPaymentResponse>(async (person) =>
    findPayments(person)
  );
}
