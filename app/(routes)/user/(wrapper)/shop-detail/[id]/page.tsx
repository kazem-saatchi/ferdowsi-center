"use client";

import { useEffect } from "react";
import { useFindShopById } from "@/tanstack/query/shopQuery";
import { useGetShopBalance } from "@/tanstack/query/balanceQuery";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import { useParams, usePathname } from "next/navigation";
import ShopBalanceTable from "@/components/balance/ShopBalanceTable";
import PersonsBalanceTable from "@/components/balance/PersonsBalanceTable";
import ShopInfo from "@/components/shop/ShopInfo";
import { Separator } from "@/components/ui/separator";
import { labels } from "@/utils/label";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ShopBalancePage() {
  const params = useParams();
  const path = usePathname();
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
    return <LoadingComponent text={labels.loadingData} />;
  }

  if (isError) {
    return (
      <ErrorComponent
        error={error}
        message={balanceData?.message || labels.errorOccurred}
        retry={refetch}
      />
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-4">
        <CardHeader className="p-0">
          <CardTitle className="text-xl sm:text-2xl">اطلاعات واحد</CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-4">
          {shopBalance ? (
            <ShopBalanceTable shopBalance={shopBalance} />
          ) : (
            <p className="text-muted-foreground">
              هیچ اطلاعاتی برای این واحد پیدا نشد
            </p>
          )}
        </CardContent>

        {personsBalance && personsBalance.length > 0 && (
          <>
            <CardHeader className="p-0 pt-2">
              <CardTitle className="text-lg sm:text-xl">
                حساب اشخاص روی واحد
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <PersonsBalanceTable personsBalance={personsBalance} />
            </CardContent>
          </>
        )}

        <div className="w-full my-2">
          <Button asChild className="w-full sm:w-auto h-11">
            <Link href={`${path}/detail`}>مشاهده جزییات پرداخت و شارژها</Link>
          </Button>
        </div>

        {shopInfo && shopInfo.data?.shop && (
          <>
            <Separator />
            <ShopInfo isLoading={shopIsLoading} shop={shopInfo.data?.shop} />
          </>
        )}
      </div>
    </div>
  );
}
