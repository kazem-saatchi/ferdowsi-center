"use client";

import ErrorComponent from "@/components/ErrorComponent";
import ErrorComponentSimple from "@/components/ErrorComponentSimple";
import LoadingComponent from "@/components/LoadingComponent";
import { useShopHistoryByPerson } from "@/tanstack/query/historyQuery";
import { useParams } from "next/navigation";
import React from "react";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import HistoryTable from "@/components/history/HistoryTable";
import { labels } from "@/utils/label";

function HistoryByPerson() {
  const params = useParams();
  const personId = params.id as string;

  const { data, isLoading, isError, error, refetch } =
    useShopHistoryByPerson(personId);

  // Read the query result directly: the shared store still holds the
  // previously opened record until an effect runs, which flashed the wrong
  // history and crashed on an empty one.
  const histories = data?.data?.histories ?? [];

  if (isLoading) {
    return <LoadingComponent text={labels.loadingShopHistory} />;
  }

  if (isError) {
    return (
      <ErrorComponent
        message={labels.somethingWentWrong}
        retry={refetch}
        error={error}
      />
    );
  }

  if (histories.length === 0) {
    return <ErrorComponentSimple message={labels.historiesNotFound} />;
  }

  return (
    <div>
      <CardHeader className="p-3 sm:p-6">
        <CardTitle>{`${labels.personHistory} - ${histories[0].personName}`}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
        <HistoryTable allHistories={histories} />
      </CardContent>
    </div>
  );
}

export default HistoryByPerson;
