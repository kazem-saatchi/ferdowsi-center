import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Separator } from "../ui/separator";
import Link from "next/link";
import { House, User } from "lucide-react";
import { Person } from "@prisma/client";

function UserSidePanel({ person }: { person?: Person }) {
  return (
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
                <span> اطلاعات کاربر </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <Separator />
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/user/my-shops">
                <House className="mr-2 h-4 w-4" />
                <span> واحد‌های من </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}

export default UserSidePanel;
