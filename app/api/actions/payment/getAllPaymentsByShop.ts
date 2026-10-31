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

async function findPayments(
  shopId: string,
  person: Person
): Promise<FindPaymentResponse> {
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
  return adminReadAction<FindPaymentResponse>(async (person) =>
    findPayments(shopId, person)
  );
}
