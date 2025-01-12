"use client";

import ErrorComponent from "@/components/ErrorComponent";
import LoadingComponent from "@/components/LoadingComponent";
import { useStore } from "@/store/store";
import { useGetUserInfo } from "@/tanstack/queries";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

export default async function UserClientLayout({
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
    return <LoadingComponent text="Loading User Data" />;
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

  return <>{children}</>;
}
