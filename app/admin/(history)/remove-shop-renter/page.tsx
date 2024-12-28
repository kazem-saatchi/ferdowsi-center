"use client";

import { useEffect, useState } from "react";
import { useFindAllShops } from "@/tanstack/queries";
import { useEndShopRenter } from "@/tanstack/mutations";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";
import { CustomSelect } from "@/components/CustomSelect";
import { Input } from "@/components/ui/input";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import { Label } from "@/components/ui/label";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

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
      const selectedShop = shopsAll.find(shop => shop.id === selectedShopId);
      setCurrentRenterName(selectedShop?.renterName || "No current renter");
      setCurrentRenterId(selectedShop?.renterId || "");
    }
  }, [selectedShopId, shopsAll]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShopId || !currentRenterId || !endDate) {
      toast.error("Please select a shop with a renter and provide an end date");
      return;
    }
    try {
      await endShopRenterMutation.mutateAsync({
        shopId: selectedShopId,
        renterId: currentRenterId,
        endDate: endDate.toISOString(),
      });
      toast.success("Shop renter removed successfully");
      // Reset form after successful submission
      setSelectedShopId("");
      setCurrentRenterName("");
      setCurrentRenterId("");
      setEndDate(null);
    } catch (error) {
      console.error("Error removing shop renter:", error);
      toast.error("Failed to remove shop renter");
    }
  };

  const shopOptions = shopsAll?.map((shop) => ({
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
      <h1 className="text-3xl font-bold mb-8">Remove Shop Renter</h1>
      <Card>
        <CardHeader>
          <CardTitle>End Rental Agreement</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shop">Shop</Label>
              <CustomSelect
                options={shopOptions}
                value={selectedShopId}
                onChange={setSelectedShopId}
                label="Shop"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentRenter">Current Renter</Label>
              <Input
                id="currentRenter"
                disabled={true}
                value={currentRenterName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Rental End Date</Label>
              <DatePicker
                calendar={persian}
                locale={persian_fa}
                calendarPosition="bottom-right"
                value={endDate}
                onChange={(date) => {
                  if (date) {
                    setEndDate(date.toDate());
                  } else {
                    setEndDate(null);
                  }
                }}
                render={<CustomInput />}
                format="YYYY/MM/DD"
              />
            </div>
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
                ? "Removing Renter..."
                : "Remove Renter"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

