import { SidebarMenuButton, SidebarMenuItem } from "../../ui/sidebar";
import Link from "next/link";
import {  Home } from "lucide-react";

function AdminDashboardPanel() {
  return (
    <>
        <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/admin/dashboard">
                <Home className="h-4 w-4" />
                <span>داشبورد</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
    </>
  );
}

export default AdminDashboardPanel;
