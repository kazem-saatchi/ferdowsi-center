import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { verifyToken } from "@/utils/auth";
import { House, User } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

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
        <Sidebar side="right">
          <SidebarHeader>
            <h2 className="text-xl font-bold p-4">{`${person?.firstName} ${person?.lastName}`}</h2>
          </SidebarHeader>
          <SidebarContent>
            <Separator />
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/user/user-info">
                    <User className="mr-2 h-4 w-4" />
                    <span>User Info</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <Separator />
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/user/my-shops">
                    <House className="mr-2 h-4 w-4" />
                    <span>My Shops</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 overflow-y-auto no-scrollbar p-8 items-center justify-center bg-neutral-100">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
