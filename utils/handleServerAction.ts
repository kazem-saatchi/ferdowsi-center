'use server'

import { verifyToken } from "./auth";

interface ActionResponse {
  success: boolean;
  message: string;
  data?: any;
}

export async function handleServerAction(
  action: (user: any) => Promise<any>, // Action with user context
  token: string | null // Optional token from client
): Promise<ActionResponse> {
  try {
    // Verify token and extract user data
    const user = token ? await verifyToken() : null;

    if (!user) {
      return {
        success: false,
        message: "Unauthorized access",
      };
    }

    // Execute the action with user context
    const data = await action(user);
    return {
      success: true,
      message: "Operation succeeded",
      data,
    };
  } catch (error) {
    const isProduction = process.env.NODE_ENV === "production";
    const message =
      error instanceof Error
        ? error.message
        : "An unknown error occurred.";
    return {
      success: false,
      message: isProduction ? "An error occurred." : message,
    };
  }
}
