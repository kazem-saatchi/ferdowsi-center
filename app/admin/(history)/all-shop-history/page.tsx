"use client";

import { useEffect } from "react";
import { useShopHistoryAll } from "@/tanstack/queries";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import ErrorComponentSimple from "@/components/ErrorComponentSimple";
import HistoryTable from "@/components/history/HistoryTable";

export default function AllShopHistoryPage() {
  const { data, isLoading, isError, error, refetch } = useShopHistoryAll();

  // Zustand State
  const { allHistories, setAllHistories } = useStore(
    useShallow((state) => ({
      allHistories: state.allHistories,
      setAllHistories: state.setAllHistories,
    }))
  );

  useEffect(() => {
    if (!!data && !!data.data?.histories) {
      setAllHistories(data?.data?.histories);
    }
  }, [data]);

  if (isLoading) {
    return <LoadingComponent text="Loading shop history..." />;
  }

  if (isError) {
    return (
      <ErrorComponent
        message={error instanceof Error ? error.message : "Unknown error"}
        retry={refetch}
        error={error}
      />
    );
  }

  if (!allHistories) {
    return <ErrorComponentSimple message="Histories Not Found" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Shop History</CardTitle>
      </CardHeader>
      <CardContent>
        <HistoryTable allHistories={allHistories} />
      </CardContent>
    </Card>
  );
}
