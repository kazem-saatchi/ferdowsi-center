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
  } = useStore(
    useShallow((state) => ({
      shopBalance: state.shopBalance,
      setShopBalance: state.setShopBalance,
      personsBalance: state.personsBalance,
      setPersonsBalance: state.setPersonsBalance,
      shopsAll: state.shopsAll,
      setShopsAll: state.setshopsAll,
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
          <CardTitle>Shop Balance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shop">Select Shop</Label>
            <CustomSelect
              options={shopOptions}
              value={selectedShopId}
              onChange={setSelectedShopId}
              label="Shop"
            />
          </div>
          {isLoading && selectedShopId !== "" ? (
            <LoadingComponent text="Loading Shop Data" />
          ) : isError ? (
            <ErrorComponentSimple message="An Error Occurred" />
          ) : shopBalance ? (
            <ShopBalanceTable shopBalance={shopBalance} />
          ) : (
            <p>No balance information found for this shop.</p>
          )}
        </CardContent>
      </Card>

      {personsBalance && personsBalance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>People's Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <PersonsBalanceTable personsBalance={personsBalance} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
