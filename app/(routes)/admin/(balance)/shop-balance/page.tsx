"use client";

import { useEffect, useState } from "react";
import { useFindAllShops } from "@/tanstack/query/shopQuery";
import { useGetShopBalance } from "@/tanstack/query/balanceQuery";
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
import { labels } from "@/utils/label";
import OwnerRenterBalanceTable from "@/components/balance/OwnerRenterBalanceTable";

export default function ShopBalancePage() {
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
    isError,
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
    return <LoadingComponent text="Loading Shops Data" />;
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
    <div className="space-y-6">
      <Card>
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
          ) : shopBalance ? (
            <ShopBalanceTable shopBalance={shopBalance} />
          ) : (
            <p>{labels.noInformationFound}</p>
          )}
        </CardContent>
      </Card>

      {shopOwnerBalanceData && (
        <Card>
          <CardHeader>
            <CardTitle>{labels.relatedPersonsBalance}</CardTitle>
          </CardHeader>
          <CardContent>
            <OwnerRenterBalanceTable
              ownerData={shopOwnerBalanceData}
              renterData={
                shopRenterBalanceData ? shopRenterBalanceData : undefined
              }
            />
          </CardContent>
        </Card>
      )}

      {/* {personsBalance && personsBalance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{labels.relatedPersonsBalance}</CardTitle>
          </CardHeader>
          <CardContent>
            <PersonsBalanceTable personsBalance={personsBalance} />
          </CardContent>
        </Card>
      )} */}
    </div>
  );
}
