import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
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
import { Separator } from "../ui/separator";

function AdminChargePanel() {
  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/all-charges-list">
            <DollarSign className="ml-2 h-4 w-4" />
            <span>لیست تمام شارژها</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/find-charge-by-shop">
            <Store className="ml-2 h-4 w-4" />
            <span>شارژهای یک واحد</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/find-charge-by-person">
            <User className="ml-2 h-4 w-4" />
            <span>شارژهای یک شخص</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/add-charges-all-shops">
            <Zap className="ml-2 h-4 w-4" />
            <span>ثبت شارژ ماهانه به واحدها</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/add-charge-to-shop">
            <PlusCircle className="ml-2 h-4 w-4" />
            <span>ثبت شارژ ماهانه یک واحد</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/add-charge-by-amount">
            <DollarSign className="ml-2 h-4 w-4" />
            <span>ثبت شارژ یک واحد با مبلغ</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <Separator />
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/all-charge-reference">
            <List className="ml-2 h-4 w-4" />
            <span>لیست شارژ ماهانه</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/generate-charge-list">
            <FileText className="ml-2 h-4 w-4" />
            <span>ساخت لیست شارژ ماهانه</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/generate-annual-charge-list">
            <House className="ml-2 h-4 w-4" />
            <span>ساخت لیست شارژ مالکانه</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );
}

export default AdminChargePanel;
