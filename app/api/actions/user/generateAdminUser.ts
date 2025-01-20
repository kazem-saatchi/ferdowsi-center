"use server";

import { db } from "@/lib/db";
import { AddPersonData, addPersonSchema } from "@/schema/userSchemas";
import { hashPassword } from "@/utils/hashPassword";
import { errorMSG, successMSG } from "@/utils/messages";

interface AddPersonResponse {
  id: string;
  message: string;
}

export default async function createAdmin() {
  const data: AddPersonData = {
    firstName: "ADMIN",
    lastName: "ADMIN",
    IdNumber: "0000000000",
    password: "00000000",
    phoneOne: "9120000000",
    phoneTwo: null,
  };

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
      role: "ADMIN",
    },
  });

  return { message: successMSG.personAdded, id: newPerson.id };
}
