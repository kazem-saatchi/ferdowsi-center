"use server";

import { handleServerAction } from "@/utils/handleServerAction";
import { hashPassword } from "@/utils/hashPassword";
import { errorMSG, successMSG } from "@/utils/messages";
import { PrismaClient } from "@prisma/client";
import {
  AddPersonData,
  addPersonSchema,
  SafePerson,
} from "@/schema/personSchema";

interface AddPersonResponse {
  message: string;
  count: number;
  /** National IDs already on file, so the caller can show what was left out.
   *  The rows themselves stay on the server: they carry the bcrypt hash. */
  skippedIdNumbers: string[];
}

async function createPersons(personsArray: AddPersonData[], person: SafePerson) {
  // Only admins or authorized roles can add new people
  if (person.role !== "ADMIN") {
    throw new Error(errorMSG.noPermission);
  }

  const prisma = new PrismaClient();

  // Validate and prepare data
  const persons: AddPersonData[] = [];
  for (const row of personsArray) {
    const updatedRow = {
      phoneOne: row.phoneOne.toString(),
      phoneTwo: row.phoneTwo ? row.phoneTwo.toString() : null,
      IdNumber: row.IdNumber.toString(),
      firstName: row.firstName,
      lastName: row.lastName,
      password: row.phoneOne.toString(),
    };
    const validation = addPersonSchema.safeParse(updatedRow);
    if (!validation.success) {
      throw new Error(
        `Validation error: ${validation.error.errors
          .map((e) => e.message)
          .join(", ")}`
      );
    }

    const hashedPassword = await hashPassword(validation.data.password);

    persons.push({
      IdNumber: validation.data.IdNumber,
      firstName: validation.data.firstName,
      lastName: validation.data.lastName,
      phoneOne: validation.data.phoneOne,
      phoneTwo: validation.data.phoneTwo,
      password: hashedPassword,
    });
  }

  // Transaction: Check duplicates and insert non-duplicates
  return await prisma.$transaction(async (tx) => {
    let insertedCount = 0;
    const skippedIdNumbers: string[] = [];

    for (const person of persons) {
      // Check for duplicate IdNumber
      const existingPerson = await tx.person.findUnique({
        where: { IdNumber: person.IdNumber },
        select: { id: true },
      });

      if (existingPerson) {
        skippedIdNumbers.push(person.IdNumber);
        continue;
      }

      // Insert the non-duplicate row
      await tx.person.create({ data: person });
      insertedCount += 1;
    }

    return {
      message: "Successfully added new persons.",
      count: insertedCount,
      skippedIdNumbers,
    };
  });
}

export default async function addPersonsFromFile(data: AddPersonData[]) {
  return handleServerAction<AddPersonResponse>((user) =>
    createPersons(data, user)
  );
}
