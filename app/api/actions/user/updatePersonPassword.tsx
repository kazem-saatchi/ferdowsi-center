"use server";

import { db } from "@/lib/db";
import {
  updatePersonPassword,
  UpdatePersonPasswordData,
} from "@/schema/personSchema";
import { handleServerAction } from "@/utils/handleServerAction";
import { comparePassword, hashPassword } from "@/utils/hashPassword";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person } from "@prisma/client";

interface AddPersonResponse {
  message: string;
}

async function updatePassword(data: UpdatePersonPasswordData, person: Person) {
  // Validate input
  const validation = updatePersonPassword.safeParse(data);
  if (!validation.success) {
    throw new Error(
      validation.error.errors.map((err) => err.message).join(", ")
    );
  }

  // find the user
  const existingPerson = await db.person.findUnique({
    where: { id: validation.data.userId },
  });

  if (!existingPerson) {
    throw new Error(errorMSG.userNotFound);
  }

  const isPasswordValid = await comparePassword(
    validation.data.currentPassword,
    existingPerson.password
  );

  // Only admins and the user can update the user password
  if (person.role !== "ADMIN" && person.id !== validation.data.userId) {
    throw new Error(errorMSG.noPermission);
  }

  // Regular users must enter their current password correctly
  if (!isPasswordValid && person.role !== "ADMIN") {
    throw new Error(errorMSG.invalidPassword);
  }

  // Hash password and create person
  const hashedPassword = await hashPassword(validation.data.password);

  await db.person.update({
    where: { id: existingPerson.id },
    data: {
      password: hashedPassword,
    },
  });

  return { message: successMSG.passwordUpdted };
}

export default async function updateUserPassword(
  data: UpdatePersonPasswordData
) {
  return handleServerAction<AddPersonResponse>((user) =>
    updatePassword(data, user)
  );
}
