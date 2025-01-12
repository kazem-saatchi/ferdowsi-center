"use client";

import { useEffect, useState } from "react";
import { useFindAllShops, useFindAllPersons } from "@/tanstack/queries";
import { useAddPaymentByShop } from "@/tanstack/mutations";
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
  addPaymentByInfoSchema,
  AddPaymentByInfoData,
} from "@/schema/paymentSchema";
import { formatNumberFromString } from "@/utils/formatNumber";

export default function AddPaymentPage() {
  const [selectedShopId, setSelectedShopId] = useState("");
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [paymentDate, setPaymentDate] = useState<Date | null>(null);
  const [amount, setAmount] = useState("");
  const [amountPersian, setAmountPersian] = useState("");

  const { data: shopsData, isLoading: isLoadingShops } = useFindAllShops();
  const { data: personsData, isLoading: isLoadingPersons } =
    useFindAllPersons();
  const addPaymentMutation = useAddPaymentByShop();

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
    if (!selectedShopId || !selectedPersonId || !paymentDate || !amount) {
      toast.error(
        "Please select a shop, a person, provide a payment date, and enter an amount"
      );
      return;
    }
    try {
      const paymentData: AddPaymentByInfoData = {
        shopId: selectedShopId,
        personId: selectedPersonId,
        date: paymentDate,
        amount: parseInt(amount, 10),
      };

      const validatedData = addPaymentByInfoSchema.parse(paymentData);
      const result = await addPaymentMutation.mutateAsync(validatedData);

      if (result.success) {
        toast.success("Payment added successfully");
        // Reset form after successful submission
        setSelectedShopId("");
        setSelectedPersonId("");
        setPaymentDate(null);
        setAmount("");
      } else {
        toast.error(result.message || "Failed to add payment");
      }
    } catch (error) {
      console.error("Error adding payment:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to add payment");
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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const { formattedPersianNumber, formattedNumber } =
      formatNumberFromString(value);

    setAmountPersian(formattedPersianNumber);
    setAmount(formattedNumber);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Add Payment</h1>
      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
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
            {selectedShopId !== "" && shopsAll && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="owner">Owner Name</Label>
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
                  <Label htmlFor="renter">Renter Name</Label>
                  <Input
                    id="renter"
                    type="text"
                    value={
                      shopsAll.find((shop) => shop.id === selectedShopId)
                        ?.renterName || ""
                    }
                    disabled
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="person">Person</Label>
              <CustomSelect
                options={personOptions}
                value={selectedPersonId}
                onChange={setSelectedPersonId}
                label="Person"
              />
            </div>
            {selectedShopId !== "" &&
              selectedPersonId !== "" &&
              shopsAll?.find((shop) => shop.id === selectedShopId)?.ownerId !==
                selectedPersonId &&
              shopsAll?.find((shop) => shop.id === selectedShopId)?.renterId !==
                selectedPersonId && (
                <>
                  <p className="text-red-400">The selected person in not shop owner or renter</p>
                </>
              )}
            <JalaliDayCalendar
              date={paymentDate}
              setDate={setPaymentDate}
              title="Payment Date"
            />
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="text"
                value={amountPersian}
                onChange={handleChange}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={
                addPaymentMutation.isPending ||
                !selectedShopId ||
                !selectedPersonId ||
                !paymentDate ||
                !amount
              }
            >
              {addPaymentMutation.isPending
                ? "Adding Payment..."
                : "Add Payment"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
