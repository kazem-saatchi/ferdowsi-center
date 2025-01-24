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
  PaymentType,
} from "@/schema/paymentSchema";
import { formatNumberFromString } from "@/utils/formatNumber";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UploadImage from "@/components/upload-file/UploadImage";
import { labels } from "@/utils/label";

export default function AddPaymentPage() {
  const [selectedShopId, setSelectedShopId] = useState("");
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [paymentDate, setPaymentDate] = useState<Date | null>(null);
  const [amount, setAmount] = useState("");
  const [amountPersian, setAmountPersian] = useState("");
  const [description, setDescription] = useState("");
  const [receiptImageUrl, setReceiptImageUrl] = useState("");
  const [proprietor, setProprietor] = useState<boolean>(false);
  const [type, setType] = useState<PaymentType>("CASH");
  const [uploadPage, setUploadPage] = useState<boolean>(false);

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
      toast.error(labels.selectRequiredFieldsPayment);
      return;
    }
    try {
      const paymentData: AddPaymentByInfoData = {
        shopId: selectedShopId,
        personId: selectedPersonId,
        date: paymentDate,
        amount: parseInt(amount, 10),
        description,
        receiptImageUrl,
        proprietor,
        type,
      };

      const validatedData = addPaymentByInfoSchema.parse(paymentData);

      if (type !== "CASH" && type !== "OTHER" && receiptImageUrl === "") {
        toast.error(labels.receiptRequired);
      } else {
        const result = await addPaymentMutation.mutateAsync(validatedData);

        if (result.success) {
          toast.success(labels.paymentAddedSuccess);
          // Reset form after successful submission
          setSelectedShopId("");
          setSelectedPersonId("");
          setPaymentDate(null);
          setAmount("");
          setAmountPersian("");
          setType("CASH");
          setDescription("");
          setProprietor(false);
          setUploadPage(false);
        } else {
          toast.error(result.message || labels.paymentAddedError);
        }
      }
    } catch (error) {
      console.error("Error adding payment:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(labels.paymentAddedError);
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
      <h1 className="text-3xl font-bold mb-8">{labels.addPayment}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{labels.paymentDetails}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shop">{labels.selectUnit}</Label>
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
                  <Label htmlFor="owner">{labels.ownerName}</Label>
                  <Input
                    id="owner"
                    type="text"
                    value={shopsAll.find((shop) => shop.id === selectedShopId)?.ownerName}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="renter">{labels.renterName}</Label>
                  <Input
                    id="renter"
                    type="text"
                    value={shopsAll.find((shop) => shop.id === selectedShopId)?.renterName || ""}
                    disabled
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="person">{labels.payingPerson}</Label>
              <CustomSelect
                options={personOptions}
                value={selectedPersonId}
                onChange={setSelectedPersonId}
                label="Person"
              />
            </div>
            {selectedShopId !== "" && selectedPersonId !== "" && 
              shopsAll?.find((shop) => shop.id === selectedShopId)?.ownerId !== selectedPersonId &&
              shopsAll?.find((shop) => shop.id === selectedShopId)?.renterId !== selectedPersonId && (
                <p className="text-red-400">{labels.personNotOwnerOrRenter}</p>
              )}
            <JalaliDayCalendar
              date={paymentDate}
              setDate={setPaymentDate}
              title={labels.paymentDate}
            />
            <div className="space-y-2">
              <Label htmlFor="amount">{labels.amountInRials}</Label>
              <Input
                id="amount"
                type="text"
                value={amountPersian}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex flex-row gap-2 items-center">
              <Label htmlFor="proprietor">{labels.chargeType}</Label>
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
            <div className="space-y-2">
              <Label htmlFor="type">{labels.paymentMethod}</Label>
              <Select
                defaultValue="CASH"
                onValueChange={(value) => setType(value as PaymentType)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Theme" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="CASH">{labels.cash}</SelectItem>
                  <SelectItem value="CHEQUE">{labels.cheque}</SelectItem>
                  <SelectItem value="POS_MACHINE">{labels.posDevice}</SelectItem>
                  <SelectItem value="BANK_TRANSFER">{labels.bankTransfer}</SelectItem>
                  <SelectItem value="OTHER">{labels.otherMethods}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {["BANK_TRANSFER", "CHEQUE", "POS_MACHINE"].includes(type) && (
              <Button
                variant="secondary"
                type="button"
                onClick={() => setUploadPage((prev) => !prev)}
              >
                {labels.uploadReceiptImage}
              </Button>
            )}
            {uploadPage && (
              <UploadImage
                shopId={selectedShopId}
                setUploadPage={setUploadPage}
                setImageUrl={setReceiptImageUrl}
              />
            )}
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={addPaymentMutation.isPending || !selectedShopId || !selectedPersonId || !paymentDate || !amount}
            >
              {addPaymentMutation.isPending ? labels.submitting : labels.submit}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
