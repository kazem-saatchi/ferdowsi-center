"use server";

import { db } from "@/lib/db";
import {
  UpdatePersonRoleData,
  updatePersonRoleSchema,
} from "@/schema/personSchema";
import { adminWriteAction } from "@/utils/handleServerAction";
import { successMSG } from "@/utils/messages";
import { Person } from "@prisma/client";

interface updatePersonResponse {
  lastName: string;
  message: string;
}

async function updatePerson(data: UpdatePersonRoleData, person: Person) {
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

export default async function updatePersonRole(data: UpdatePersonRoleData) {
  return adminWriteAction<updatePersonResponse>((user) =>
    updatePerson(data, user)
  );
}
