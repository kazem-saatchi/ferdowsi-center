"use client";

import { Sidebar, SidebarContent, SidebarMenu } from "@/components/ui/sidebar";
import { Separator } from "../ui/separator";
import SidebarItemsMap from "./panels/SidebarItemMap";
import { adminMenuData } from "./panels/menuData";
import AdminDashboardPanel from "./panels/AdminDashboardPanel";
import SidebarBrand from "@/components/layout/SidebarBrand";
import AccountMenu from "@/components/layout/AccountMenu";
import { labels } from "@/utils/label";

function AdminSidebar() {
  return (
    <Sidebar side="right" variant="floating">
      <SidebarBrand areaTitle={labels.adminPanel} />
      <SidebarContent className="no-scrollbar overflow-y-auto">
        <Separator />
        <SidebarMenu>
          <AdminDashboardPanel />
          <Separator />
          <SidebarItemsMap menuData={adminMenuData.person} />
          <Separator />
          <SidebarItemsMap menuData={adminMenuData.shop} />
          <Separator />
          <SidebarItemsMap menuData={adminMenuData.charge} />
          <Separator />
          <SidebarItemsMap menuData={adminMenuData.payment} />
          <Separator />
          <SidebarItemsMap menuData={adminMenuData.balance} />
          <Separator />
          <SidebarItemsMap menuData={adminMenuData.history} />
          <Separator />
          <SidebarItemsMap menuData={adminMenuData.cost} />
          <Separator />
          <SidebarItemsMap menuData={adminMenuData.import} />
          <Separator />
          <SidebarItemsMap menuData={adminMenuData.bank} />
          <Separator />
          <SidebarItemsMap menuData={adminMenuData.operation} />
          <Separator />
        </SidebarMenu>
      </SidebarContent>
      <AccountMenu area="admin" />
    </Sidebar>
  );
}

export default AdminSidebar;
