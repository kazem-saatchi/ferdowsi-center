"use client";

import { useEffect } from "react";
import { useFindChargesByShop } from "@/tanstack/query/chargeQuery";
import { useStore } from "@/store/store";
import { ChargeTable } from "@/components/charge/ChargeTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import { useShallow } from "zustand/react/shallow";
import { useParams } from "next/navigation";
import { labels } from "@/utils/label";

export default function FindChargesByShopPageFromParams() {
  const params = useParams();
  const shopId = params.id as string;
  const { data, isLoading, isError, error, refetch } = useFindChargesByShop({
    shopId,
  });

  // Zustand State
  const { shopCharges, setShopCharges } = useStore(
    useShallow((state) => ({
      shopCharges: state.shopCharges,
      setShopCharges: state.setShopCharges,
    }))
  );

  useEffect(() => {
    if (data?.data?.charges) {
      setShopCharges(data.data.charges);
    }
  }, [data, setShopCharges]);

  if (isLoading) {
    return <LoadingComponent text={labels.loadingData} />;
  }

  if (isError) {
    return (
      <ErrorComponent
        error={error}
        message={data?.message || "Something Went Wrong"}
        retry={refetch}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{labels.allChargesTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        {shopCharges && shopCharges.length > 0 ? (
          <ChargeTable charges={shopCharges} />
        ) : (
          <p>{labels.chargesNotFound}</p>
        )}
      </CardContent>
    </Card>
  );
}
