"use client";

import { useEffect } from "react";
import { useFindChargesByPerson } from "@/tanstack/query/chargeQuery";
import { useStore } from "@/store/store";
import { ChargeTable } from "@/components/charge/ChargeTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import { useShallow } from "zustand/react/shallow";
import { useParams } from "next/navigation";
import { labels } from "@/utils/label";

export default function FindChargesByPersonPage() {
  const params = useParams();
  const personId = params.id as string;
  const { data, isLoading, isError, error, refetch } = useFindChargesByPerson({
    personId,
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
        message={data?.message || labels.generalErrorMessage}
        retry={refetch}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{labels.personCharges}</CardTitle>
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
