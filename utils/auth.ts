import { db } from "@/lib/db";
import { Person } from "@prisma/client";
import { cookies } from "next/headers";
import { errorMSG, successMSG } from "./messages";

export interface AuthResult {
  success: boolean;
  message: string;
  person?: Person;
}

export async function verifyToken(): Promise<AuthResult> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return { success: false, message: errorMSG.unauthorized };
    }

    const session = await db.session.findUnique({ where: { id: token } });

    if (!session) {
      return { success: false, message: errorMSG.unauthorized };
    }

    const person = await db.person.findUnique({
      where: { id: session.personId },
    });

    // check authentication
    if (!person) {
      return { success: false, message: errorMSG.userNotFound };
    }

    return { success: true, message: successMSG.userVerified, person };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    } else {
      return { success: false, message: errorMSG.unknownError };
    }
  }
}
