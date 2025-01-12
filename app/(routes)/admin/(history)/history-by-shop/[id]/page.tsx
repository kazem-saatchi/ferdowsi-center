'use client'

import ErrorComponent from "@/components/ErrorComponent";
import ErrorComponentSimple from "@/components/ErrorComponentSimple";
import LoadingComponent from "@/components/LoadingComponent";
import { useStore } from "@/store/store";
import { useShopHistoryByShop } from "@/tanstack/queries";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import HistoryTable from "@/components/history/HistoryTable";

function HistoryByShop() {
  const params = useParams();
  const shopId = params.id as string;

  const { data, isLoading, isError, error, refetch } =
    useShopHistoryByShop(shopId);

  // Zustand State
  const { setShopHistories, shopHistories } = useStore(
    useShallow((state) => ({
      shopHistories: state.shopHistories,
      setShopHistories: state.setShopHistories,
    }))
  );

  useEffect(() => {
    if (!!data && !!data.data?.histories) {
      setShopHistories(data?.data?.histories);
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

  if (!shopHistories) {
    return <ErrorComponentSimple message="Histories Not Found" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shop {shopHistories[0].plaque} History</CardTitle>
      </CardHeader>
      <CardContent>
        <HistoryTable allHistories={shopHistories} />
      </CardContent>
    </Card>
  );
}

export default HistoryByShop;
