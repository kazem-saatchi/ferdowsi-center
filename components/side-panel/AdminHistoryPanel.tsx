import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import Link from "next/link";
import { ClipboardList } from "lucide-react";

function AdminHistoryPanel() {
  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/all-shop-history">
            <ClipboardList className="mr-2 h-4 w-4" />
            <span>All History</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/history-by-shop">
            <ClipboardList className="mr-2 h-4 w-4" />
            <span>Shop History</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/history-by-person">
            <ClipboardList className="mr-2 h-4 w-4" />
            <span>Person History</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );
}

export default AdminHistoryPanel;
