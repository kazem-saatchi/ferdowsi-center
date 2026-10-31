import type { Role } from "@prisma/client";

// The one place that says who may do what. Server actions pass one of these
// lists to `handleServerAction`, and the admin UI uses the same lists to hide
// what a role cannot do — the UI check is a convenience, the action is the gate.
//
// Plain module with type-only imports, so client components can use it too.

/** May open the admin panel and read everything in it. */
export const ADMIN_PANEL_ROLES: readonly Role[] = ["ADMIN", "MANAGER"];

/** May change data. MANAGER (the board) can look but not touch. */
export const WRITE_ROLES: readonly Role[] = ["ADMIN"];

export function hasRole(
  role: Role | null | undefined,
  allowed: readonly Role[]
): boolean {
  return !!role && allowed.includes(role);
}

export function canViewAdminPanel(role: Role | null | undefined): boolean {
  return hasRole(role, ADMIN_PANEL_ROLES);
}

export function canWrite(role: Role | null | undefined): boolean {
  return hasRole(role, WRITE_ROLES);
}
