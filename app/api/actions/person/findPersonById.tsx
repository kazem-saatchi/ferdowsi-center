"use server";

import { db } from "@/lib/db";
import {
  findPersonByIdData,
  findPersonByIdSchema,
} from "@/schema/userSchemas";
import { handleServerAction } from "@/utils/handleServerAction";
import { Person } from "@prisma/client";

interface findPersonResponse {
  person: Person;
  message: string;
}

async function findPerson(data: findPersonByIdData, user: Person) {
  
  // check authentication
  if (!user) {
    throw new Error("please login first");
  }

  // Validate input
  const validation = findPersonByIdSchema.safeParse(data);
  if (!validation.success) {
    throw new Error(
      validation.error.errors.map((err) => err.message).join(", ")
    );
  }

  // find Person by Id
  const person = await db.person.findUnique({
    where: { IdNumber: validation.data.IdNumber },
  });
  if (!person) {
    throw new Error("person by Id not found");
  }


  return { message: "Person finded successfully",person:person };
}

export default async function findPersonById(data: findPersonByIdData) {
  return handleServerAction<findPersonResponse>((user) => findPerson(data, user));
}
