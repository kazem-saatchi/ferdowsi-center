import type { Role } from "@prisma/client";
import { labels } from "@/utils/label";

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: labels.admin,
  MANAGER: labels.manager,
  STAFF: labels.staff,
  USER: labels.user,
};

export function roleLabel(role: Role | null | undefined): string {
  return role ? ROLE_LABELS[role] : labels.user;
}
