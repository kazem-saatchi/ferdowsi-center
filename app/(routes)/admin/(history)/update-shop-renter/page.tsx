"use client";
import { toPersianDigits } from "@/utils/formatNumber";

import { formatJalaliDate } from "@/utils/localeDate";
import { useEffect, useState } from "react";
import { useUpdateShopRenter } from "@/tanstack/mutation/shopMutation";
import { useFindAllShops } from "@/tanstack/query/shopQuery";
import { useFindAllPersons } from "@/tanstack/query/personQuery";
import { Button } from "@/components/ui/button";
import {
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
      const selectedShop = shopsAll.find((shop) => shop.id === selectedShopId);
      setCurrentRenterName(selectedShop?.renterName || "");
    }
  }, [selectedShopId, shopsAll]);

  const { confirm, dialog } = useConfirm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShopId || !selectedRenterId || !renterChangeDate) {
      toast.error(labels.selectRequiredFieldsRenter);
      return;
    }
    const shop = shopsAll?.find((s) => s.id === selectedShopId);
    const person = personsAll?.find((p) => p.id === selectedRenterId);
    const ok = await confirm({
      title: labels.confirmRenterChangeTitle,
      description: `${shop ? shopOptionLabel(shop) : ""} — ${labels.newRenter}: ${
        person ? `${person.firstName} ${person.lastName}` : ""
      } ${labels.fromDate} ${formatJalaliDate(renterChangeDate)}`,
    });
    if (!ok) return;
    // The mutation hook toasts the server's own success or error message.
    try {
      const result = await updateShopRenterMutation.mutateAsync({
        shopId: selectedShopId,
        renterId: selectedRenterId,
        startDate: renterChangeDate.toISOString(),
      });
      // Keep the input when the server refused the change.
      if (!result.success) return;
      // Reset form after successful submission
      setSelectedShopId("");
      setSelectedRenterId("");
      setRenterChangeDate(null);
      setCurrentRenterName("");
    } catch (error) {
      console.error("Error updating shop renter:", error);
    }
  };

  const shopOptions =
    shopsAll?.map((shop) => ({
      id: shop.id,
      label: shopOptionLabel(shop),
    })) || [];

  const personOptions =
    personsAll?.map((person) => ({
      id: person.id,
      label: `${person.firstName} ${person.lastName} (${toPersianDigits(person.IdNumber)})`,
    })) || [];


  return (
    <div className="max-w-2xl">
      <div>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle>{labels.updateShopRenter}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0 space-y-4">
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
              <Label htmlFor="currentRenter">{labels.currentRenter}</Label>
              <Input
                id="currentRenter"
                disabled={true}
                value={currentRenterName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newRenter">{labels.newRenter}</Label>
              <CustomSelect id="newRenter"
                options={personOptions}
                value={selectedRenterId}
                onChange={setSelectedRenterId}
                label={labels.newRenter}
              />
            </div>
            <JalaliDayCalendar
              id="renterChangeDate"
              title={labels.renterChangeDate}
              date={renterChangeDate}
              setDate={setRenterChangeDate}
            />
          </CardContent>
          <CardFooter className="p-3 pt-0 sm:p-6 sm:pt-0">
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
      </div>
      {dialog}
    </div>
  );
}
