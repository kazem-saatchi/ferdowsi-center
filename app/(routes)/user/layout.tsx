import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { verifyToken } from "@/utils/auth";
import { House, User } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import UserSidePanel from "@/components/user-side-panel/UserSidePanel";

export default async function UserServerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { success, person } = await verifyToken();
  if (!success) {
    redirect("/");
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <UserSidePanel person={person} />
        <main className="flex-1 overflow-y-auto no-scrollbar items-center justify-center bg-neutral-100 m-2 rounded-md border-2 relative">
          <SidebarTrigger
            className="absolute top-2 right-2 w-8 h-8"
            variant="outline"
          />
          <div className="p-8 pt-12">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
