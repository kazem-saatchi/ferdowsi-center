"use client"

import { BalanceDetailTable } from "@/components/balance/BalanceDetaiTable";
import ErrorComponentSimple from "@/components/ErrorComponentSimple";
import LoadingComponent from "@/components/LoadingComponent";
import { useGetShopBalance } from "@/tanstack/query/balanceQuery";
import { labels } from "@/utils/label";
import { useParams } from "next/navigation";
import React from "react";

function ShopBalanceDetaiById() {
  const params = useParams();
  const shopId = params.id as string;
  const {
    data: balanceData,
    isLoading,
    error,
    isError,
    refetch,
  } = useGetShopBalance(shopId);

  if (isLoading) {
    return <LoadingComponent text={labels.loadingShopsData} />;
  }

  if (
    isError ||
    !balanceData?.data?.charges ||
    !balanceData?.data?.payments ||
    !balanceData.data.shopBalance?.plaque
  ) {
    return (
      <ErrorComponentSimple
        message={balanceData?.message || labels.errorLoadingFinancial}
      />
    );
  }

  return (
    <div>
      ShopBalanceDetaiById
      <BalanceDetailTable
        charges={balanceData?.data?.charges}
        payments={balanceData?.data?.payments}
      />
    </div>
  );
}

export default ShopBalanceDetaiById;
