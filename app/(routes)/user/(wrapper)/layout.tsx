"use client";

import ErrorComponent from "@/components/ErrorComponent";
import LoadingComponent from "@/components/LoadingComponent";
import { useStore } from "@/store/store";
import { useGetUserInfo } from "@/tanstack/query/personQuery";
import { labels } from "@/utils/label";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { SidebarProvider } from "@/components/ui/sidebar";
import UserSidePanel from "@/components/user-side-panel/UserSidePanel";
import AppHeader from "@/components/layout/AppHeader";
import { userPageTitles } from "@/components/user-side-panel/userPages";


export default function UserClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data, isLoading, isError, error, refetch } = useGetUserInfo();
  const { setUserInfo } = useStore(
    useShallow((state) => ({
      setUserInfo: state.setUserInfo,
    }))
  );

  useEffect(() => {
    if (data && data.person) {
      setUserInfo(data.person);
    }
  }, [data, setUserInfo]);

  if (isLoading) {
    return <LoadingComponent text={labels.loadingData} />;
  }

  if (isError) {
    return (
      <ErrorComponent
        error={error}
        message={data?.message || labels.somethingWentWrong}
        retry={refetch}
      />
    );
  }
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <UserSidePanel />
        <main className="flex-1 min-w-0 overflow-y-auto no-scrollbar m-1 sm:m-2 rounded-md border-2 relative">
          <AppHeader areaTitle={labels.personalAccount} titles={userPageTitles} />
          <div className="w-full px-1 py-4 md:px-2">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
