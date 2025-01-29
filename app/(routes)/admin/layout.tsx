import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { verifyToken } from "@/utils/auth";
import { Home } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import AdminPersonPanel from "@/components/side-panel/AdminPersonPanel";
import AdminShopPanel from "@/components/side-panel/AdminShopPanel";
import AdminHistoryPanel from "@/components/side-panel/AdminHistoryPanel";
import AdminChargePanel from "@/components/side-panel/AdminChargePanel";
import AdminPaymentPanel from "@/components/side-panel/AdminPaymentPanel";
import AdminBalancePanel from "@/components/side-panel/AdminBalancePanel";
import LogoutButton from "@/components/LogoutButton";
import AdminCostPanel from "@/components/side-panel/AdminCostIncomePanel";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { success, person } = await verifyToken();

  if (person?.role !== "ADMIN" || !success) {
    redirect("/");
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar side="right" variant="floating">
          <SidebarHeader>
            <div className="flex flex-row items-center justify-between">
              <h2 className="text-xl font-bold p-4">پنل مدیریت</h2>
              <LogoutButton />
            </div>
          </SidebarHeader>
          <SidebarContent className="no-scrollbar">
            <Separator />
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/dashboard">
                    <Home className="mr-2 h-4 w-4" />
                    <span>دشبورد</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <Separator />
              <AdminPersonPanel />
              <Separator />
              <AdminShopPanel />
              <Separator />
              <AdminChargePanel />
              <Separator />
              <AdminPaymentPanel />
              <Separator />
              <AdminBalancePanel />
              <Separator />
              <AdminHistoryPanel />
              <Separator />
              <AdminCostPanel />
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 overflow-y-auto no-scrollbar items-center justify-center bg-neutral-100 m-2 rounded-md border-2 relative">
          <SidebarTrigger
            className="absolute top-2 right-2  w-8 h-8"
            variant="outline"
          />
          <div className="p-8 pt-12">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
