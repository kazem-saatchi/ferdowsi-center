// utils/handleServerAction.ts
//
// Not a "use server" module on purpose: every export of such a module becomes
// an endpoint the browser can call. This is a helper the actions call, not an
// action itself.

import { Person, Role } from "@prisma/client";
import { SafePerson } from "@/schema/personSchema";
import { verifyToken } from "./auth";
import { ADMIN_PANEL_ROLES, hasRole, WRITE_ROLES } from "./permissions";
import { errorMSG, successMSG } from "./messages";

export interface ActionResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ServerActionOptions {
  /** Roles allowed to run the action — `WRITE_ROLES` or `ADMIN_PANEL_ROLES`
   *  from `utils/permissions`. Leave it out only when the action decides on
   *  its own, e.g. a user reading their own shop. */
  allow?: readonly Role[];
}

/** `verifyToken` no longer reads the bcrypt hash, so the user handed to an
 *  action is a `SafePerson`. `TUser` still defaults to `Person` because most
 *  actions annotate their parameter that way; no action reads `password`, so
 *  the default is only a source-compatibility shim. Narrow an action to
 *  `SafePerson` and it keeps working — once they all have, the default and the
 *  assertion below can go. */
export async function handleServerAction<T, TUser extends SafePerson = Person>(
  action: (user: TUser) => Promise<T>,
  options: ServerActionOptions = {}
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

    if (options.allow && !hasRole(authResult.person.role, options.allow)) {
      return {
        success: false,
        message: errorMSG.noPermission,
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
    const message =
      error instanceof Error ? error.message : errorMSG.unknownError;
    return {
      success: false,
      message: message,
    };
  }
}

/** An admin-panel action that changes data: ADMIN only. Every action that
 *  creates, updates or deletes goes through this — the policy test in
 *  __tests__/auth/actionPermissions.test.ts fails otherwise. */
export async function adminWriteAction<T, TUser extends SafePerson = Person>(
  action: (user: TUser) => Promise<T>
): Promise<ActionResponse<T>> {
  return handleServerAction(action, { allow: WRITE_ROLES });
}

/** An admin-panel action that only reads: ADMIN and MANAGER. */
export async function adminReadAction<T, TUser extends SafePerson = Person>(
  action: (user: TUser) => Promise<T>
): Promise<ActionResponse<T>> {
  return handleServerAction(action, { allow: ADMIN_PANEL_ROLES });
}
