import { SidebarHeader } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import React from "react";

function AdminPanelHeader() {
  return (
    <SidebarHeader className="">
      <div className="flex flex-row items-center justify-start">
        <span className={cn("text-lg font-semibold p-1")}>پنل مدیریت</span>
      </div>
    </SidebarHeader>
  );
}

export default AdminPanelHeader;
