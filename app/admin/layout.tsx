import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { verifyToken } from "@/utils/auth";
import {
  UserPlus,
  Search,
  UserCog,
  Home,
  Users,
  ShoppingBag,
  UserCheck,
  UserX,
  ClipboardList,
  ToggleLeft,
  DollarSign,
} from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

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
        <Sidebar side="right">
          <SidebarHeader>
            <h2 className="text-xl font-bold p-4">Admin Dashboard</h2>
          </SidebarHeader>
          <SidebarContent>
            <Separator />
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/dashboard">
                    <Home className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <Separator />
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/all-persons">
                    <Users className="mr-2 h-4 w-4" />
                    <span>All Persons</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/add-person">
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span>Add Person</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/search-persons">
                    <Search className="mr-2 h-4 w-4" />
                    <span>Search Persons</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/update-person">
                    <UserCog className="mr-2 h-4 w-4" />
                    <span>Update Person</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <Separator />
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/add-shop">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    <span>Add Shop</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/all-shops">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    <span>All Shops</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/edit-shop">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    <span>Update Shop</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <Separator />
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/update-shop-owner">
                    <UserCheck className="mr-2 h-4 w-4" />
                    <span>Update Shop Owner</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/update-shop-renter">
                    <UserX className="mr-2 h-4 w-4" />
                    <span>Update Shop Renter</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/remove-shop-renter">
                    <UserX className="mr-2 h-4 w-4" />
                    <span>Remove Shop Renter</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/update-shop-status">
                    <ToggleLeft className="mr-2 h-4 w-4" />
                    <span>Update Shop Status</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <Separator />
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/all-shop-history">
                    <ClipboardList className="mr-2 h-4 w-4" />
                    <span>All History</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/history-by-shop">
                    <ClipboardList className="mr-2 h-4 w-4" />
                    <span>Shop History</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/history-by-person">
                    <ClipboardList className="mr-2 h-4 w-4" />
                    <span>Person History</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <Separator />
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/all-charges">
                    <DollarSign className="mr-2 h-4 w-4" />
                    <span>All Charges</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 overflow-y-auto no-scrollbar p-8 items-center justify-center bg-neutral-100">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
