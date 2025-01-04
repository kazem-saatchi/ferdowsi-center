"use client";

import { useEffect, useState } from "react";
import { useGetShopBalance, useFindAllShops } from "@/tanstack/queries";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomSelect } from "@/components/CustomSelect";
import { Label } from "@/components/ui/label";

export default function ShopBalancePage() {
  const [selectedShopId, setSelectedShopId] = useState("");
  const { data: shopsData } = useFindAllShops();
  const {
    data: balanceData,
    isLoading,
    isError,
  } = useGetShopBalance(selectedShopId);

  const { shopBalances, setShopBalances, setShopsAll, shopsAll } = useStore(
    useShallow((state) => ({
      shopBalances: state.shopBalances,
      setShopBalances: state.setShopBalances,
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
      setShopBalances([balanceData?.data?.shopBalance]);
    }
  }, [balanceData, setShopBalances]);

  const shopOptions =
    shopsAll?.map((shop) => ({
      id: shop.id,
      label: `Shop ${shop.plaque} (Floor ${shop.floor})`,
    })) || [];

  const selectedShopBalance = shopBalances?.[0];

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
          <Skeleton className="w-full h-[200px]" />
        ) : isError ? (
          <p>An error occurred while fetching the shop balance.</p>
        ) : selectedShopBalance ? (
          <div className="space-y-2">
            <p>
              <strong>Plaque:</strong> {selectedShopBalance.plaque}
            </p>
            <p>
              <strong>Total Charge:</strong>{" "}
              {selectedShopBalance.totalCharge.toLocaleString()} Rials
            </p>
            <p>
              <strong>Total Payment:</strong>{" "}
              {selectedShopBalance.totalPayment.toLocaleString()} Rials
            </p>
            <p>
              <strong>Balance:</strong>{" "}
              {(
                selectedShopBalance.totalCharge -
                selectedShopBalance.totalPayment
              ).toLocaleString()}{" "}
              Rials
            </p>
          </div>
        ) : (
          <p>No balance information found for this shop.</p>
        )}
      </CardContent>
    </Card>
  );
}
