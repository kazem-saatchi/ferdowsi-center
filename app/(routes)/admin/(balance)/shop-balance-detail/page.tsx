"use client";

import { BalanceDetailTable } from "@/components/balance/BalanceDetaiTable";
import { CustomSelect } from "@/components/CustomSelect";
import ErrorComponent from "@/components/ErrorComponent";
import ErrorComponentSimple from "@/components/ErrorComponentSimple";
import LoadingComponent from "@/components/LoadingComponent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useStore } from "@/store/store";
import { useFindAllShops } from "@/tanstack/query/shopQuery";
import { useGetShopBalance } from "@/tanstack/query/balanceQuery";
import { labels } from "@/utils/label";
import React, { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

export default function ShopBalanceDetailPage() {
  const [selectedShopId, setSelectedShopId] = useState("");
  const {
    data: shopsData,
    isLoading: isLoadingAllShops,
    isError: isErrorAllShops,
    error: errorAllShops,
    refetch: refetchAllShops,
  } = useFindAllShops();

  const {
    data: balanceData,
    isLoading,
    error,
    isError,
    refetch,
  } = useGetShopBalance(selectedShopId);

  const {
    shopBalance,
    setShopBalance,
    personsBalance,
    setPersonsBalance,
    setShopsAll,
    shopsAll,
    setShopOwnerBalance,
    setShopRenterBalance,
    shopOwnerBalanceData,
    shopRenterBalanceData,
  } = useStore(
    useShallow((state) => ({
      shopBalance: state.shopBalance,
      setShopBalance: state.setShopBalance,
      personsBalance: state.personsBalance,
      setPersonsBalance: state.setPersonsBalance,
      shopsAll: state.shopsAll,
      setShopsAll: state.setshopsAll,
      shopOwnerBalanceData: state.shopOwnerBalanceData,
      shopRenterBalanceData: state.shopRenterBalanceData,
      setShopOwnerBalance: state.setShopOwnerBalance,
      setShopRenterBalance: state.setShopRenterBalance,
    }))
  );

  useEffect(() => {
    if (shopsData?.data?.shops) {
      setShopsAll(shopsData.data.shops);
    }
  }, [shopsData, setShopsAll]);

  useEffect(() => {
    if (balanceData?.data?.shopBalance) {
      setShopBalance(balanceData.data.shopBalance);
    }
    if (balanceData?.data?.personsBalance) {
      setPersonsBalance(balanceData.data.personsBalance);
    }
    if (
      balanceData?.data?.ownerChargeList &&
      balanceData?.data?.ownerPaymentList &&
      balanceData.data.owner
    ) {
      setShopOwnerBalance({
        person: balanceData.data.owner,
        chargeList: balanceData?.data?.ownerChargeList,
        paymentList: balanceData?.data?.ownerPaymentList,
      });
    }
    if (
      balanceData?.data?.renterChargeList &&
      balanceData?.data?.renterPaymentList &&
      balanceData.data.renter
    ) {
      setShopRenterBalance({
        person: balanceData.data.renter,
        chargeList: balanceData?.data?.renterChargeList,
        paymentList: balanceData?.data?.renterPaymentList,
      });
    } else {
      setShopRenterBalance(null);
    }
  }, [balanceData, setShopBalance, setPersonsBalance]);

  const shopOptions =
    shopsAll?.map((shop) => ({
      id: shop.id,
      label: `Shop ${shop.plaque} (Floor ${shop.floor})`,
    })) || [];

  if (isLoadingAllShops) {
    return <LoadingComponent text={labels.loadingShopsData} />;
  }

  if (isErrorAllShops) {
    return (
      <ErrorComponent
        error={errorAllShops}
        message={shopsData?.message || "Something Went Wrong"}
        retry={refetchAllShops}
      />
    );
  }

  return (
    <div>
      <>
        <CardHeader>
          <CardTitle>{labels.shopBalanceTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shop">{labels.selectShop}</Label>
            <CustomSelect
              options={shopOptions}
              value={selectedShopId}
              onChange={setSelectedShopId}
              label="Shop"
            />
          </div>

          {isLoading && selectedShopId !== "" ? (
            <LoadingComponent text={labels.loadingData} />
          ) : isError ? (
            <ErrorComponentSimple message={labels.errorOccurred} />
          ) : shopBalance &&
            balanceData?.data?.charges &&
            balanceData?.data?.payments  ? (
            <BalanceDetailTable
              charges={balanceData?.data?.charges}
              payments={balanceData?.data?.payments}
            />
          ) : (
            <p>{labels.noInformationFound}</p>
          )}
        </CardContent>
      </>
    </div>
  );
}
