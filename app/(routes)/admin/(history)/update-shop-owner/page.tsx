"use client";

import { useEffect, useState } from "react";
import { useFindAllShops, useFindAllPersons } from "@/tanstack/queries";
import { useUpdateShopOwner } from "@/tanstack/mutations";
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
import JalaliDayCalendar from "@/components/calendar/JalaliDayCalendar";

export default function UpdateShopOwnerPage() {
  const [selectedShopId, setSelectedShopId] = useState("");
  const [selectedOwnerId, setSelectedOwnerId] = useState("");
  const [ownerChangeDate, setOwnerChangeDate] = useState<Date | null>(null);
  const [currentOwnerName, setCurrentOwnerName] = useState("");

  const { data: shopsData, isLoading: isLoadingShops } = useFindAllShops();
  const { data: personsData, isLoading: isLoadingPersons } =
    useFindAllPersons();
  const updateShopOwnerMutation = useUpdateShopOwner();

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
      setCurrentOwnerName(selectedShop?.ownerName || "");
    }
  }, [selectedShopId, shopsAll]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShopId || !selectedOwnerId || !ownerChangeDate) {
      toast.error(
        "Please select a shop, a new owner, and provide a change date"
      );
      return;
    }
    try {
      await updateShopOwnerMutation.mutateAsync({
        shopId: selectedShopId,
        ownerId: selectedOwnerId,
        startDate: ownerChangeDate.toISOString(),
      });
      // Reset form after successful submission
      setSelectedShopId("");
      setSelectedOwnerId("");
      setOwnerChangeDate(null);
      setCurrentOwnerName("");
      toast.success("Shop owner updated successfully");
    } catch (error) {
      console.error("Error updating shop owner:", error);
      toast.error("Failed to update shop owner");
    }
  };

  const shopOptions =
    shopsAll?.map((shop) => ({
      id: shop.id,
      label: `Shop ${shop.plaque} (Floor ${shop.floor})`,
    })) || [];

  const personOptions =
    personsAll?.map((person) => ({
      id: person.id,
      label: `${person.firstName} ${person.lastName} (${person.IdNumber})`,
    })) || [];



  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Update Shop Owner</h1>
      <Card>
        <CardHeader>
          <CardTitle>Change Shop Owner</CardTitle>
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
              <Label htmlFor="currentOwner">Current Owner</Label>
              <Input
                id="currentOwner"
                disabled={true}
                value={currentOwnerName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newOwner">New Owner</Label>
              <CustomSelect
                options={personOptions}
                value={selectedOwnerId}
                onChange={setSelectedOwnerId}
                label="New Owner"
              />
            </div>
            <JalaliDayCalendar
              date={ownerChangeDate}
              setDate={setOwnerChangeDate}
              title="Owner Change Date"
            />
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={
                updateShopOwnerMutation.isPending ||
                !selectedShopId ||
                !selectedOwnerId ||
                !ownerChangeDate
              }
            >
              {updateShopOwnerMutation.isPending
                ? "Updating Owner..."
                : "Update Shop Owner"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
