import { SidebarMenuButton, SidebarMenuItem } from "../../ui/sidebar";
import Link from "next/link";
import {
  DollarSign,
  Store,
  User,
  Zap,
  PlusCircle,
  List,
  FileText,
  House,
} from "lucide-react";
import { Separator } from "../../ui/separator";

function AdminChargePanel() {
  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/all-charges-list">
            <DollarSign className="h-4 w-4" />
            <span className="mr-2">لیست تمام شارژها</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/find-charge-by-shop">
            <Store className="h-4 w-4" />
            <span className="mr-2">شارژهای یک واحد</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/find-charge-by-person">
            <User className="h-4 w-4" />
            <span className="mr-2">شارژهای یک شخص</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/add-charges-all-shops">
            <Zap className="h-4 w-4" />
            <span className="mr-2">ثبت شارژ ماهانه به واحدها</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/add-charge-to-shop">
            <PlusCircle className="h-4 w-4" />
            <span className="mr-2">ثبت شارژ ماهانه یک واحد</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/add-charge-by-amount">
            <DollarSign className="h-4 w-4" />
            <span className="mr-2">ثبت شارژ یک واحد با مبلغ</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <Separator />
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/all-charge-reference">
            <List className="h-4 w-4" />
            <span className="mr-2">لیست شارژ ماهانه</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/generate-charge-list">
            <FileText className="h-4 w-4" />
            <span className="mr-2">ساخت لیست شارژ ماهانه</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/generate-annual-charge-list">
            <House className="h-4 w-4" />
            <span className="mr-2">ساخت لیست شارژ مالکانه</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );
}

export default AdminChargePanel;
