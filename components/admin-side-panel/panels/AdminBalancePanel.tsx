import { SidebarMenuButton, SidebarMenuItem } from "../../ui/sidebar";
import Link from "next/link";
import { BarChart2, PieChart, UserPlus } from "lucide-react";

function AdminBalancePanel() {
  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/all-shops-balance">
            <BarChart2 className="ml-2 h-4 w-4" />
            <span>حساب همه واحدها</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/shop-balance">
            <PieChart className="ml-2 h-4 w-4" />
            <span>حساب یک واحد</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/person-balance">
            <UserPlus className="ml-2 h-4 w-4" />
            <span>حساب یک شخص</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );
}

export default AdminBalancePanel;
