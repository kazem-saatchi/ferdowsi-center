"use server";

import { db } from "@/lib/db";
import { AddPersonData, addPersonSchema } from "@/schema/userSchemas";
import { hashPassword } from "@/utils/hashPassword";

interface ApiResponse {
  success: boolean;
  message: string;
}

async function addPerson(data: AddPersonData): Promise<ApiResponse> {
  // Validate input
  try {
    const validation = addPersonSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        message: validation.error.errors.map((err) => err.message).join(", "),
      };
    }

    // Check for existing person with the same IdNumber
    const existingPerson = await db.person.findUnique({
      where: { IdNumber: validation.data.IdNumber },
    });
    if (existingPerson) {
      return { success: false, message: "IdNumber already exists" };
    }

    // Hash password
    const hashedPassword = await hashPassword(validation.data.password);

    // Create person
    await db.person.create({
      data: {
        IdNumber: validation.data.IdNumber,
        firstName: validation.data.firstName,
        LastName: validation.data.lastName,
        phoneOne: validation.data.phoneOne,
        phoneTwo: validation.data.phoneTwo,
        password: hashedPassword,
      },
    });

    return { success: true, message: "Person Added Successfully" };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    } else {
      return { success: false, message: "Person Creation Failed" };
    }
  }
}

export default addPerson;
