"use client";

import LogoutButton from "@/components/LogoutButton";
import { ModeToggle } from "@/components/modeToggler";
import { Button } from "@/components/ui/button";
import { SidebarFooter } from "@/components/ui/sidebar";
import { useStore } from "@/store/store";
import Link from "next/link";
import { useShallow } from "zustand/react/shallow";

function UserPanelFooter() {
  const { userInfo } = useStore(
    useShallow((state) => ({
      userInfo: state.userInfo,
    }))
  );
  return (
    <SidebarFooter>
      {userInfo?.role !== "USER" && userInfo?.role !== "STAFF" && (
        <Button asChild variant="outline">
          <Link href="/admin">پنل مدیریت</Link>
        </Button>
      )}
      <div className="flex flex-row items-center justify-between gap-2">
        <LogoutButton />
        <ModeToggle />
      </div>
    </SidebarFooter>
  );
}

export default UserPanelFooter;
