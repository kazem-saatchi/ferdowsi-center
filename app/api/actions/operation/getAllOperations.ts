"use server";

import { db } from "@/lib/db";

import { adminReadAction } from "@/utils/handleServerAction";
import { Operation, Person } from "@prisma/client";

interface AllOperationResponse {
  success: boolean;
  operations: Operation[];
}

async function getAllOperationsInternal(
  person: Person
): Promise<AllOperationResponse> {
  const allOperations = await db.operation.findMany({
    orderBy: { createdAt: "desc" },
  });

  return { success: true, operations: allOperations };
}

export default async function getAllOperations() {
  return adminReadAction<AllOperationResponse>(async (person) =>
    getAllOperationsInternal(person)
  );
}
