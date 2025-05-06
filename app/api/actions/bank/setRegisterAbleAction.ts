"use server";

import { db } from "@/lib/db";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG } from "@/utils/messages";
import { Person } from "@prisma/client";

type Response = {
  success: boolean;
  message: string;
};

async function setAsRegisterAble(
  id: string,
  person: Person
): Promise<Response> {
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

  try {
    await db.bankTransaction.update({
      where: { id: bankTransaction.id },
      data: { registerAble: !bankTransaction.registerAble },
    });
  } catch (error) {
    return {
      success: false,
      message: "عملیلت ناموفق بود",
    };
  }

  return {
    success: true,
    message: "با موفقیت انجام شد",
  };
}

export default async function setRegisterAbleAction(id: string) {
  return handleServerAction(async (person) => setAsRegisterAble(id, person));
}
