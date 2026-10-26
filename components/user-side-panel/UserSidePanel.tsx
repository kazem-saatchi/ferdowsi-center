import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Separator } from "../ui/separator";
import Link from "next/link";
import {
  Banknote,
  House,
  User,
  ShieldPlus,
  SquareChartGantt,
} from "lucide-react";
import { labels } from "@/utils/label";
import SidebarBrand from "@/components/layout/SidebarBrand";
import AccountMenu from "@/components/layout/AccountMenu";

function UserSidePanel() {
  return (
    <Sidebar side="right" variant="floating">
      <SidebarBrand areaTitle={labels.personalAccount} />
      <SidebarContent>
        <Separator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/user/dashboard">
                <SquareChartGantt className="me-2 h-4 w-4" />
                <span>{labels.userDashboard}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/user/my-shops">
                <House className="me-2 h-4 w-4" />
                <span>{labels.myUnits}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/user/building-info/bank-report">
                <Banknote className="me-2 h-4 w-4" />
                <span>{labels.buildingBankReport}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <Separator />
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/user/user-info">
                <User className="me-2 h-4 w-4" />
                <span>{labels.userInfo}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/user/update-password">
                <ShieldPlus className="me-2 h-4 w-4" />
                <span>{labels.updatePassword}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <Separator />
        </SidebarMenu>
      </SidebarContent>
      <AccountMenu area="user" />
    </Sidebar>
  );
}

export default UserSidePanel;
