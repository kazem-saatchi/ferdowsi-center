"use client";

import { useEffect } from "react";
import { useFindShopById, useGetShopBalance } from "@/tanstack/queries";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import { useParams } from "next/navigation";
import ShopBalanceTable from "@/components/balance/ShopBalanceTable";
import PersonsBalanceTable from "@/components/balance/PersonsBalanceTable";
import ShopInfo from "@/components/shop/ShopInfo";
import { Separator } from "@/components/ui/separator";

export default function ShopBalancePage() {
  const params = useParams();
  const shopId = params.id as string;

  const {
    data: balanceData,
    isLoading,
    isError,
    refetch,
    error,
  } = useGetShopBalance(shopId);

  const { data: shopInfo, isLoading: shopIsLoading } = useFindShopById(shopId);

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
    return <LoadingComponent text="Loading Shops Data" />;
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
          <CardTitle>Shop Balance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {shopBalance ? (
            <ShopBalanceTable shopBalance={shopBalance} />
          ) : (
            <p>No balance information found for this shop.</p>
          )}
        </CardContent>

        {personsBalance && personsBalance.length > 0 && (
          <>
            <CardHeader>
              <CardTitle>People's Balances</CardTitle>
            </CardHeader>
            <CardContent>
              <PersonsBalanceTable personsBalance={personsBalance} />
            </CardContent>
          </>
        )}

        {shopInfo && shopInfo.data?.shop && (
          <>
            <Separator />
            <ShopInfo isLoading={shopIsLoading} shop={shopInfo.data?.shop} />
          </>
        )}
      </Card>
    </div>
  );
}
