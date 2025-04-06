import { SidebarMenuButton, SidebarMenuItem } from "../../ui/sidebar";
import Link from "next/link";
import { DollarSign, Store, User, PlusCircle } from "lucide-react";

function AdminPaymentPanel() {
  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/all-payments">
            <DollarSign className="ml-2 h-4 w-4" />
            <span>لیست تمام پرداختی‌ها</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/payment-by-shop">
            <Store className="ml-2 h-4 w-4" />
            <span>پرداختی‌های یک واحد</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/payment-by-person">
            <User className="ml-2 h-4 w-4" />
            <span>پرداختی‌های یک شخص</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/add-payment">
            <PlusCircle className="ml-2 h-4 w-4" />
            <span>ثبت پرداختی</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );
}

export default AdminPaymentPanel;
