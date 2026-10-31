import { SidebarProvider } from "@/components/ui/sidebar";
import { verifyToken } from "@/utils/auth";
import { redirect } from "next/navigation";

import AdminSidebar from "@/components/admin-side-panel/AdminSidebar";
import AppHeader from "@/components/layout/AppHeader";
import { adminPageTitles } from "@/components/admin-side-panel/panels/menuData";
import { labels } from "@/utils/label";
import { canViewAdminPanel, canWrite } from "@/utils/permissions";
import {
  AdminWriteGate,
  WriteAccessProvider,
} from "@/components/auth/WriteAccess";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { success, person } = await verifyToken();

  if (!success) {
    redirect("/");
  } else if (!canViewAdminPanel(person?.role)) {
    redirect("/user");
  }

  return (
    <WriteAccessProvider canWrite={canWrite(person?.role)}>
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AdminSidebar />
          <main className="relative m-2 min-w-0 flex-1 overflow-y-auto rounded-md border-2 no-scrollbar">
            <AppHeader areaTitle={labels.adminPanel} titles={adminPageTitles} />
            <div className="w-full px-1 py-4 md:px-2">
              <AdminWriteGate>{children}</AdminWriteGate>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </WriteAccessProvider>
  );
}
