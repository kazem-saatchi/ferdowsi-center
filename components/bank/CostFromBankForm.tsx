"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { useAddCostFromBank } from "@/tanstack/mutations";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import JalaliDayCalendar from "@/components/calendar/JalaliDayCalendar";
import {
  AddCostFromBankData,
  addCostFromBankSchema,
  addCostSchema,
  type AddCostData,
} from "@/schema/cost-IncomeSchema";
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

interface CostFromBankFormProps {
  amount: number;
  bankTransactionId: string;
  date: Date;
  description?: string;
  cancelFn: Dispatch<SetStateAction<string | null>>;
}

export default function CostFromBankForm({
  amount,
  bankTransactionId,
  cancelFn,
  date,
  description,
}: CostFromBankFormProps) {
  // Extract the type of the `category` field
  type CategoryType = AddCostData["category"];

  const [title, setTitle] = useState("");
  const [costDate, setCostDate] = useState<Date | null>(date);
  const [category, setCategory] = useState<CategoryType>("OTHER");
  const [billImageUrl, setBillImageUrl] = useState("");
  const [proprietor, setProprietor] = useState<boolean>(false);
  const [uploadPage, setUploadPage] = useState<boolean>(false);

  const addCostMutation = useAddCostFromBank();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !costDate || !category) {
      // Note: We're not using toast here as per the user's request
      console.error(labels.selectRequiredFieldsCost);
      return;
    }
    try {
      const costData: AddCostFromBankData = {
        title,
        amount,
        date: costDate,
        description,
        category: category,
        billImage: billImageUrl,
        proprietor,
        bankTransactionId,
      };

      const validatedData = addCostFromBankSchema.parse(costData);
      const result = await addCostMutation.mutateAsync(validatedData);
      if (result.success) {
        // Reset form after successful submission
        setTitle("");
        setCostDate(null);
        setCategory("OTHER");
        setBillImageUrl("");
        setProprietor(false);
        setUploadPage(false);
      }
    } catch (error) {
      console.error(labels.costAddedError, error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{labels.addCost}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{labels.costDetails}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{labels.title}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">{labels.amountInRials}</Label>
              <Input
                id="amount"
                type="text"
                value={
                  formatNumberFromString(String(amount)).formattedPersianNumber
                }
                disabled
              />
            </div>
            <JalaliDayCalendar
              date={costDate}
              setDate={setCostDate}
              title={labels.costDate}
            />
            <div className="space-y-2">
              <Label htmlFor="description">{labels.description}</Label>
              <Textarea id="description" value={description} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">{labels.costCategory}</Label>
              <Select
                onValueChange={(value) => setCategory(value as CategoryType)}
                dir="rtl"
                defaultValue="OTHER"
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={labels.selectType} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ELECTRICITY">
                    {labels.electricity}
                  </SelectItem>
                  <SelectItem value="WATER">{labels.water}</SelectItem>
                  <SelectItem value="GAS">{labels.gas}</SelectItem>
                  <SelectItem value="ELEVATOR">{labels.elevator}</SelectItem>
                  <SelectItem value="ESCALATOR">{labels.escalator}</SelectItem>
                  <SelectItem value="CHILLER">{labels.chiller}</SelectItem>
                  <SelectItem value="CLEANING">{labels.cleaning}</SelectItem>
                  <SelectItem value="SECURITY">{labels.security}</SelectItem>
                  <SelectItem value="OTHER">{labels.other}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-row gap-2 items-center">
              <Label htmlFor="proprietor">{labels.costFrom}</Label>
              <Button
                id="proprietor"
                variant={proprietor ? "destructive" : "outline"}
                type="button"
                onClick={() => setProprietor((prev) => !prev)}
              >
                {proprietor ? labels.proprietorCharge : labels.monthlyCharge}
              </Button>
            </div>
            <Button
              variant="secondary"
              type="button"
              onClick={() => setUploadPage((prev) => !prev)}
            >
              {labels.uploadBillImage}
            </Button>
            {uploadPage && (
              <UploadImage
                fileName={title}
                setUploadPage={setUploadPage}
                setImageUrl={setBillImageUrl}
                folderName="cost-image"
              />
            )}
          </CardContent>
          <CardFooter className="flex flex-row items-center justify-start gap-2">
            <Button variant="destructive" onClick={() => cancelFn(null)}>
              {labels.close}
            </Button>
            <Button
              type="submit"
              className="w-full"
              disabled={addCostMutation.isPending}
            >
              {addCostMutation.isPending
                ? labels.addingCost
                : labels.addCostButton}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
