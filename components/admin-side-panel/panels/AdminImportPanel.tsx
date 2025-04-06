import { SidebarMenuButton, SidebarMenuItem } from "../../ui/sidebar";
import Link from "next/link";
import { FileChartColumn } from "lucide-react";
import { Separator } from "../../ui/separator";

function AdminImportPanel() {
  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/admin/import-persons-shops">
            <FileChartColumn className="ml-2 h-4 w-4" />
            <span>ثبت اشخاص و واحدها با فایل</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );
}

export default AdminImportPanel;
