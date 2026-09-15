"use server";

import { Person } from "@prisma/client";
import { SafePerson } from "@/schema/personSchema";
import { verifyToken } from "./auth";
import { errorMSG, successMSG } from "./messages";

// utils/handleServerAction.ts
export interface ActionResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

/** `verifyToken` no longer reads the bcrypt hash, so the user handed to an
 *  action is a `SafePerson`. `TUser` still defaults to `Person` because most
 *  actions annotate their parameter that way; no action reads `password`, so
 *  the default is only a source-compatibility shim. Narrow an action to
 *  `SafePerson` and it keeps working — once they all have, the default and the
 *  assertion below can go. */
export async function handleServerAction<T, TUser extends SafePerson = Person>(
  action: (user: TUser) => Promise<T>
): Promise<ActionResponse<T>> {
  try {
    // Verify token and extract user data
    const authResult = (await verifyToken()) || null;

    if (!authResult.person || !authResult.success) {
      return {
        success: false,
        message: errorMSG.unauthorized,
      };
    }

    // Execute the action with user context
    const data = await action(authResult.person as TUser);
    return {
      success: true,
      message: successMSG.actionSucceeded,
      data,
    };
  } catch (error) {
    const isProduction = process.env.NODE_ENV === "production";
    const message =
      error instanceof Error ? error.message : errorMSG.unknownError;
    return {
      success: false,
      message: message,
    };
  }
}
