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

async function findPayments(
  shopId: string,
  person: Person
): Promise<FindPaymentResponse> {
  // Authorization check
  if (person.role !== "ADMIN") {
    throw new Error(errorMSG.noPermission);
  }

  // Create payment
  const payments = await db.payment.findMany({
    where: { shopId },
    orderBy: { date: "desc" },
  });

  return {
    success: true,
    message: successMSG.paymentFinded,
    payments,
  };
}

export default async function findPaymentsByShop(shopId: string) {
  return handleServerAction<FindPaymentResponse>(async (person) =>
    findPayments(shopId, person)
  );
}
