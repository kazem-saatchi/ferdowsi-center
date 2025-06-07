"use server";

import { db } from "@/lib/db";
import { AddPersonData, addPersonSchema } from "@/schema/personSchema";
import { handleServerAction } from "@/utils/handleServerAction";
import { hashPassword } from "@/utils/hashPassword";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person } from "@prisma/client";

interface AddPersonResponse {
  id: string;
  message: string;
}

async function createPerson(data: AddPersonData, person: Person) {
  // Only admins or authorized roles can add new people
  if (person.role !== "ADMIN") {
    throw new Error(errorMSG.noPermission);
  }

  // Validate input
  const validation = addPersonSchema.safeParse(data);
  if (!validation.success) {
    throw new Error(
      validation.error.errors.map((err) => err.message).join(", ")
    );
  }

  // Check for duplicate IdNumber
  const existingPerson = await db.person.findUnique({
    where: { IdNumber: validation.data.IdNumber },
  });
  if (existingPerson) {
    throw new Error(errorMSG.duplicateId);
  }

  // Hash password and create person
  const hashedPassword = await hashPassword(validation.data.password);

  const newPerson = await db.person.create({
    data: {
      IdNumber: validation.data.IdNumber,
      firstName: validation.data.firstName,
      lastName: validation.data.lastName,
      phoneOne: validation.data.phoneOne,
      phoneTwo: validation.data.phoneTwo,
      password: hashedPassword,
    },
  });

  return { message: successMSG.personAdded, id: newPerson.id };
}

export default async function addPerson(data: AddPersonData) {
  return handleServerAction<AddPersonResponse>((user) =>
    createPerson(data, user)
  );
}
