"use client";

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
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { labels } from "@/utils/label";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShopId || !statusChangeDate) {
      toast.error(labels.selectShopAndDate);
      return;
    }
    try {
      await updateShopStatusMutation.mutateAsync({
        shopId: selectedShopId,
        newStatus: selectedShop?.isActive ? "INACTIVATE" : "ACTIVATE",
        date: statusChangeDate.toISOString(),
      });
      toast.success(labels.shopStatusUpdateSuccess);
    } catch (error) {
      console.error("Error updating shop status:", error);
      toast.error(labels.shopStatusUpdateError);
    }
  };

  const shopOptions =
    shopsAll?.map((shop) => ({
      id: shop.id,
      label: `Shop ${shop.plaque} (Floor ${shop.floor})`,
    })) || [];

  const CustomInput = ({ openCalendar, value, handleValueChange }: any) => {
    return (
      <Input
        onFocus={openCalendar}
        value={value}
        onChange={handleValueChange}
        readOnly
      />
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{labels.changeShopActiveStatus}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shop">{labels.shop}</Label>
              <CustomSelect
                options={shopOptions}
                value={selectedShopId}
                onChange={setSelectedShopId}
                label={labels.shop}
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
                <div className="space-y-2">
                  <Label htmlFor="statusChangeDate" className="ml-2">
                    {labels.statusChangeDate}
                  </Label>
                  <DatePicker
                    calendar={persian}
                    locale={persian_fa}
                    calendarPosition="bottom-right"
                    value={statusChangeDate}
                    onChange={(date) => {
                      if (date) {
                        setStatusChangeDate(date.toDate());
                      } else {
                        setStatusChangeDate(null);
                      }
                    }}
                    render={<CustomInput />}
                    format="YYYY/MM/DD"
                  />
                </div>
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
    </div>
  );
}
