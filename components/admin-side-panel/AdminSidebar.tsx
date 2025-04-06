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
import AdminPersonPanel from "./panels/AdminPersonPanel";
import AdminShopPanel from "./panels/AdminShopPanel";
import AdminChargePanel from "./panels/AdminChargePanel";
import AdminPaymentPanel from "./panels/AdminPaymentPanel";
import AdminBalancePanel from "./panels/AdminBalancePanel";
import AdminHistoryPanel from "./panels/AdminHistoryPanel";
import AdminCostPanel from "./panels/AdminCostIncomePanel";
import AdminImportPanel from "./panels/AdminImportPanel";
import LogoutButton from "../LogoutButton";
import { cn } from "@/lib/utils";

function AdminSidebar() {
  const { open } = useSidebar();
  return (
    <Sidebar side="right" variant="floating">
      <SidebarHeader className="border-4 rounded-t-md">
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
          <AdminPersonPanel />
          <Separator />
          <AdminShopPanel />
          <Separator />
          <AdminChargePanel />
          <Separator />
          <AdminPaymentPanel />
          <Separator />
          <AdminBalancePanel />
          <Separator />
          <AdminHistoryPanel />
          <Separator />
          <AdminCostPanel />
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
