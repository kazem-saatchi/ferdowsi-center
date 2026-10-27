"use client";
import { toPersianDigits } from "@/utils/formatNumber";

import { formatJalaliDate } from "@/utils/localeDate";
import { useEffect, useState } from "react";
import { useFindAllShops } from "@/tanstack/query/shopQuery";
import { useFindAllPersons } from "@/tanstack/query/personQuery";
import { useUpdateShopOwner } from "@/tanstack/mutation/shopMutation";
import { Button } from "@/components/ui/button";
import {
  Page,
  PageHeader,
  PageTitle,
  PageBody,
  PageFooter,
} from "@/components/layout/Page";
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

  const { confirm, dialog } = useConfirm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShopId || !selectedOwnerId || !ownerChangeDate) {
      toast.error(labels.selectRequiredFields);
      return;
    }
    const shop = shopsAll?.find((s) => s.id === selectedShopId);
    const person = personsAll?.find((p) => p.id === selectedOwnerId);
    const ok = await confirm({
      title: labels.confirmOwnerChangeTitle,
      description: `${shop ? shopOptionLabel(shop) : ""} — ${labels.newOwner}: ${
        person ? `${person.firstName} ${person.lastName}` : ""
      } ${labels.fromDate} ${formatJalaliDate(ownerChangeDate)}`,
    });
    if (!ok) return;
    // The mutation hook toasts the server's own success or error message.
    try {
      const result = await updateShopOwnerMutation.mutateAsync({
        shopId: selectedShopId,
        ownerId: selectedOwnerId,
        startDate: ownerChangeDate.toISOString(),
      });
      // Keep the input when the server refused the change.
      if (!result.success) return;
      // Reset form after successful submission
      setSelectedShopId("");
      setSelectedOwnerId("");
      setOwnerChangeDate(null);
      setCurrentOwnerName("");
    } catch (error) {
      console.error("Error updating shop owner:", error);
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
    <Page width="form">
      <div>
        <PageHeader>
          <PageTitle>{labels.updateShopOwner}</PageTitle>
        </PageHeader>
        <form onSubmit={handleSubmit}>
          <PageBody className="space-y-4">
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
              <Label htmlFor="currentOwner">{labels.currentOwner}</Label>
              <Input
                id="currentOwner"
                disabled={true}
                value={currentOwnerName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newOwner">{labels.newOwner}</Label>
              <CustomSelect id="newOwner"
                options={personOptions}
                value={selectedOwnerId}
                onChange={setSelectedOwnerId}
                label={labels.newOwner}
              />
            </div>
            <JalaliDayCalendar
              date={ownerChangeDate}
              setDate={setOwnerChangeDate}
              title={labels.ownerChangeDate}
            />
          </PageBody>
          <PageFooter>
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
                ? labels.updatingOwner
                : labels.updateShopOwner}
            </Button>
          </PageFooter>
        </form>
      </div>
      {dialog}
    </Page>
  );
}
