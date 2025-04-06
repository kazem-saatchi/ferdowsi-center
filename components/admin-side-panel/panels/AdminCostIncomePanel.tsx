import { SidebarMenuButton, SidebarMenuItem } from "../../ui/sidebar";
import Link from "next/link";
import { BarChart2, PieChart, UserPlus } from "lucide-react";

function AdminCostPanel() {
  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/add-cost">
            <BarChart2 className="ml-2 h-4 w-4" />
            <span>ثبت هزینه</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/all-costs">
            <PieChart className="ml-2 h-4 w-4" />
            <span>لیست هزینه ها</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );
}

export default AdminCostPanel;
