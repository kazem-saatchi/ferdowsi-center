import { verifyToken } from "@/utils/auth";
import { redirect } from "next/navigation";
import { canViewAdminPanel } from "@/utils/permissions";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { success, person } = await verifyToken();
  if (success) {
    redirect(canViewAdminPanel(person?.role) ? "/admin/" : "/user/dashboard");
  }
  return <>{children}</>;
}
