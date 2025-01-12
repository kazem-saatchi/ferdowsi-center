"use client";

import { useEffect, useState } from "react";
import { useFindAllShops, useFindChargesByShop } from "@/tanstack/queries";
import { useStore } from "@/store/store";
import { ChargeTable } from "@/components/charge/ChargeTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import { useShallow } from "zustand/react/shallow";
import { Label } from "@/components/ui/label";
import { CustomSelect } from "@/components/CustomSelect";

export default function FindChargesByShopPage() {
  const [selectedShopId, setSelectedShopId] = useState("");
  const {
    data: shopsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useFindAllShops();

  const { data, isLoading: loadingShopData } = useFindChargesByShop({
    shopId: selectedShopId,
  });

  // Zustand State
  const { shopCharges, setShopCharges, shopsAll, setShopsAll } = useStore(
    useShallow((state) => ({
      shopCharges: state.shopCharges,
      setShopCharges: state.setShopCharges,
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
    if (data?.data?.charges) {
      setShopCharges(data.data.charges);
    }
  }, [data, setShopCharges]);

  const shopOptions =
    shopsAll?.map((shop) => ({
      id: shop.id,
      label: `Shop ${shop.plaque} (Floor ${shop.floor})`,
    })) || [];

  if (isLoading) {
    return <LoadingComponent text="loading Data" />;
  }

  if (isError) {
    return (
      <ErrorComponent
        error={error}
        message={data?.message || "Something Went Wrong"}
        retry={refetch}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Charges</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="shop">Select Shop</Label>
          <CustomSelect
            options={shopOptions}
            value={selectedShopId}
            onChange={setSelectedShopId}
            label="Shop"
          />
        </div>
        {loadingShopData && selectedShopId !== "" && (
          <LoadingComponent text="Loading Shop Data" />
        )}
        {!loadingShopData && shopCharges && shopCharges.length > 0 && (
          <ChargeTable charges={shopCharges} />
        )}
      </CardContent>
    </Card>
  );
}
