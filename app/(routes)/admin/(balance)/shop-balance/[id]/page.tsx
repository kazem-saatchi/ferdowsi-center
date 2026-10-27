"use client";

import { useEffect } from "react";
import { useGetShopBalance } from "@/tanstack/query/balanceQuery";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import {
  Page,
  PageHeader,
  PageTitle,
  PageBody,
} from "@/components/layout/Page";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponentSimple from "@/components/ErrorComponentSimple";
import ErrorComponent from "@/components/ErrorComponent";
import ShopBalanceTable from "@/components/balance/ShopBalanceTable";
import PersonsBalanceTable from "@/components/balance/PersonsBalanceTable";
import { useParams } from "next/navigation";
import { labels } from "@/utils/label";

export default function ShopBalanceById() {
  const params = useParams();
  const shopId = params.id as string;

  const {
    data: balanceData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetShopBalance(shopId);

  const { shopBalance, setShopBalance, personsBalance, setPersonsBalance } =
    useStore(
      useShallow((state) => ({
        shopBalance: state.shopBalance,
        setShopBalance: state.setShopBalance,
        personsBalance: state.personsBalance,
        setPersonsBalance: state.setPersonsBalance,
      }))
    );

  useEffect(() => {
    if (balanceData?.data?.shopBalance) {
      setShopBalance(balanceData.data.shopBalance);
    }
    if (balanceData?.data?.personsBalance) {
      setPersonsBalance(balanceData.data.personsBalance);
    }
  }, [balanceData, setShopBalance, setPersonsBalance]);

  if (isLoading) {
    return <LoadingComponent text={labels.loadingShopsData} />;
  }

  if (isError) {
    return (
      <ErrorComponent
        error={error}
        message={balanceData?.message || labels.somethingWentWrong}
        retry={refetch}
      />
    );
  }

  return (
    <Page className="space-y-6">
      <div>
        <PageHeader>
          <PageTitle>{labels.unitAccountBalance}</PageTitle>
        </PageHeader>
        <PageBody className="space-y-4">
          {shopBalance ? (
            <ShopBalanceTable shopBalance={shopBalance} />
          ) : (
            <p>{labels.noInformationFound}</p>
          )}
        </PageBody>
      </div>

      {personsBalance && personsBalance.length > 0 && (
        <div>
          <PageHeader>
            <PageTitle>{labels.personsAccountBalance}</PageTitle>
          </PageHeader>
          <PageBody>
            <PersonsBalanceTable personsBalance={personsBalance} />
          </PageBody>
        </div>
      )}
    </Page>
  );
}
