"use server";

import { db } from "@/lib/db";
import { Person } from "@prisma/client";
import { cookies } from "next/headers";

export interface AuthResult {
  success: boolean;
  message: string;
  person?: Person | null;
}

export async function verifyToken(): Promise<AuthResult> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return { success: false, message: "user session" };
    }

    const session = await db.session.findUnique({ where: { id: token } });

    if (!session) {
      return { success: false, message: "userNotFound" };
    }

    const person = await db.person.findUnique({
      where: { id: session.personId },
    });

    return { success: true, message: "user verified", person };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    } else {
      return { success: false, message: "unauthorized" };
    }
  }
}
