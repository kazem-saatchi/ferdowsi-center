import LogoutButton from "@/components/LogoutButton";
import { ModeToggle } from "@/components/modeToggler";
import { Button } from "@/components/ui/button";
import { SidebarFooter } from "@/components/ui/sidebar";
import Link from "next/link";

function AdminPanelFooter() {
  return (
    <SidebarFooter>
      <Button asChild variant="outline">
        <Link href="/user">حساب شخصی</Link>
      </Button>
      <div className="flex flex-row items-center justify-between gap-2">
        <LogoutButton />
        <ModeToggle />
      </div>
    </SidebarFooter>
  );
}

export default AdminPanelFooter;
