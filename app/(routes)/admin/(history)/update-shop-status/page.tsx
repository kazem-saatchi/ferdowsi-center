"use client";

import { formatJalaliDate } from "@/utils/localeDate";
import { useState, useEffect } from "react";
import { useFindAllShops } from "@/tanstack/query/shopQuery";
import { useUpdateShopStatus } from "@/tanstack/mutation/shopMutation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { CustomSelect } from "@/components/CustomSelect";
import { toast } from "sonner";
import { useConfirm } from "@/components/ConfirmDialog";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import JalaliDayCalendar from "@/components/calendar/JalaliDayCalendar";
import { labels } from "@/utils/label";

import { shopOptionLabel } from "@/utils/shopType";
export default function UpdateShopStatusPage() {
  const [selectedShopId, setSelectedShopId] = useState("");
  const [statusChangeDate, setStatusChangeDate] = useState<Date | null>(null);

  const { data: shopsData } = useFindAllShops();
  const updateShopStatusMutation = useUpdateShopStatus();

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

  const selectedShop = shopsAll?.find((shop) => shop.id === selectedShopId);

  const { confirm, dialog } = useConfirm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShopId || !statusChangeDate) {
      toast.error(labels.selectShopAndDate);
      return;
    }
    const ok = await confirm({
      title: labels.confirmStatusChangeTitle,
      description: `${selectedShop ? shopOptionLabel(selectedShop) : ""} — ${
        selectedShop?.isActive ? labels.deactivateShop : labels.activateShop
      } ${labels.fromDate} ${formatJalaliDate(statusChangeDate)}`,
    });
    if (!ok) return;
    // useUpdateShopStatus toasts the server's own success or error message;
    // a success toast here also fired when the server refused the change.
    try {
      await updateShopStatusMutation.mutateAsync({
        shopId: selectedShopId,
        newStatus: selectedShop?.isActive ? "INACTIVATE" : "ACTIVATE",
        date: statusChangeDate.toISOString(),
      });
    } catch (error) {
      console.error("Error updating shop status:", error);
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
          <CardTitle>{labels.changeShopActiveStatus}</CardTitle>
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
            {selectedShop && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="ownerName">{labels.ownerName}</Label>
                  <Input
                    id="ownerName"
                    value={selectedShop.ownerName}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="renterName">{labels.renterName}</Label>
                  <Input
                    id="renterName"
                    value={selectedShop.renterName || labels.notAvailable}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentStatus">{labels.status}</Label>
                  <Input
                    id="currentStatus"
                    value={
                      selectedShop.isActive ? labels.active : labels.inactive
                    }
                    disabled
                  />
                </div>
                <JalaliDayCalendar
                  id="statusChangeDate"
                  title={labels.statusChangeDate}
                  date={statusChangeDate}
                  setDate={setStatusChangeDate}
                />
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={
                updateShopStatusMutation.isPending ||
                !selectedShopId ||
                !statusChangeDate
              }
            >
              {updateShopStatusMutation.isPending
                ? labels.updatingStatus
                : selectedShop?.isActive
                ? labels.deactivateShop
                : labels.activateShop}
            </Button>
          </CardFooter>
        </form>
      </Card>
      {dialog}
    </div>
  );
}
