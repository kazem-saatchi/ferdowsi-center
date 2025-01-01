import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import Link from "next/link";
import { DollarSign, Euro, PlusCircle, UserCog } from "lucide-react";

function AdminPaymentPanel() {
  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/all-payments">
            <DollarSign className="mr-2 h-4 w-4" />
            <span>All Payments</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/payment-by-shop">
            <Euro className="mr-2 h-4 w-4" />
            <span>Payments By Shop</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/payment-by-person">
            <UserCog className="mr-2 h-4 w-4" />
            <span>Payments By Person</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/add-payment">
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>Add Payment to Shop</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );
}

export default AdminPaymentPanel;
