"use client";

import { useEffect, useState } from "react";
import { useFindAllShops } from "@/tanstack/query/shopQuery";
import { useShopHistoryByShop } from "@/tanstack/query/historyQuery";
import { useStore } from "@/store/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import { useShallow } from "zustand/react/shallow";
import { Label } from "@/components/ui/label";
import { CustomSelect } from "@/components/CustomSelect";
import { Separator } from "@/components/ui/separator";
import { labels } from "@/utils/label";
import HistoryTable from "@/components/history/HistoryTable";

export default function HistoryByShopInfo() {
  const [selectedShopId, setSelectedShopId] = useState("");

  const {
    data: shopsData,
    isLoading: isShopsLoading,
    isError: isShopsError,
    error: shopsError,
    refetch: shopsRefetch,
  } = useFindAllShops();

  const { data, isLoading, isError, error, refetch } =
    useShopHistoryByShop(selectedShopId);

  // Zustand State
  const { shopHistories, setShopHistories, shopsAll, setShopsAll } = useStore(
    useShallow((state) => ({
      shopHistories: state.shopHistories,
      setShopHistories: state.setShopHistories,
      shopsAll: state.shopsAll,
      setShopsAll: state.setshopsAll,
    }))
  );

  useEffect(() => {
    if (shopsData?.data?.shops) {
      setShopsAll(shopsData.data.shops);
    }
  }, [shopsData, setShopsAll]);

  useEffect(() => {
    if (data?.data?.histories) {
      setShopHistories(data.data.histories);
    }
  }, [data, setShopHistories]);

  if (isShopsLoading) {
    return <LoadingComponent text={labels.loadingData} />;
  }

  if (isShopsError) {
    return (
      <ErrorComponent
        error={shopsError}
        message={
          shopsError instanceof Error
            ? shopsError.message
            : labels.generalErrorMessage
        }
        retry={shopsRefetch}
      />
    );
  }

  const shopOptions =
    shopsAll?.map((shop) => ({
      id: shop.id,
      label: `Shop ${shop.plaque} (Floor ${shop.floor})`,
    })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{labels.shopHistory}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="shop">{labels.selectShop}</Label>
          <CustomSelect
            options={shopOptions}
            value={selectedShopId}
            onChange={setSelectedShopId}
            label={labels.unit}
          />
        </div>
        <Separator className="my-4" />

        {selectedShopId !== "" && isLoading && (
          <LoadingComponent text={labels.loadingShopHistory} />
        )}

        {selectedShopId !== "" && isError && (
          <ErrorComponent
            error={error}
            message={
              error instanceof Error
                ? error.message
                : labels.generalErrorMessage
            }
            retry={refetch}
          />
        )}

        {selectedShopId !== "" &&
          !isLoading &&
          !isError &&
          shopHistories &&
          shopHistories.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {`${labels.plaque} ${shopHistories[0].plaque}`}
              </h3>
              <HistoryTable allHistories={shopHistories} />
            </div>
          )}

        {selectedShopId !== "" &&
          !isLoading &&
          !isError &&
          shopHistories &&
          shopHistories.length === 0 && <p>{labels.historiesNotFound}</p>}
      </CardContent>
    </Card>
  );
}
