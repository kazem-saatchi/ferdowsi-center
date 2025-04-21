import { verifyToken } from "@/utils/auth";
import { redirect } from "next/navigation";

export default async function UserServerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { success } = await verifyToken();
  if (!success) {
    redirect("/");
  }

  return <>{children}</>;
}
