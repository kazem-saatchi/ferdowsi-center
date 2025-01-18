import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import Link from "next/link";
import { ClipboardList, Store, User } from 'lucide-react';

function AdminHistoryPanel() {
  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/all-shop-history">
            <ClipboardList className="ml-2 h-4 w-4" />
            <span>لیست تمام تاریخچه</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/history-by-shop">
            <Store className="ml-2 h-4 w-4" />
            <span>تاریخچه یک واحد</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/history-by-person">
            <User className="ml-2 h-4 w-4" />
            <span>تاریخچه یک شخص</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );
}

export default AdminHistoryPanel;

