"use client";

import { formatJalaliDate } from "@/utils/localeDate";
import { useEffect, useState } from "react";
import { useFindAllShops } from "@/tanstack/query/shopQuery";
import { useEndShopRenter } from "@/tanstack/mutation/shopMutation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useConfirm } from "@/components/ConfirmDialog";
import { CustomSelect } from "@/components/CustomSelect";
import { Input } from "@/components/ui/input";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import { Label } from "@/components/ui/label";
import JalaliDayCalendar from "@/components/calendar/JalaliDayCalendar";
import { labels } from "@/utils/label";

import { shopOptionLabel } from "@/utils/shopType";
export default function RemoveShopRenterPage() {
  const [selectedShopId, setSelectedShopId] = useState("");
  const [currentRenterName, setCurrentRenterName] = useState("");
  const [currentRenterId, setCurrentRenterId] = useState("");
  const [endDate, setEndDate] = useState<Date | null>(null);

  const { data: shopsData, isLoading: isLoadingShops } = useFindAllShops();
  const endShopRenterMutation = useEndShopRenter();

  const { setShopsAll, shopsAll } = useStore(
    useShallow((state) => ({
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
    if (selectedShopId && shopsAll) {
      const selectedShop = shopsAll.find((shop) => shop.id === selectedShopId);
      setCurrentRenterName(selectedShop?.renterName || labels.noCurrentRenter);
      setCurrentRenterId(selectedShop?.renterId || "");
    }
  }, [selectedShopId, shopsAll]);

  const { confirm, dialog } = useConfirm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShopId || !currentRenterId || !endDate) {
      toast.error(labels.selectShopWithRenterAndEndDate);
      return;
    }
    const shop = shopsAll?.find((s) => s.id === selectedShopId);
    const ok = await confirm({
      title: labels.confirmEndRentalTitle,
      description: `${shop ? shopOptionLabel(shop) : ""} — ${currentRenterName}، ${
        labels.endDate
      } ${formatJalaliDate(endDate)}`,
      destructive: true,
    });
    if (!ok) return;
    // useEndShopRenter toasts the server's own success or error message.
    try {
      const result = await endShopRenterMutation.mutateAsync({
        shopId: selectedShopId,
        renterId: currentRenterId,
        endDate: endDate.toISOString(),
      });
      if (!result.success) return;
      // Reset form after successful submission
      setSelectedShopId("");
      setCurrentRenterName("");
      setCurrentRenterId("");
      setEndDate(null);
    } catch (error) {
      console.error("Error removing shop renter:", error);
    }
  };

  const shopOptions =
    shopsAll?.map((shop) => ({
      id: shop.id,
      label: shopOptionLabel(shop),
    })) || [];


  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{labels.endRentalAgreement}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shop">{labels.unit}</Label>
              <CustomSelect id="shop"
                options={shopOptions}
                value={selectedShopId}
                onChange={setSelectedShopId}
                label={labels.unit}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentRenter">{labels.renterName}</Label>
              <Input
                id="currentRenter"
                disabled={true}
                value={currentRenterName}
              />
            </div>
            <JalaliDayCalendar
              id="endDate"
              title={labels.endDate}
              date={endDate}
              setDate={setEndDate}
            />
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={
                endShopRenterMutation.isPending ||
                !selectedShopId ||
                !currentRenterId ||
                !endDate
              }
            >
              {endShopRenterMutation.isPending
                ? labels.removingRenter
                : labels.removeRenter}
            </Button>
          </CardFooter>
        </form>
      </Card>
      {dialog}
    </div>
  );
}
