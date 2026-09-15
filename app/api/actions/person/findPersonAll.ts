"use server";

import { db } from "@/lib/db";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { SafePerson } from "@/schema/personSchema";

interface findPersonsAllResponse {
  persons: SafePerson[];
  message: string;
}

async function findPersons(user: SafePerson) {
  // check authentication
  if (user.role !== "ADMIN" && user.role !== "MANAGER") {
    throw new Error(errorMSG.unauthorized);
  }

  // find Persons
  const persons = await db.person.findMany({
    where: { visable: true },
    omit: { password: true },
  });

  return { message: successMSG.personIdFound, persons: persons };
}

export default async function findPersonAll() {
  return handleServerAction<findPersonsAllResponse>((user) =>
    findPersons(user)
  );
}
