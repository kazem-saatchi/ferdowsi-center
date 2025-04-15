import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { verifyToken } from "@/utils/auth";
import { redirect } from "next/navigation";

import AdminSidebar from "@/components/admin-side-panel/AdminSidebar";
import { cn } from "@/lib/utils";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { success, person } = await verifyToken();

  if (!success) {
    redirect("/");
  } else if (person?.role !== "ADMIN") {
    redirect("/user");
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div
          className={cn(
            "flex flex-row flex-1 items-start justify-start",
            "overflow-y-auto no-scrollbar",
            " bg-neutral-100 m-2 rounded-md border-2 relative"
          )}
        >
          <SidebarTrigger className=" mt-2 mr-2 w-8 h-8" variant="outline" />
          <div className="p-4 w-full items-center">{children}</div>
        </div>
      </div>
    </SidebarProvider>
  );
}
