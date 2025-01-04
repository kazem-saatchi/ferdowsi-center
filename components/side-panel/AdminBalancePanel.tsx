import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import Link from "next/link";
import { DollarSign, Euro, PlusCircle, UserCog } from "lucide-react";

function AdminBalancePanel() {
  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/all-shops-balance">
            <DollarSign className="mr-2 h-4 w-4" />
            <span>All Shops Balance</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/shop-balance">
            <Euro className="mr-2 h-4 w-4" />
            <span>Balance By Shop</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );
}

export default AdminBalancePanel;
