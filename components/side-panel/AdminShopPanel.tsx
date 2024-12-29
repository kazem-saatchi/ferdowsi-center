import React from "react";
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import Link from "next/link";
import { ShoppingBag, ToggleLeft, UserCheck, UserX } from "lucide-react";
import { Separator } from "../ui/separator";

function AdminShopPanel() {
  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/add-shop">
            <ShoppingBag className="mr-2 h-4 w-4" />
            <span>Add Shop</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/all-shops">
            <ShoppingBag className="mr-2 h-4 w-4" />
            <span>All Shops</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/edit-shop">
            <ShoppingBag className="mr-2 h-4 w-4" />
            <span>Update Shop</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <Separator />
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/update-shop-owner">
            <UserCheck className="mr-2 h-4 w-4" />
            <span>Update Shop Owner</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/update-shop-renter">
            <UserX className="mr-2 h-4 w-4" />
            <span>Update Shop Renter</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/remove-shop-renter">
            <UserX className="mr-2 h-4 w-4" />
            <span>Remove Shop Renter</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/update-shop-status">
            <ToggleLeft className="mr-2 h-4 w-4" />
            <span>Update Shop Status</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );
}

export default AdminShopPanel;
