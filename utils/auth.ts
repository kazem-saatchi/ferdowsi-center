'use server'

import { db } from "@/lib/db";
import { SafePerson } from "@/schema/personSchema";
import { cookies } from "next/headers";
import { errorMSG, successMSG } from "./messages";

export interface AuthResult {
  success: boolean;
  message: string;
  person?: SafePerson;
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

    if(session.expireAt.getTime() - new Date().getTime() <= 0) {
      return {success:false, message:errorMSG.sessionExpired}
    }

    // This result is serialized to the browser: `personQuery` calls verifyToken
    // as an RPC from a client component on every page load.
    const person = await db.person.findUnique({
      where: { id: session.personId },
      omit: { password: true },
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
