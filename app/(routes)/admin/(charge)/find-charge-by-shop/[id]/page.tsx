"use client";
import EmptyState from "@/components/EmptyState";

import { useEffect } from "react";
import { useFindChargesByShop } from "@/tanstack/query/chargeQuery";
import { useStore } from "@/store/store";
import { ChargeTable } from "@/components/charge/ChargeTable";
import {
  Page,
  PageHeader,
  PageTitle,
  PageBody,
} from "@/components/layout/Page";
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
        message={data?.message || labels.somethingWentWrong}
        retry={refetch}
      />
    );
  }

  return (
    <Page>
      <PageHeader>
        <PageTitle>{labels.allChargesTitle}</PageTitle>
      </PageHeader>
      <PageBody>
        {shopCharges && shopCharges.length > 0 ? (
          <ChargeTable charges={shopCharges} />
        ) : (
          <EmptyState message={labels.chargesNotFound} />
        )}
      </PageBody>
    </Page>
  );
}
