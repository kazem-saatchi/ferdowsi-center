"use server";

import { db } from "@/lib/db";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person } from "@prisma/client";

interface findPersonsAllResponse {
  persons: Person[];
  message: string;
}

async function findPersons(user: Person) {
  // check authentication
  if (user.role !== "ADMIN" && user.role !== "MANAGER") {
    throw new Error(errorMSG.unauthorized);
  }

  // find Persons
  const persons = await db.person.findMany({ where: { visable: true } });

  return { message: successMSG.personIdFound, persons: persons };
}

export default async function findPersonAll() {
  return handleServerAction<findPersonsAllResponse>((user) =>
    findPersons(user)
  );
}
