"use client";

import { useEffect, useState } from "react";
import { useGetShopBalance, useFindAllShops } from "@/tanstack/queries";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomSelect } from "@/components/CustomSelect";
import { Label } from "@/components/ui/label";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponentSimple from "@/components/ErrorComponentSimple";

export default function ShopBalancePage() {
  const [selectedShopId, setSelectedShopId] = useState("");
  const { data: shopsData } = useFindAllShops();
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
      setShopBalance(balanceData?.data?.shopBalance);
    }
    if (balanceData?.data?.personsBalance) {
      setPersonsBalance(balanceData.data.personsBalance);
    }
  }, [balanceData, setShopBalance]);

  const shopOptions =
    shopsAll?.map((shop) => ({
      id: shop.id,
      label: `Shop ${shop.plaque} (Floor ${shop.floor})`,
    })) || [];

  return (
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
        {isLoading ? (
          <LoadingComponent text="Loading Shop Data" />
        ) : isError ? (
          <ErrorComponentSimple message="An Error Occured" />
        ) : shopBalance ? (
          <div className="space-y-2">
            <p>
              <strong>Plaque:</strong> {shopBalance.plaque}
            </p>
            <p>
              <strong>Total Charge:</strong>{" "}
              {shopBalance.totalCharge.toLocaleString()} Rials
            </p>
            <p>
              <strong>Total Payment:</strong>{" "}
              {shopBalance.totalPayment.toLocaleString()} Rials
            </p>
            <p>
              <strong>Balance:</strong>{" "}
              {(
                shopBalance.totalCharge - shopBalance.totalPayment
              ).toLocaleString()}{" "}
              Rials
            </p>
          </div>
        ) : (
          <p>No balance information found for this shop.</p>
        )}
        {personsBalance && (
          <div>
            {personsBalance.map((person) => (
              <div key={person.personId}>
                {person.personName} {person.balance}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
