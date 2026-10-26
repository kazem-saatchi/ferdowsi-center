"use client";
import { toPersianDigits } from "@/utils/formatNumber";

import { useEffect, useState } from "react";
import { useFindAllShops } from "@/tanstack/query/shopQuery";
import { useFindAllPersons } from "@/tanstack/query/personQuery";
import { useAddChargeByAmount } from "@/tanstack/mutation/chargeMutation";
import { Button } from "@/components/ui/button";
import {
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
import { Switch } from "@/components/ui/switch";
import JalaliDayCalendar from "@/components/calendar/JalaliDayCalendar";
import {
  addChargeByAmountSchema,
  AddChargeByAmountData,
} from "@/schema/chargeSchema";
import { formatNumberFromString } from "@/utils/formatNumber";
import { Textarea } from "@/components/ui/textarea";
import { labels } from "@/utils/label";

import { shopOptionLabel } from "@/utils/shopType";
export default function AddChargeByAmountPage() {
  const [selectedShopId, setSelectedShopId] = useState("");
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [chargeDate, setChargeDate] = useState<Date | null>(null);
  const [amount, setAmount] = useState("");
  const [amountPersian, setAmountPersian] = useState("");
  const [title, setTitle] = useState("");
  const [proprietor, setProprietor] = useState<boolean>(false);
  const [description, setDescription] = useState<string>("");

  const { data: shopsData, isLoading: isLoadingShops } = useFindAllShops();
  const { data: personsData, isLoading: isLoadingPersons } =
    useFindAllPersons();
  const addChargeMutation = useAddChargeByAmount();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !selectedShopId ||
      !selectedPersonId ||
      !chargeDate ||
      !amount ||
      !title
    ) {
      toast.error(labels.fillRequiredFields);
      return;
    }
    try {
      const chargeData: AddChargeByAmountData = {
        shopId: selectedShopId,
        personId: selectedPersonId,
        date: chargeDate,
        amount: parseInt(amount, 10),
        title: title,
        proprietor,
        description,
      };

      const validatedData = addChargeByAmountSchema.parse(chargeData);
      const result = await addChargeMutation.mutateAsync(validatedData);

      if (result.success) {
        // Reset form after successful submission
        setSelectedShopId("");
        setSelectedPersonId("");
        setChargeDate(null);
        setAmount("");
        setAmountPersian("");
        setTitle("");
        setProprietor(false);
      } else {
        toast.error(result.message || labels.failedToAddCharge);
      }
    } catch (error) {
      console.error("Error adding charge:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(labels.failedToAddCharge);
      }
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

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const { formattedPersianNumber, formattedNumber } =
      formatNumberFromString(value);

    setAmountPersian(formattedPersianNumber);
    setAmount(formattedNumber);
  };

  return (
    <div className="max-w-2xl">
      <div>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle>{labels.addChargeByAmount}</CardTitle>
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
            {selectedShopId !== "" && shopsAll && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="owner">{labels.owner}</Label>
                  <Input
                    id="owner"
                    type="text"
                    value={
                      shopsAll.find((shop) => shop.id === selectedShopId)
                        ?.ownerName
                    }
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="renter">{labels.renter}</Label>
                  <Input
                    id="renter"
                    type="text"
                    value={
                      shopsAll.find((shop) => shop.id === selectedShopId)
                        ?.renterName || labels.noRenter
                    }
                    disabled
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="person">{labels.personName}</Label>
              <CustomSelect id="person"
                options={personOptions}
                value={selectedPersonId}
                onChange={setSelectedPersonId}
                label={labels.person}
              />
            </div>
            {selectedShopId !== "" &&
              selectedPersonId !== "" &&
              shopsAll?.find((shop) => shop.id === selectedShopId)?.ownerId !==
                selectedPersonId &&
              shopsAll?.find((shop) => shop.id === selectedShopId)?.renterId !==
                selectedPersonId && (
                <p className="text-red-400">{labels.personNotOwnerOrRenter}</p>
              )}
            <JalaliDayCalendar
              date={chargeDate}
              setDate={setChargeDate}
              title={labels.chargeDate}
            />
            <div className="space-y-2">
              <Label htmlFor="amount">{labels.amount}</Label>
              <Input
                id="amount"
                type="text"
                value={amountPersian}
                onChange={handleAmountChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">{labels.title}</Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-row gap-2 items-center">
              <Label htmlFor="proprietor">{labels.paymentCategory}</Label>
              <Switch
                id="proprietor"
                checked={proprietor}
                onCheckedChange={setProprietor}
              />
              <span className="text-sm">
                {proprietor ? labels.proprietorCharge : labels.monthlyCharge}
              </span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{labels.description}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="p-3 pt-0 sm:p-6 sm:pt-0">
            <Button
              type="submit"
              className="w-full"
              disabled={
                addChargeMutation.isPending ||
                !selectedShopId ||
                !selectedPersonId ||
                !chargeDate ||
                !amount ||
                !title
              }
            >
              {addChargeMutation.isPending
                ? labels.addingCharge
                : labels.addCharge}
            </Button>
          </CardFooter>
        </form>
      </div>
    </div>
  );
}
