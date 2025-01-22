"use client";

import { useEffect, useState } from "react";
import { useGetShopBalance, useFindAllShops } from "@/tanstack/queries";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CustomSelect } from "@/components/CustomSelect";
import { Label } from "@/components/ui/label";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponentSimple from "@/components/ErrorComponentSimple";
import ErrorComponent from "@/components/ErrorComponent";
import ShopBalanceTable from "@/components/balance/ShopBalanceTable";
import PersonsBalanceTable from "@/components/balance/PersonsBalanceTable";
import { useParams } from "next/navigation";

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
          <CardTitle>مانده حساب واحد</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <LoadingComponent text="در حال دریافت اطلاعات" />
          ) : isError ? (
            <ErrorComponentSimple message="خطایی رخ داده است" />
          ) : shopBalance ? (
            <ShopBalanceTable shopBalance={shopBalance} />
          ) : (
            <p>هیچ اطلاعاتی یافت نشد</p>
          )}
        </CardContent>
      </Card>

      {personsBalance && personsBalance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>مانده حساب اشخاص</CardTitle>
          </CardHeader>
          <CardContent>
            <PersonsBalanceTable personsBalance={personsBalance} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
