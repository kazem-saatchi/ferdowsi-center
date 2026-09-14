"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useGetPersonBalance } from "@/tanstack/query/balanceQuery";
import { PersonBalanceDisplay } from "@/components/balance/PersonBalanceDisplay";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import { labels } from "@/utils/label";

export default function PersonBalanceByIdPage() {
  const params = useParams();
  const personId = params.id as string;

  const { data, isLoading, isError, error, refetch } =
    useGetPersonBalance(personId);

  if (isLoading)
    return <LoadingComponent text={labels.loadingFinancialData} />;
  if (isError)
    return (
      <ErrorComponent
        error={error as Error}
        message={labels.errorLoadingFinancial}
        retry={refetch}
      />
    );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{labels.personFinancialInfo}</h1>
      {data?.data && (
        <PersonBalanceDisplay
          person={data.data.person}
          summary={data.data.summary}
          units={data.data.units}
        />
      )}
    </div>
  );
}
