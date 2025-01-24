"use client";

import { useEffect, useState } from "react";
import { useFindAllShops, useFindAllPersons } from "@/tanstack/queries";
import { useUpdateShopRenter } from "@/tanstack/mutations";
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
import { labels } from "@/utils/label";

export default function UpdateShopRenterPage() {
  const [selectedShopId, setSelectedShopId] = useState("");
  const [selectedRenterId, setSelectedRenterId] = useState("");
  const [renterChangeDate, setRenterChangeDate] = useState<Date | null>(null);
  const [currentRenterName, setCurrentRenterName] = useState("");

  const { data: shopsData, isLoading: isLoadingShops } = useFindAllShops();
  const { data: personsData, isLoading: isLoadingPersons } =
    useFindAllPersons();
  const updateShopRenterMutation = useUpdateShopRenter();

  const { setShopsAll, shopsAll, personsAll, setPersonsAll } = useStore(
    useShallow((state) => ({
      shopsAll: state.shopsAll,
      setShopsAll: state.setshopsAll,
      personsAll: state.personsAll,
      setPersonsAll: state.setPersonAll,
    }))
  );

  useEffect(() => {
    if (shopsData?.data?.shops) {
      setShopsAll(shopsData.data.shops);
    }
    if (personsData?.data?.persons) {
      setPersonsAll(personsData.data.persons);
    }
  }, [shopsData, personsData, setShopsAll, setPersonsAll]);

  useEffect(() => {
    if (selectedShopId && shopsAll) {
      const selectedShop = shopsAll.find(shop => shop.id === selectedShopId);
      setCurrentRenterName(selectedShop?.renterName || "");
    }
  }, [selectedShopId, shopsAll]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShopId || !selectedRenterId || !renterChangeDate) {
      toast.error(labels.selectRequiredFieldsRenter);
      return;
    }
    try {
      await updateShopRenterMutation.mutateAsync({
        shopId: selectedShopId,
        renterId: selectedRenterId,
        startDate: renterChangeDate.toISOString(),
      });
      // Reset form after successful submission
      setSelectedShopId("");
      setSelectedRenterId("");
      setRenterChangeDate(null);
      setCurrentRenterName("");
    } catch (error) {
      console.error("Error updating shop renter:", error);
      toast.error(labels.renterUpdateError);
    }
  };

  const shopOptions = shopsAll?.map((shop) => ({
    id: shop.id,
    label: `Shop ${shop.plaque} (Floor ${shop.floor})`,
  })) || [];

  const personOptions = personsAll?.map((person) => ({
    id: person.id,
    label: `${person.firstName} ${person.lastName} (${person.IdNumber})`,
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
      <h1 className="text-3xl font-bold mb-8">{labels.updateShopRenter}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{labels.changeShopRenter}</CardTitle>
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
            <div className="space-y-2">
              <Label htmlFor="currentRenter">{labels.currentRenter}</Label>
              <Input
                id="currentRenter"
                disabled={true}
                value={currentRenterName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newRenter">{labels.newRenter}</Label>
              <CustomSelect
                options={personOptions}
                value={selectedRenterId}
                onChange={setSelectedRenterId}
                label={labels.newOwner}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="renterChangeDate" className="ml-2">{labels.renterChangeDate}</Label>
              <DatePicker
                calendar={persian}
                locale={persian_fa}
                calendarPosition="bottom-right"
                value={renterChangeDate}
                onChange={(date) => {
                  if (date) {
                    setRenterChangeDate(date.toDate());
                  } else {
                    setRenterChangeDate(null);
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
                updateShopRenterMutation.isPending ||
                !selectedShopId ||
                !selectedRenterId ||
                !renterChangeDate
              }
            >
              {updateShopRenterMutation.isPending
                ? labels.updatingRenter
                : labels.changeShopRenter}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

