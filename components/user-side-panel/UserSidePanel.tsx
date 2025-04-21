import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Separator } from "../ui/separator";
import Link from "next/link";
import { House, User, ShieldPlus } from "lucide-react";
import { Person } from "@prisma/client";
import UserPanelFooter from "./UserPanelFooter";
import UserPanelHeader from "./UserPanelHeader";

function UserSidePanel() {
  return (
    <Sidebar side="right" variant="floating">
      <UserPanelHeader />
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
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/user/update-password">
                <ShieldPlus className="mr-2 h-4 w-4" />
                <span> تغییر رمز عبور </span>
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
      <UserPanelFooter />
    </Sidebar>
  );
}

export default UserSidePanel;
