"use client";

import { useEffect, useState } from "react";
import { useFindPaymentsByShop, useFindAllShops } from "@/tanstack/queries";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import { PaymentTable } from "@/components/payment/PaymentTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomSelect } from "@/components/CustomSelect";
import { Label } from "@/components/ui/label";

export default function ShopPaymentsPage() {
  const [selectedShopId, setSelectedShopId] = useState("");
  const { data: shopsData } = useFindAllShops();
  const { data: paymentsData, isLoading, isError } = useFindPaymentsByShop(selectedShopId);
  
  const { shopPayments, setShopPayments, setShopsAll, shopsAll } = useStore(
    useShallow((state) => ({
      shopPayments: state.shopPayments,
      setShopPayments: state.setShopPayments,
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
    if (paymentsData?.data?.payments) {
      setShopPayments(paymentsData?.data?.payments);
    }
  }, [paymentsData, setShopPayments]);

  const shopOptions = shopsAll?.map((shop) => ({
    id: shop.id,
    label: `Shop ${shop.plaque} (Floor ${shop.floor})`,
  })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>جستجوی پرداختی ‌ها بر اساس واحد</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="shop">انتخاب واحد</Label>
          <CustomSelect
            options={shopOptions}
            value={selectedShopId}
            onChange={setSelectedShopId}
            label="Shop"
          />
        </div>
        {isLoading ? (
          <Skeleton className="w-full h-[400px]" />
        ) : isError ? (
          <p>خطایی رخ داده است</p>
        ) : shopPayments && shopPayments.length > 0 ? (
          <PaymentTable payments={shopPayments} />
        ) : (
          <p>هیچ پرداختی پیدا نشد</p>
        )}
      </CardContent>
    </Card>
  );
}

