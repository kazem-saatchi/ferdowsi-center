"use client";
import EmptyState from "@/components/EmptyState";

import { useEffect, useState } from "react";
import { useFindPaymentsByShop } from "@/tanstack/query/paymentQuery";
import { useFindAllShops } from "@/tanstack/query/shopQuery";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import { PaymentTable } from "@/components/payment/PaymentTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomSelect } from "@/components/CustomSelect";
import { Label } from "@/components/ui/label";
import { labels } from "@/utils/label";
import { shopOptionLabel } from "@/utils/shopType";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";

export default function ShopPaymentsPage() {
  const [selectedShopId, setSelectedShopId] = useState("");
  const {
    data: shopsData,
    isLoading: shopsIsLoading,
    isError: shopsIsError,
    error: shopsError,
    refetch: shopsRefetch,
  } = useFindAllShops();
  const {
    data: paymentsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useFindPaymentsByShop(selectedShopId);

  const { shopPayments, setShopPayments, setShopsAll, shopsAll } = useStore(
    useShallow((state) => ({
      shopPayments: state.shopPayments,
      setShopPayments: state.setShopPayments,
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
    if (paymentsData?.data?.payments) {
      setShopPayments(paymentsData?.data?.payments);
    }
  }, [paymentsData, setShopPayments]);

  const shopOptions =
    shopsAll?.map((shop) => ({
      id: shop.id,
      label: shopOptionLabel(shop),
    })) || [];

  if (shopsIsLoading) {
    return <LoadingComponent text={labels.loadingShopData} />;
  }

  if (shopsIsError) {
    return (
      <ErrorComponent
        error={shopsError}
        message={labels.errorLoadingShops}
        retry={shopsRefetch}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{labels.searchPaymentsByShop}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="shop">{labels.selectUnit}</Label>
          <CustomSelect id="shop"
            options={shopOptions}
            value={selectedShopId}
            onChange={setSelectedShopId}
            label={labels.unit}
          />
        </div>
        {selectedShopId !== "" && isLoading ? (
          <LoadingComponent inline text={labels.loadingData} />
        ) : (
          isError && (
            <ErrorComponent inline
              error={error}
              message={labels.errorOccurred}
              retry={refetch}
            />
          )
        )}

        {selectedShopId !== "" && shopPayments && shopPayments.length > 0 && (
          <PaymentTable payments={shopPayments} />
        )}
        {selectedShopId !== "" && shopPayments && shopPayments.length === 0 && (
          <EmptyState message={labels.paymentsNotFound} />
        )}
      </CardContent>
    </Card>
  );
}
