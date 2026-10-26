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

  // No try/catch inside the transaction: catching there made Prisma commit
  // the charge deletes even when marking the operation failed, and still
  // report success. A throw here rolls both back and reaches the caller.
  await db.$transaction(async (database) => {
    await database.charge.deleteMany({ where: { operationId } });

    await database.operation.update({
      where: { id: operationId },
      data: { deleted: true },
    });
  });

  return { success: true, message: "شارژهای ثبت شده با موفقیت حذف شدند" };
}

export default async function deleteChargesByOperation(operationId: string) {
  return handleServerAction<DeleteOperationResponse>(async (person) =>
    deleteOperationsInternal(operationId, person)
  );
}
