"use client";

import { useEffect } from "react";
import { useGetShopBalance } from "@/tanstack/query/balanceQuery";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
        message={balanceData?.message || "Something Went Wrong"}
        retry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{labels.unitAccountBalance}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <LoadingComponent text={labels.loadingData} />
          ) : isError ? (
            <ErrorComponentSimple message={labels.errorOccurred} />
          ) : shopBalance ? (
            <ShopBalanceTable shopBalance={shopBalance} />
          ) : (
            <p>{labels.noInformationFound}</p>
          )}
        </CardContent>
      </Card>

      {personsBalance && personsBalance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{labels.personsAccountBalance}</CardTitle>
          </CardHeader>
          <CardContent>
            <PersonsBalanceTable personsBalance={personsBalance} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
