"use server";

import { db } from "@/lib/db";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { SafePerson } from "@/schema/personSchema";

interface findPersonResponse {
  person: SafePerson;
  message: string;
}

async function findPerson(id: string, user: SafePerson) {
  // check authentication
  if (!user) {
    throw new Error(errorMSG.unauthorized);
  }

  // find Person by Id
  const person = await db.person.findUnique({
    where: { IdNumber: id },
    omit: { password: true },
  });
  if (!person) {
    throw new Error(errorMSG.personIdNotFound);
  }

  return { message: successMSG.personIdFound, person: person };
}

export default async function findPersonById(id: string) {
  return handleServerAction<findPersonResponse>((user) =>
    findPerson(id, user)
  );
}
