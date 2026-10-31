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
import { useCanWrite } from "@/components/auth/WriteAccess";

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
  // A read-only role does not see the pages that change data, nor a group
  // left with nothing in it (the import group).
  const canWrite = useCanWrite();
  const groups = groupOrder
    .map((key) => {
      const group = adminMenuData[key];
      const items = canWrite
        ? group.items
        : group.items.filter((item) => !item.write);
      return { key, menuData: { ...group, items } };
    })
    .filter(({ menuData }) => menuData.items.length > 0);
  return (
    <Sidebar side="right" variant="floating">
      <SidebarBrand areaTitle={labels.adminPanel} />
      <SidebarContent className="no-scrollbar overflow-y-auto">
        <Separator />
        <SidebarMenu>
          <AdminDashboardPanel />
          <Separator />
          {groups.map(({ key, menuData }) => (
            <Fragment key={key}>
              <SidebarItemsMap
                menuData={menuData}
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
