"use server";

import { db } from "@/lib/db";
import {
  updatePersonRoleData,
  updatePersonRoleSchema,
} from "@/schema/userSchemas";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person } from "@prisma/client";

interface updatePersonResponse {
  lastName: string;
  message: string;
}

async function updatePerson(data: updatePersonRoleData, person: Person) {
  // Only admins or authorized roles can update new people
  if (person.role !== "ADMIN") {
    throw new Error(errorMSG.noPermission);
  }

  // Validate input
  const validation = updatePersonRoleSchema.safeParse(data);
  if (!validation.success) {
    throw new Error(
      validation.error.errors.map((err) => err.message).join(", ")
    );
  }

  // Check for duplicate IdNumber
  const updatedPerson = await db.person.update({
    where: { id: validation.data.userId },
    data: {
      role: validation.data.role,
    },
  });

  return {
    message: successMSG.personUpdated,
    lastName: updatedPerson.lastName,
  };
}

export default async function updatePersonRole(data: updatePersonRoleData) {
  return handleServerAction<updatePersonResponse>((user) =>
    updatePerson(data, user)
  );
}
