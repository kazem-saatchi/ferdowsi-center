"use server";

import { db } from "@/lib/db";
import {
  findPersonByFilterSchema,
  FindPersonByFilterData,
} from "@/schema/userSchemas";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person } from "@prisma/client";

interface FindPersonByFilterResponse {
  persons: Person[];
  message: string;
}

async function findPersons(data: FindPersonByFilterData, user: Person) {
  // Check authentication
  if (!user) {
    throw new Error(errorMSG.unauthorized);
  }

  // Validate input
  const validation = findPersonByFilterSchema.safeParse(data);
  if (!validation.success) {
    throw new Error(
      validation.error.errors.map((err) => err.message).join(", ")
    );
  }

  const filters = validation.data;

  // Build dynamic filter
  const whereClause: Record<string, any> = {};
  if (filters.firstName) whereClause.firstName = filters.firstName;
  if (filters.lastName) whereClause.lastName = filters.lastName;
  if (filters.phoneOne) whereClause.phoneOne = filters.phoneOne;
  if (filters.phoneTwo) whereClause.phoneTwo = filters.phoneTwo;
  if (filters.IdNumber) whereClause.IdNumber = filters.IdNumber;
  if (filters.isActive !== undefined) whereClause.isActive = filters.isActive;

  // Fetch persons based on filters
  const persons = await db.person.findMany({
    where: whereClause,
  });

  if (persons.length === 0) {
    throw new Error(errorMSG.noPersonsFound);
  }

  return { message: successMSG.personsFound, persons };
}

export default async function findPersonByFilter(data: FindPersonByFilterData) {
  return handleServerAction<FindPersonByFilterResponse>((user) =>
    findPersons(data, user)
  );
}
