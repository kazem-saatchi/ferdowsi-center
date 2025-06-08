import React, { Dispatch, SetStateAction, useState } from "react";
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
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import {
  addPaymentByBankIdData,
  addPaymentByBankIdSchema,
  PaymentType,
} from "@/schema/paymentSchema";
import { formatNumberFromString } from "@/utils/formatNumber";
import { useAddPaymentByBank, useAddPaymentByShop } from "@/tanstack/mutation/paymentMutation";
import { toast } from "sonner";
import SetRegisterAbleButton from "../bank/SetRegisterAbleButton";
import { Separator } from "../ui/separator";

interface AddPaymentProps {
  bankTransactionId: string;
  description: string;
  amount: number;
  date: Date;
  cancelFn: Dispatch<SetStateAction<string | null>>;
}

function AddPaymentBankForm({
  amount: amountValue,
  bankTransactionId,
  description: descriptionValue,
  date,
  cancelFn,
}: AddPaymentProps) {
  //---------- States For Form ----------//
  const [selectedShopId, setSelectedShopId] = useState("");
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [paymentDate, setPaymentDate] = useState<Date | null>(date);
  const [amount, setAmount] = useState(amountValue.toString());
  const [amountPersian, setAmountPersian] = useState(
    formatNumberFromString(amountValue.toString()).formattedPersianNumber
  );
  const [description, setDescription] = useState(descriptionValue);
  const [proprietor, setProprietor] = useState<boolean>(false);
  const [type, setType] = useState<PaymentType>("BANK_TRANSFER");
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

  const addPaymentMutation = useAddPaymentByBank();

  const { isPending } = addPaymentMutation; // For Disabling Button

  //---------- Function For Submiting Payment ----------//
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShopId || !selectedPersonId || !paymentDate || !amount) {
      toast.error(labels.selectRequiredFieldsPayment);
      return;
    }
    try {
      const paymentData: addPaymentByBankIdData = {
        shopId: selectedShopId,
        personId: selectedPersonId,
        date: paymentDate,
        amount: parseInt(amount, 10),
        description,
        proprietor,
        type,
        bankTransactionId,
      };

      const validatedData = addPaymentByBankIdSchema.parse(paymentData);

      const result = await addPaymentMutation.mutateAsync(validatedData);

      if (result.success) {
        cancelFn(null);
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
          disabled={true}
        />
        <div className="space-y-2">
          <Label htmlFor="amount">{labels.amountInRials}</Label>
          <Input
            id="amount"
            type="text"
            value={amountPersian}
            onChange={handleChange}
            required
            disabled={true}
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
            disabled={true}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">{labels.paymentMethod}</Label>
          <Select
            defaultValue="BANK_TRANSFER"
            onValueChange={(value) => setType(value as PaymentType)}
            disabled={true}
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
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-2">
        <div className="flex w-full flex-row items-center gap-2">
          <Button
            onClick={() => {
              cancelFn(null);
            }}
            variant="secondary"
            className="w-44"
          >
            {labels.close}
          </Button>
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
        </div>
        <div className="flex w-full flex-col items-start justify-start gap-2">
          <Separator />
          <span className="w-full border p-2 rounded-md">
            {labels.setAsRegisterableInfo}
          </span>
          <SetRegisterAbleButton id={bankTransactionId} cancelFn={cancelFn} />
        </div>
      </CardFooter>
    </form>
  );
}

export default AddPaymentBankForm;
