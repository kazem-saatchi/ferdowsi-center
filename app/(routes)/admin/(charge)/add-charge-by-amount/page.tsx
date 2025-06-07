"use client";

import { useEffect, useState } from "react";
import { useFindAllShops, useFindAllPersons } from "@/tanstack/queries";
import { useAddChargeByAmount } from "@/tanstack/mutation/chargeMutation";
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
import {
  addChargeByAmountSchema,
  AddChargeByAmountData,
} from "@/schema/chargeSchema";
import { formatNumberFromString } from "@/utils/formatNumber";
import { Textarea } from "@/components/ui/textarea";
import { labels } from "@/utils/label";

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
      label: `Shop ${shop.plaque} (Floor ${shop.floor})`,
    })) || [];

  const personOptions =
    personsAll?.map((person) => ({
      id: person.id,
      label: `${person.firstName} ${person.lastName} (${person.IdNumber})`,
    })) || [];

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const { formattedPersianNumber, formattedNumber } =
      formatNumberFromString(value);

    setAmountPersian(formattedPersianNumber);
    setAmount(formattedNumber);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{labels.addChargeByAmount}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{labels.chargeDetails}</CardTitle>
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
              <CustomSelect
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
              <Button
                id="proprietor"
                variant={proprietor ? "destructive" : "outline"}
                type="button"
                onClick={() => setProprietor((prev) => !prev)}
              >
                {proprietor ? labels.proprietorCharge : labels.monthlyCharge}
              </Button>
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
          <CardFooter>
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
      </Card>
    </div>
  );
}
