"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useGetPersonBalance } from "@/tanstack/query/balanceQuery";
import { PersonBalanceDisplay } from "@/components/balance/PersonBalanceDisplay";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div>
      <CardHeader className="p-3 sm:p-6">
        <CardTitle>{labels.personFinancialInfo}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
        {data?.data && (
          <PersonBalanceDisplay
            person={data.data.person}
            summary={data.data.summary}
            units={data.data.units}
          />
        )}
      </CardContent>
    </div>
  );
}
