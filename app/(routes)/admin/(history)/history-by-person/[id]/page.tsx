"use client";

import ErrorComponent from "@/components/ErrorComponent";
import ErrorComponentSimple from "@/components/ErrorComponentSimple";
import LoadingComponent from "@/components/LoadingComponent";
import { useStore } from "@/store/store";
import { useShopHistoryByPerson } from "@/tanstack/query/historyQuery";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import HistoryTable from "@/components/history/HistoryTable";
import { labels } from "@/utils/label";

function HistoryByPerson() {
  const params = useParams();
  const personId = params.id as string;

  const { data, isLoading, isError, error, refetch } =
    useShopHistoryByPerson(personId);

  // Zustand State
  const { setPersonHistories, personHistories } = useStore(
    useShallow((state) => ({
      personHistories: state.personHistories,
      setPersonHistories: state.setPersonHistories,
    }))
  );

  useEffect(() => {
    if (!!data && !!data.data?.histories) {
      setPersonHistories(data?.data?.histories);
    }
  }, [data]);

  if (isLoading) {
    return <LoadingComponent text={labels.loadingShopHistory} />;
  }

  if (isError) {
    return (
      <ErrorComponent
        message={error instanceof Error ? error.message : labels.generalErrorMessage}
        retry={refetch}
        error={error}
      />
    );
  }

  if (!personHistories) {
    return <ErrorComponentSimple message={labels.historiesNotFound} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{labels.personHistory} - {personHistories[0].personName}</CardTitle>
      </CardHeader>
      <CardContent>
        <HistoryTable allHistories={personHistories} />
      </CardContent>
    </Card>
  );
}

export default HistoryByPerson;
