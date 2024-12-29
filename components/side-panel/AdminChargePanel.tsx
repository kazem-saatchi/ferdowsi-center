import React from "react";
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import Link from "next/link";
import {
  DollarSign,
  Euro,
  FileText,
  List,
  PlusCircle,
  UserCog,
  Zap,
} from "lucide-react";
import { Separator } from "../ui/separator";

function AdminChargePanel() {
  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/all-charges-list">
            <DollarSign className="mr-2 h-4 w-4" />
            <span>All Charges</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/find-charge-by-shop">
            <Euro className="mr-2 h-4 w-4" />
            <span>Charges By Shop</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/find-charge-by-person">
            <UserCog className="mr-2 h-4 w-4" />
            <span>Charges By Person</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/add-charges-all-shops">
            <Zap className="mr-2 h-4 w-4" />
            <span>Add Charges to All Shops</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/add-charge-to-shop">
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>Add Charge to Shop</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <Separator />
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/all-charge-reference">
            <List className="mr-2 h-4 w-4" />
            <span>all Charge Reference</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/generate-charge-list">
            <FileText className="mr-2 h-4 w-4" />
            <span>generate Charge Reference</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );
}

export default AdminChargePanel;
