"use server";

import { db } from "@/lib/db";

import { adminReadAction } from "@/utils/handleServerAction";
import { successMSG } from "@/utils/messages";
import { Payment, Person } from "@prisma/client";

interface FindPaymentResponse {
  success: boolean;
  message: string;
  payments?: Payment[];
}

async function findPayments(person: Person): Promise<FindPaymentResponse> {
  // Create payment
  const payments = await db.payment.findMany({ orderBy: { date: "desc" } });

  return {
    success: true,
    message: successMSG.paymentCreated,
    payments,
  };
}

export default async function findAllPayments() {
  return adminReadAction<FindPaymentResponse>(async (person) =>
    findPayments(person)
  );
}
