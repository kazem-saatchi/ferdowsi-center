import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import Link from "next/link";
import { Users, UserPlus, Search, UserCog } from 'lucide-react';

function AdminPersonPanel() {
  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/all-persons">
            <Users className="ml-2 h-4 w-4" />
            <span>لیست تمام اشخاص</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/add-person">
            <UserPlus className="ml-2 h-4 w-4" />
            <span>ثبت شخص جدید</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/search-persons">
            <Search className="ml-2 h-4 w-4" />
            <span>جستجوی اشخاص</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/update-person">
            <UserCog className="ml-2 h-4 w-4" />
            <span>ویرایش اطلاعات شخص</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );
}

export default AdminPersonPanel;

