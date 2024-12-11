"use server";

import { db } from "@/lib/db";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person } from "@prisma/client";

interface deletePersonResponse {
  message: string;
}

async function deletePerson(id: string, user: Person) {
  // check authentication
  if (!user) {
    throw new Error(errorMSG.unauthorized);
  }

  const person = await db.person.findUnique({ where: { id } });

  if (!person) {
    throw new Error(errorMSG.userNotFound);
  }

  // delete Persons
  await db.person.delete({ where: { id } });

  return { message: successMSG.personDeleted };
}

export default async function deletePersonById(id: string) {
  return handleServerAction<deletePersonResponse>((user) =>
    deletePerson(id, user)
  );
}
