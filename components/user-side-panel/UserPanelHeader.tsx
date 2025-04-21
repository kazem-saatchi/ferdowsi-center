"use client";

import { SidebarHeader } from "@/components/ui/sidebar";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";

function UserPanelHeader() {
  const { userInfo } = useStore(
    useShallow((state) => ({
      userInfo: state.userInfo,
    }))
  );
  return (
    <SidebarHeader>
      <h2 className="text-xl font-bold p-4">{`${userInfo?.firstName} ${userInfo?.lastName}`}</h2>
    </SidebarHeader>
  );
}

export default UserPanelHeader;
