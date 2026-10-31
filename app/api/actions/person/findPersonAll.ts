"use server";

import { db } from "@/lib/db";
import { adminReadAction } from "@/utils/handleServerAction";
import { successMSG } from "@/utils/messages";
import { SafePerson } from "@/schema/personSchema";

interface findPersonsAllResponse {
  persons: SafePerson[];
  message: string;
}

async function findPersons(user: SafePerson) {
  // find Persons
  const persons = await db.person.findMany({
    where: { visable: true },
    omit: { password: true },
  });

  return { message: successMSG.personIdFound, persons: persons };
}

export default async function findPersonAll() {
  return adminReadAction<findPersonsAllResponse>((user) =>
    findPersons(user)
  );
}
