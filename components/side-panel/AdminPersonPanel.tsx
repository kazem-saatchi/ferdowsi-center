import React from "react";
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import Link from "next/link";
import { Search, UserCog, UserPlus, Users } from "lucide-react";

function AdminPersonPanel() {
  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/all-persons">
            <Users className="mr-2 h-4 w-4" />
            <span>All Persons</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/add-person">
            <UserPlus className="mr-2 h-4 w-4" />
            <span>Add Person</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/search-persons">
            <Search className="mr-2 h-4 w-4" />
            <span>Search Persons</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/update-person">
            <UserCog className="mr-2 h-4 w-4" />
            <span>Update Person</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );
}

export default AdminPersonPanel;
