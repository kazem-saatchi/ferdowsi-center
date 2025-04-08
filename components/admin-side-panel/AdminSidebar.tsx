"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Home, Shield } from "lucide-react";
import { Separator } from "../ui/separator";
import Link from "next/link";
import AdminImportPanel from "./panels/AdminImportPanel";
import LogoutButton from "../LogoutButton";
import { cn } from "@/lib/utils";
import SidebarItemsMap from "./panels/SidebarItemMap";
import { adminMenuData } from "./panels/menuData";

function AdminSidebar() {
  const { open } = useSidebar();
  return (
    <Sidebar side="right" variant="floating">
      <SidebarHeader className="">
        <div className="flex flex-row items-center justify-start">
          <Shield />
          <span
            className={cn("hidden text-lg font-semibold p-1", open && "flex")}
          >
            پنل مدیریت
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="no-scrollbar overflow-y-auto">
        <Separator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/admin/dashboard">
                <Home className="h-4 w-4" />
                <span>دشبورد</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <Separator />

          <SidebarItemsMap menuData={adminMenuData.person} />
          <Separator />

          <SidebarItemsMap menuData={adminMenuData.shop} />
          <Separator />

          <SidebarItemsMap menuData={adminMenuData.charge} />
          <Separator />

          <SidebarItemsMap menuData={adminMenuData.payment} />
          <Separator />

          <SidebarItemsMap menuData={adminMenuData.balance} />
          <Separator />

          <SidebarItemsMap menuData={adminMenuData.history} />
          <Separator />

          <SidebarItemsMap menuData={adminMenuData.cost} />
          <Separator />
          <AdminImportPanel />
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <LogoutButton />
      </SidebarFooter>
    </Sidebar>
  );
}

export default AdminSidebar;
