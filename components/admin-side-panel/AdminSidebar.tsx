"use client";

import { Fragment, useState } from "react";
import { Sidebar, SidebarContent, SidebarMenu } from "@/components/ui/sidebar";
import { Separator } from "../ui/separator";
import SidebarItemsMap from "./panels/SidebarItemMap";
import { adminMenuData } from "./panels/menuData";
import AdminDashboardPanel from "./panels/AdminDashboardPanel";
import SidebarBrand from "@/components/layout/SidebarBrand";
import AccountMenu from "@/components/layout/AccountMenu";
import { labels } from "@/utils/label";

const groupOrder = [
  "person",
  "shop",
  "charge",
  "payment",
  "balance",
  "history",
  "cost",
  "import",
  "bank",
  "operation",
] as const;

function AdminSidebar() {
  // Opening a group closes the one that was open.
  const [openGroup, setOpenGroup] = useState<
    (typeof groupOrder)[number] | null
  >(null);
  return (
    <Sidebar side="right" variant="floating">
      <SidebarBrand areaTitle={labels.adminPanel} />
      <SidebarContent className="no-scrollbar overflow-y-auto">
        <Separator />
        <SidebarMenu>
          <AdminDashboardPanel />
          <Separator />
          {groupOrder.map((key) => (
            <Fragment key={key}>
              <SidebarItemsMap
                menuData={adminMenuData[key]}
                open={openGroup === key}
                onToggle={() =>
                  setOpenGroup((current) => (current === key ? null : key))
                }
              />
              <Separator />
            </Fragment>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <AccountMenu area="admin" />
    </Sidebar>
  );
}

export default AdminSidebar;
