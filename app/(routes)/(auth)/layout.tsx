import { verifyToken } from "@/utils/auth";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { success, person } = await verifyToken();
  if (person?.role !== "ADMIN" && success) {
    redirect("/user/dashboard");
  } else if (person?.role === "ADMIN" && success) {
    redirect("/admin/");
  }
  return <>{children}</>;
}
