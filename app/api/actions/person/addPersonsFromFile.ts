"use server";

import { handleServerAction } from "@/utils/handleServerAction";
import { hashPassword } from "@/utils/hashPassword";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person, PrismaClient } from "@prisma/client";
import { AddPersonData, addPersonSchema } from "@/schema/userSchemas";

interface AddPersonResponse {
  message: string;
  count: number;
  insertedPersons: Person[];
}

async function createPersons(personsArray: AddPersonData[], person: Person) {
  // Only admins or authorized roles can add new people
  if (person.role !== "ADMIN") {
    throw new Error(errorMSG.noPermission);
  }
  console.log("data:", personsArray);

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
    const insertedPersons = [];

    for (const person of persons) {
      // Check for duplicate IdNumber
      const existingPerson = await tx.person.findUnique({
        where: { IdNumber: person.IdNumber },
      });

      if (!existingPerson) {
        // Insert the non-duplicate row
        const newPerson = await tx.person.create({ data: person });
        insertedPersons.push(newPerson);
      }
    }

    return {
      message: "Successfully added new persons.",
      count: insertedPersons.length,
      insertedPersons,
    };
  });
}

export default async function addPersonsFromFile(data: AddPersonData[]) {
  return handleServerAction<AddPersonResponse>((user) =>
    createPersons(data, user)
  );
}
