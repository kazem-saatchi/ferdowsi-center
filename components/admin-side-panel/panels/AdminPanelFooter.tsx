import LogoutButton from "@/components/LogoutButton";
import { Button } from "@/components/ui/button";
import { SidebarFooter } from "@/components/ui/sidebar";
import Link from "next/link";

function AdminPanelFooter() {
  return (
    <SidebarFooter>
      <Button asChild variant="outline">
        <Link href="/user">
        حساب شخصی
        </Link>
      </Button>
      <LogoutButton />
    </SidebarFooter>
  );
}

export default AdminPanelFooter;
