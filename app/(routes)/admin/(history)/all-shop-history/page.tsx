"use client";

import { useEffect } from "react";
import { useShopHistoryAll } from "@/tanstack/query/historyQuery";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import ErrorComponentSimple from "@/components/ErrorComponentSimple";
import HistoryTable from "@/components/history/HistoryTable";
import { labels } from "@/utils/label";

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
    return <LoadingComponent text={labels.loadingShopHistory} />;
  }

  if (isError) {
    return (
      <ErrorComponent
        message={error instanceof Error ? error.message : labels.somethingWentWrong}
        retry={refetch}
        error={error}
      />
    );
  }

  if (!allHistories) {
    return <ErrorComponentSimple message={labels.historiesNotFound} />;
  }

  return (
    <div>
      <CardHeader className="p-3 sm:p-6">
        <CardTitle>{labels.allShopHistory}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
        <HistoryTable allHistories={allHistories} searchable />
      </CardContent>
    </div>
  );
}
