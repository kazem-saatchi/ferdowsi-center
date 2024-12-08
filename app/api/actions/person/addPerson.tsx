"use server";

import { db } from "@/lib/db";
import { AddPersonData, addPersonSchema } from "@/schema/userSchemas";
import { handleServerAction } from "@/utils/handleServerAction";
import { hashPassword } from "@/utils/hashPassword";
import { Person } from "@prisma/client";

interface AddPersonResponse {
  id: string;
  message: string;
}

async function createPerson(data: AddPersonData, person: Person) {
  // Only admins or authorized roles can add new people
  if (person.role !== "ADMIN") {
    throw new Error("You do not have permission to perform this action.");
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
    throw new Error("IdNumber already exists");
  }

  // Hash password and create person
  const hashedPassword = await hashPassword(validation.data.password);

  const newPerson = await db.person.create({
    data: {
      IdNumber: validation.data.IdNumber,
      firstName: validation.data.firstName,
      LastName: validation.data.lastName,
      phoneOne: validation.data.phoneOne,
      phoneTwo: validation.data.phoneTwo,
      password: hashedPassword,
    },
  });

  return { message: "Person added successfully", id: newPerson.id };
}

export default async function addPerson(data: AddPersonData) {
  return handleServerAction<AddPersonResponse>((user) =>
    createPerson(data, user)
  );
}
