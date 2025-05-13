"use server";

import { db } from "@/lib/db";

import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG } from "@/utils/messages";
import { Person } from "@prisma/client";

interface DeleteOperationResponse {
  success: boolean;
  message: string;
}

async function deleteOperationsInternal(
  operationId: string,
  person: Person
): Promise<DeleteOperationResponse> {
  if (person.role !== "ADMIN") {
    throw new Error(errorMSG.noPermission);
  }

  await db.$transaction(async (database) => {
    try {
      await database.charge.deleteMany({ where: { operationId } });

      await database.operation.update({
        where: { id: operationId },
        data: { deleted: true },
      });
    } catch (error) {
      return { success: false, message: "عملیات ناموفق بود" };
    }
  });

  return { success: true, message: "شارژهای ثبت شده با موفقیت حذف شدند" };
}

export default async function deleteChargesByOperation(operationId: string) {
  return handleServerAction<DeleteOperationResponse>(async (person) =>
    deleteOperationsInternal(operationId, person)
  );
}
