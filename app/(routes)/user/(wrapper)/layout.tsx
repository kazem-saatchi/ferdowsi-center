"use client";

import ErrorComponent from "@/components/ErrorComponent";
import LoadingComponent from "@/components/LoadingComponent";
import { useStore } from "@/store/store";
import { useGetUserInfo } from "@/tanstack/query/personQuery";
import { labels } from "@/utils/label";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import UserSidePanel from "@/components/user-side-panel/UserSidePanel";


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
        message={data?.message || "Something Went Wrong"}
        retry={refetch}
      />
    );
  }
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <UserSidePanel />
        <main className="flex-1 min-w-0 overflow-y-auto no-scrollbar m-1 sm:m-2 rounded-md border-2 relative">
          <SidebarTrigger
            className="absolute top-2 right-2 z-10 w-9 h-9 touch-manipulation"
            variant="outline"
          />
          <div className="p-4 pt-14 sm:p-6 sm:pt-14 md:p-8 md:pt-12">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
