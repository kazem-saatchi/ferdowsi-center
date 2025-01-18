import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import Link from "next/link";
import { ShoppingBag, ToggleLeft, UserCheck, UserX, PlusSquare, List, Edit } from 'lucide-react';
import { Separator } from "../ui/separator";

function AdminShopPanel() {
  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/add-shop">
            <PlusSquare className="ml-2 h-4 w-4" />
            <span>افزودن واحد جدید</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/all-shops">
            <List className="ml-2 h-4 w-4" />
            <span>لیست تمام واحدها</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/edit-shop">
            <Edit className="ml-2 h-4 w-4" />
            <span>ویرایش اطلاعات</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <Separator />
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/update-shop-owner">
            <UserCheck className="ml-2 h-4 w-4" />
            <span>ثبت مالک جدید برای یک واحد</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/update-shop-renter">
            <ShoppingBag className="ml-2 h-4 w-4" />
            <span>ثبت مستاجر جدید برای یک واحد</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/remove-shop-renter">
            <UserX className="ml-2 h-4 w-4" />
            <span>حذف مستاجر یک واحد</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/update-shop-status">
            <ToggleLeft className="ml-2 h-4 w-4" />
            <span>فعال / غیر فعال کردن یک واحد</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );
}

export default AdminShopPanel;

