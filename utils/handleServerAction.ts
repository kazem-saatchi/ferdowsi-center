"use server";

import { Person } from "@prisma/client";
import { verifyToken } from "./auth";

// utils/handleServerAction.ts
interface ActionResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export async function handleServerAction<T>(
  action: (user: Person) => Promise<T>
): Promise<ActionResponse<T>> {
  try {
    // Verify token and extract user data
    const authResult = await verifyToken() || null;

    if (!authResult.person || !authResult.success) {
      return {
        success: false,
        message: "Unauthorized access",
      };
    }

    // Execute the action with user context
    const data = await action(authResult.person);
    return {
      success: true,
      message: "Operation succeeded",
      data,
    };
  } catch (error) {
    const isProduction = process.env.NODE_ENV === "production";
    const message =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return {
      success: false,
      message: isProduction ? "An error occurred." : message,
    };
  }
}
