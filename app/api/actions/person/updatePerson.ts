"use server";

import { db } from "@/lib/db";
import { updatePersonData, updatePersonSchema } from "@/schema/userSchemas";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person } from "@prisma/client";

interface updatePersonResponse {
  lastName: string;
  personId: string;
  message: string;
}

async function updatePerson(data: updatePersonData, person: Person) {
  // Only admins or authorized roles can update new people
  if (person.role !== "ADMIN") {
    throw new Error(errorMSG.noPermission);
  }

  // Validate input
  const validation = updatePersonSchema.safeParse(data);
  if (!validation.success) {
    throw new Error(
      validation.error.errors.map((err) => err.message).join(", ")
    );
  }

  // Check for duplicate IdNumber
  const updatedPerson = await db.person.update({
    where: { IdNumber: validation.data.IdNumber },
    data: {
      IdNumber: validation.data.IdNumber,
      firstName: validation.data.firstName,
      lastName: validation.data.lastName,
      phoneOne: validation.data.phoneOne,
      phoneTwo: validation.data.phoneTwo,
      isActive: validation.data.isActive,
    },
  });

  return {
    personId: updatedPerson.IdNumber,
    message: successMSG.personUpdated,
    lastName: updatedPerson.lastName,
  };
}

export default async function updatePersonInfo(data: updatePersonData) {
  return handleServerAction<updatePersonResponse>((user) =>
    updatePerson(data, user)
  );
}
