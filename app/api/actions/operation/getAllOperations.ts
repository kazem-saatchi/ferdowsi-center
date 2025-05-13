"use server";

import { db } from "@/lib/db";

import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG } from "@/utils/messages";
import { Operation, Person } from "@prisma/client";

interface AllOperationResponse {
  success: boolean;
  operations: Operation[];
}

async function getAllOperationsInternal(
  person: Person
): Promise<AllOperationResponse> {
  if (person.role !== "ADMIN") {
    throw new Error(errorMSG.noPermission);
  }

  const allOperations = await db.operation.findMany({
    orderBy: { createdAt: "desc" },
  });

  return { success: true, operations: allOperations };
}

export default async function getAllOperations() {
  return handleServerAction<AllOperationResponse>(async (person) =>
    getAllOperationsInternal(person)
  );
}
