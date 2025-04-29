"use client";

import { Sidebar, SidebarContent, SidebarMenu } from "@/components/ui/sidebar";
import { Separator } from "../ui/separator";
import AdminImportPanel from "./panels/AdminImportPanel";
import SidebarItemsMap from "./panels/SidebarItemMap";
import { adminMenuData } from "./panels/menuData";
import AdminDashboardPanel from "./panels/AdminDashboardPanel";
import AdminPanelHeader from "./panels/AdminPanelHeader";
import AdminPanelFooter from "./panels/AdminPanelFooter";

function AdminSidebar() {
  return (
    <Sidebar side="right" variant="floating">
      <AdminPanelHeader />
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
        </SidebarMenu>
      </SidebarContent>
      <AdminPanelFooter />
    </Sidebar>
  );
}

export default AdminSidebar;
