import React, { useState } from "react";
import { CardContent, CardFooter } from "../ui/card";
import { Label } from "../ui/label";
import { CustomSelect } from "../CustomSelect";
import { Input } from "../ui/input";
import JalaliDayCalendar from "../calendar/JalaliDayCalendar";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { labels } from "@/utils/label";
import UploadImage from "../upload-file/UploadImage";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import { AddPaymentByInfoData, addPaymentByInfoSchema, PaymentType } from "@/schema/paymentSchema";
import { formatNumberFromString } from "@/utils/formatNumber";
import { useAddPaymentByShop } from "@/tanstack/mutation/paymentMutation";
import { toast } from "sonner";



function AddPaymentForm() {
  //---------- States For Form ----------//
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

  //---------- State For Shop and Person ----------//
  const { shopsAll, personsAll } = useStore(
    useShallow((state) => ({
      shopsAll: state.shopsAll,
      personsAll: state.personsAll,
    }))
  );

  //---------- Utils For Displaying ----------//
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

  //---------- End of Utils For Displaying ----------//

  //---------- Mutation Function ----------//

  const addPaymentMutation = useAddPaymentByShop();

  const { isPending } = addPaymentMutation; // For Disabling Button

  //---------- Function For Submiting Payment ----------//
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

  return (
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
                value={
                  shopsAll.find((shop) => shop.id === selectedShopId)?.ownerName
                }
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="renter">{labels.renterName}</Label>
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
          <Label htmlFor="person">{labels.payingPerson}</Label>
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
              <SelectItem value="BANK_TRANSFER">
                {labels.bankTransfer}
              </SelectItem>
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
            fileName={selectedShopId}
            setUploadPage={setUploadPage}
            setImageUrl={setReceiptImageUrl}
            folderName="payment-image"
          />
        )}
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          className="w-full"
          disabled={
            isPending ||
            !selectedShopId ||
            !selectedPersonId ||
            !paymentDate ||
            !amount
          }
        >
          {isPending ? labels.submitting : labels.submit}
        </Button>
      </CardFooter>
    </form>
  );
}

export default AddPaymentForm;
