"use server";

import { db } from "@/lib/db";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person } from "@prisma/client";

export interface UpdatePaymentUserProps {
  userId: string;
  shopId: string;
  paymentId: string;
}

async function updatePaymentUser(data: UpdatePaymentUserProps, person: Person) {
  const { userId, paymentId } = data;

  // Authorization check
  if (person.role !== "ADMIN") {
    throw new Error(errorMSG.noPermission);
  }

  const user = await db.person.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error(errorMSG.userNotFound);
  }

  const payment = await db.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment) {
    throw new Error(errorMSG.paymentNotFound);
  }

  if (payment.shopId !== data.shopId) {
    throw new Error(errorMSG.shopIdMismatch);
  }

  const updatedPayment = await db.payment.update({
    where: { id: paymentId },
    data: {
      personId: userId,
      personName: `${user.firstName} ${user.lastName}`,
    },
  });

  return {
    success: true,
    message: successMSG.paymentUpdated,
  };
}

export default async function updatePaymentUserAction(
  data: UpdatePaymentUserProps,
) {
  return handleServerAction(async (person) => updatePaymentUser(data, person));
}
