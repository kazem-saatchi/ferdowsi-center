"use client";

import ErrorComponent from "@/components/ErrorComponent";
import ErrorComponentSimple from "@/components/ErrorComponentSimple";
import LoadingComponent from "@/components/LoadingComponent";
import { useShopHistoryByShop } from "@/tanstack/query/historyQuery";
import { useParams } from "next/navigation";
import React from "react";
import {
  Page,
  PageHeader,
  PageTitle,
  PageBody,
} from "@/components/layout/Page";
import HistoryTable from "@/components/history/HistoryTable";
import { labels } from "@/utils/label";
import { toPersianDigits } from "@/utils/formatNumber";

function HistoryByShop() {
  const params = useParams();
  const shopId = params.id as string;

  const { data, isLoading, isError, error, refetch } =
    useShopHistoryByShop(shopId);

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
    <Page>
      <PageHeader>
        <PageTitle>{`${labels.shopHistory} ${toPersianDigits(histories[0].plaque)}`}</PageTitle>
      </PageHeader>
      <PageBody>
        <HistoryTable allHistories={histories} />
      </PageBody>
    </Page>
  );
}

export default HistoryByShop;
